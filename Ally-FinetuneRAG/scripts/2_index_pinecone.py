"""
Index Philippine Supreme Court cases into Pinecone
Optimized for Philippines → US East-1 (high latency)

Usage:
    python scripts/2_index_pinecone.py
    python scripts/2_index_pinecone.py --batch-size 250 --create-index
    python scripts/2_index_pinecone.py --start-from 1000
    python scripts/2_index_pinecone.py --dry-run

Features:
    - Auto-resume from checkpoint on interruption
    - Optimized for high-latency connections (PH → US)
    - Connection pooling and async uploads
    - Detailed progress tracking
    - Network error recovery
"""

from pinecone import Pinecone, ServerlessSpec
from sentence_transformers import SentenceTransformer
import json
import os
import argparse
import time
from tqdm import tqdm
from dotenv import load_dotenv
from typing import List, Dict
import urllib3

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()

# Configuration
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME')
PINECONE_ENVIRONMENT = os.getenv('PINECONE_ENVIRONMENT')
CHUNKS_FILE = "./processed-for-rag/chunks.jsonl"
CHECKPOINT_FILE = "./processed-for-rag/pinecone_upload_checkpoint.json"

# Metadata field size limits (Pinecone restrictions)
MAX_METADATA_TEXT_LENGTH = 40000
MAX_TOTAL_METADATA_SIZE = 40000

# Optimize for high latency (Philippines → US East-1)
OPTIMIZE_FOR_HIGH_LATENCY = True


def print_header():
    """Print script header with location info."""
    print("=" * 80)
    print("📤 PINECONE INDEXING - PHILIPPINE SUPREME COURT CASES")
    print("=" * 80)
    print("📍 Location: Philippines")
    print("🌏 Target Region: US East-1")
    print("⚠️  Expected latency: ~200-250ms per request")
    print("⚡ Optimizations: Async uploads, connection pooling, smart batching")
    print("=" * 80)


def load_checkpoint() -> int:
    """Load the last processed chunk index from checkpoint file."""
    if os.path.exists(CHECKPOINT_FILE):
        try:
            with open(CHECKPOINT_FILE, 'r') as f:
                data = json.load(f)
                last_index = data.get('last_processed_index', 0)
                if last_index > 0:
                    timestamp = data.get('timestamp', 'unknown')
                    print(f"📍 Found checkpoint from {timestamp}")
                return last_index
        except Exception as e:
            print(f"⚠️  Warning: Could not load checkpoint: {e}")
    return 0


def save_checkpoint(index: int, total: int):
    """Save progress checkpoint."""
    try:
        with open(CHECKPOINT_FILE, 'w') as f:
            json.dump({
                'last_processed_index': index,
                'total_chunks': total,
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                'region': PINECONE_ENVIRONMENT
            }, f, indent=2)
    except Exception as e:
        print(f"⚠️  Warning: Could not save checkpoint: {e}")


def truncate_text(text: str, max_length: int = MAX_METADATA_TEXT_LENGTH) -> str:
    """Safely truncate text to fit Pinecone metadata limits."""
    if not text:
        return ""
    if len(text) <= max_length:
        return text
    return text[:max_length - 3] + "..."


def create_index_if_not_exists(pc: Pinecone, index_name: str, dimension: int = 1024):
    """Create Pinecone index if it doesn't exist."""
    existing_indexes = pc.list_indexes().names()
    
    if index_name not in existing_indexes:
        print(f"\n🔨 Creating new index: {index_name}")
        print(f"   Region: {PINECONE_ENVIRONMENT} (Free Tier)")
        print(f"   Dimensions: {dimension}")
        print(f"   Metric: cosine")
        
        try:
            pc.create_index(
                name=index_name,
                dimension=dimension,
                metric='cosine',
                spec=ServerlessSpec(
                    cloud='aws',
                    region=PINECONE_ENVIRONMENT
                )
            )
            print("   ⏳ Waiting for index to be ready...")
            time.sleep(10)
            print("   ✅ Index created successfully")
        except Exception as e:
            print(f"   ❌ Error creating index: {e}")
            raise
    else:
        print(f"   ✅ Index already exists: {index_name}")


def prepare_vector_batch(chunks: List[Dict], model: SentenceTransformer, 
                        start_idx: int = 0) -> List[Dict]:
    """Prepare a batch of vectors with embeddings and metadata."""
    vectors = []
    
    for idx, chunk in enumerate(chunks, start=start_idx):
        try:
            # Create embedding from case_title + text
            case_title = chunk.get('case_title', '')
            text = chunk.get('text', '')
            text_to_embed = f"{case_title} {text}"
            
            # Generate embedding
            embedding = model.encode(
                text_to_embed, 
                normalize_embeddings=True,
                show_progress_bar=False
            ).tolist()
            
            # Create unique vector ID
            chunk_id = chunk.get('chunk_id', f"chunk_{idx}")
            case_number = chunk.get('case_number', 'unknown')
            vector_id = f"{case_number}_{chunk_id}".replace(' ', '_')
            
            # Prepare metadata (Pinecone size limits)
            metadata = {
                'case_number': truncate_text(chunk.get('case_number', ''), 200),
                'case_title': truncate_text(case_title, 500),
                'chunk_type': chunk.get('chunk_type', 'unknown'),
                'text': truncate_text(text, 8000), 
                'chunk_id': str(chunk_id),
                'case_id': chunk.get('case_id', '')
            }
            
            # Add optional metadata if available
            if 'metadata' in chunk:
                meta = chunk['metadata']
                if 'category' in meta:
                    metadata['category'] = truncate_text(str(meta['category']), 100)
                if 'source_year' in meta:
                    metadata['source_year'] = str(meta['source_year'])
                if 'decision_date' in meta:
                    metadata['decision_date'] = str(meta['decision_date'])
                if 'gr_number' in meta:
                    metadata['gr_number'] = truncate_text(str(meta['gr_number']), 50)
            
            vectors.append({
                'id': vector_id,
                'values': embedding,
                'metadata': metadata
            })
            
        except Exception as e:
            print(f"\n⚠️  Error processing chunk {idx}: {e}")
            continue
    
    return vectors


def estimate_upload_time(num_chunks: int, batch_size: int) -> float:
    """Estimate upload time for Philippines → US East-1."""
    # Base processing time per chunk
    base_time = 0.5  # seconds
    
    # Latency factor for Philippines → US East-1
    latency_factor = 1.5  # ~200-250ms latency adds 50% overhead
    
    # Account for async uploads (reduces effective time by 30%)
    async_factor = 0.7
    
    total_seconds = (num_chunks * base_time * latency_factor * async_factor)
    return total_seconds / 60  # Return minutes


def main():
    parser = argparse.ArgumentParser(
        description='Upload Philippine Supreme Court cases to Pinecone',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python scripts/2_index_pinecone.py --create-index
    python scripts/2_index_pinecone.py --batch-size 250
    python scripts/2_index_pinecone.py --dry-run
    python scripts/2_index_pinecone.py --force-restart

Tips for Philippines → US East-1:
    - Use batch-size 200-250 for optimal speed
    - Run during off-peak hours (2-6 AM PHT) for better network
        """
    )
    parser.add_argument('--batch-size', type=int, default=250, 
                       help='Number of vectors per batch (default: 250, optimized for PH→US)')
    parser.add_argument('--start-from', type=int, default=None,
                       help='Start from specific chunk index (default: use checkpoint)')
    parser.add_argument('--create-index', action='store_true',
                       help='Create index if it does not exist')
    parser.add_argument('--force-restart', action='store_true',
                       help='Ignore checkpoint and start from beginning')
    parser.add_argument('--dry-run', action='store_true',
                       help='Test without uploading to Pinecone')
    args = parser.parse_args()

    print_header()

    # Load embedding model
    print("\n🤖 Loading embedding model...")
    print("   Model: BAAI/bge-large-en-v1.5")
    print("   Note: First run will download ~1.3GB (cached after)")
    
    try:
        model = SentenceTransformer('BAAI/bge-large-en-v1.5')
        print("   ✅ Model loaded successfully")
        print("   📐 Dimensions: 1024")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        print("\nTry: pip install sentence-transformers torch")
        return 1

    # Initialize Pinecone with connection pooling
    print("\n🔌 Connecting to Pinecone...")
    if not PINECONE_API_KEY:
        print("❌ Error: PINECONE_API_KEY not found in .env")
        print("\nAdd to your .env file:")
        print("  PINECONE_API_KEY=your-api-key-here")
        print("  PINECONE_INDEX_NAME=ally-supreme-court-cases")
        print("\nGet your API key at: https://app.pinecone.io")
        return 1

    try:
        # Optimize for high latency connections (Philippines → US)
        pc = Pinecone(
            api_key=PINECONE_API_KEY,
            pool_threads=4  # Enable connection pooling for better performance
        )
        print("   ✅ Connected to Pinecone")
        print("   ⚡ Connection pooling enabled (4 threads)")
        print("   ⚡ Async uploads enabled")
    except Exception as e:
        print(f"❌ Error connecting to Pinecone: {e}")
        print("\nCheck your API key and internet connection")
        return 1

    # Handle index creation/connection
    if args.create_index:
        try:
            create_index_if_not_exists(pc, PINECONE_INDEX_NAME)
        except Exception as e:
            print(f"❌ Failed to create index: {e}")
            return 1
    
    try:
        index = pc.Index(PINECONE_INDEX_NAME)
        print(f"   ✅ Connected to index: {PINECONE_INDEX_NAME}")
    except Exception as e:
        print(f"❌ Error: Index '{PINECONE_INDEX_NAME}' not found!")
        print(f"\nRun with --create-index flag:")
        print(f"  python scripts/2_index_pinecone.py --create-index")
        print(f"\nOr create manually at: https://app.pinecone.io")
        print(f"  - Name: {PINECONE_INDEX_NAME}")
        print(f"  - Dimensions: 1024")
        print(f"  - Metric: cosine")
        print(f"  - Region: us-east-1 (Free Tier)")
        return 1

    # Load chunks
    print(f"\n📂 Loading chunks from {CHUNKS_FILE}...")
    if not os.path.exists(CHUNKS_FILE):
        print(f"❌ Error: {CHUNKS_FILE} not found!")
        print("\nRun the preprocessing script first:")
        print("  python scripts/1_process_csv.py")
        return 1

    chunks = []
    try:
        with open(CHUNKS_FILE, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    chunks.append(json.loads(line))
        print(f"   ✅ Loaded {len(chunks):,} chunks")
    except Exception as e:
        print(f"❌ Error loading chunks: {e}")
        return 1

    # Determine starting point
    if args.force_restart:
        start_idx = 0
        print("\n🔄 Force restart: starting from beginning")
        if os.path.exists(CHECKPOINT_FILE):
            os.remove(CHECKPOINT_FILE)
    elif args.start_from is not None:
        start_idx = args.start_from
        print(f"\n▶️  Starting from chunk {start_idx:,}")
    else:
        start_idx = load_checkpoint()
        if start_idx > 0:
            print(f"   ▶️  Resuming from chunk {start_idx:,}")
        else:
            print("\n▶️  Starting fresh upload")

    # Check if already complete
    if start_idx >= len(chunks):
        print(f"\n✅ All chunks already uploaded! ({len(chunks):,} total)")
        print("\nTo re-upload from scratch, use --force-restart")
        return 0

    chunks_to_process = chunks[start_idx:]
    
    # Display upload statistics
    print(f"\n📊 Upload Statistics:")
    print(f"   Total chunks: {len(chunks):,}")
    print(f"   Already processed: {start_idx:,}")
    print(f"   Remaining: {len(chunks_to_process):,}")
    print(f"   Batch size: {args.batch_size}")
    print(f"   Total batches: {(len(chunks_to_process) + args.batch_size - 1) // args.batch_size}")
    
    # Estimate time
    estimated_minutes = estimate_upload_time(len(chunks_to_process), args.batch_size)
    print(f"\n⏱️  Time Estimate:")
    print(f"   Philippines → US East-1 latency: ~200-250ms")
    print(f"   Estimated upload time: {estimated_minutes:.1f} minutes ({estimated_minutes/60:.1f} hours)")
    print(f"   Best time to run: 2-6 AM PHT (less network congestion)")

    if args.dry_run:
        print("\n🧪 DRY RUN MODE - No data will be uploaded")
        print("   Testing embedding generation on 5 sample chunks...")
        test_batch = prepare_vector_batch(chunks_to_process[:5], model, start_idx)
        print(f"   ✅ Successfully prepared {len(test_batch)} test vectors")
        if test_batch:
            print(f"   Sample vector ID: {test_batch[0]['id']}")
            print(f"   Embedding dimension: {len(test_batch[0]['values'])}")
            print(f"   Metadata fields: {list(test_batch[0]['metadata'].keys())}")
            print(f"   Sample metadata text length: {len(test_batch[0]['metadata']['text'])} chars")
        print("\n✅ Dry run successful! Ready for actual upload.")
        return 0

    # Confirm before starting
    print("\n" + "=" * 80)
    print("⚠️  UPLOAD CONFIRMATION")
    print("=" * 80)
    print(f"You are about to upload {len(chunks_to_process):,} chunks to Pinecone")
    print(f"Estimated time: ~{estimated_minutes:.1f} minutes")
    print("\n💡 Tips:")
    print("  - This script auto-resumes from checkpoint if interrupted")
    print("  - Use Ctrl+C to safely interrupt (progress will be saved)")
    print(f"  - You can resume later by running the same command")
    print("=" * 80)
    
    response = input("\nReady to start upload? [y/N]: ")
    if response.lower() not in ['y', 'yes']:
        print("Upload cancelled.")
        return 0

    # Upload vectors in batches
    print(f"\n⬆️  Starting upload...")
    print(f"   Press Ctrl+C anytime to safely pause (will resume from checkpoint)")
    
    batch_size = args.batch_size
    total_uploaded = 0
    failed_batches = []
    
    # Track upload speed
    start_time = time.time()
    last_speed_check = start_time
    chunks_since_speed_check = 0

    try:
        pbar = tqdm(
            total=len(chunks_to_process), 
            desc="📤 Uploading", 
            initial=0, 
            unit=" chunks",
            colour='green',
            bar_format='{l_bar}{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}, {rate_fmt}]'
        )
        
        for i in range(0, len(chunks_to_process), batch_size):
            batch = chunks_to_process[i:i + batch_size]
            current_idx = start_idx + i
            batch_num = i // batch_size + 1
            total_batches = (len(chunks_to_process) + batch_size - 1) // batch_size
            
            try:
                # Prepare vectors
                vectors = prepare_vector_batch(batch, model, current_idx)
                
                if not vectors:
                    pbar.write(f"⚠️  Batch {batch_num}/{total_batches}: No valid vectors, skipping")
                    pbar.update(len(batch))
                    continue
                
                # Upload to Pinecone (ASYNC for better latency handling)
                index.upsert(
                    vectors=vectors, 
                    namespace='',
                    async_req=True  # Don't block waiting for confirmation
                )
                
                total_uploaded += len(vectors)
                chunks_since_speed_check += len(vectors)
                pbar.update(len(batch))
                
                # Save checkpoint every batch
                save_checkpoint(current_idx + len(batch), len(chunks))
                
                # Adaptive rate limiting (lighter for high latency)
                # The ~200ms latency naturally throttles us, so minimal sleep
                time.sleep(0.05)  # 50ms
                
                # Show speed stats every 1000 chunks
                if chunks_since_speed_check >= 1000:
                    current_time = time.time()
                    elapsed = current_time - last_speed_check
                    recent_speed = chunks_since_speed_check / elapsed
                    overall_speed = total_uploaded / (current_time - start_time)
                    remaining = len(chunks_to_process) - total_uploaded
                    eta_minutes = remaining / overall_speed / 60 if overall_speed > 0 else 0
                    
                    pbar.write(f"   ⚡ Speed: {recent_speed:.1f} chunks/sec (recent) | "
                              f"{overall_speed:.1f} chunks/sec (overall) | "
                              f"ETA: {eta_minutes:.1f} min")
                    
                    last_speed_check = current_time
                    chunks_since_speed_check = 0
                
            except Exception as e:
                error_msg = str(e).lower()
                pbar.write(f"\n❌ Batch {batch_num}/{total_batches} failed: {e}")
                failed_batches.append(batch_num)
                
                # On network errors, wait longer before continuing
                if any(keyword in error_msg for keyword in ["timeout", "connection", "network", "503", "502", "429"]):
                    pbar.write("   ⏳ Network/API issue detected, waiting 10 seconds...")
                    time.sleep(10)
                elif "rate limit" in error_msg or "429" in error_msg:
                    pbar.write("   ⏳ Rate limit hit, waiting 30 seconds...")
                    time.sleep(30)
                
                # Save checkpoint even on error
                save_checkpoint(current_idx + len(batch), len(chunks))
                continue
        
        pbar.close()
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Upload interrupted by user (Ctrl+C)")
        print(f"   Progress saved at chunk {current_idx:,}")
        print(f"   Uploaded so far: {total_uploaded:,} chunks")
        print(f"\n   To resume, simply run the same command:")
        print(f"   python scripts/2_index_pinecone.py")
        return 1

    # Calculate final statistics
    elapsed_total = time.time() - start_time
    avg_speed = total_uploaded / elapsed_total if elapsed_total > 0 else 0

    print("\n" + "=" * 80)
    print("✅ UPLOAD COMPLETE!")
    print("=" * 80)
    print(f"   Vectors uploaded: {total_uploaded:,}")
    print(f"   Total time: {elapsed_total/60:.1f} minutes ({elapsed_total/3600:.2f} hours)")
    print(f"   Average speed: {avg_speed:.1f} chunks/sec")
    print(f"   Successful batches: {(len(chunks_to_process) + batch_size - 1) // batch_size - len(failed_batches)}")
    print(f"   Failed batches: {len(failed_batches)}")
    
    if failed_batches:
        print(f"\n⚠️  Failed batch numbers: {failed_batches}")
        print(f"   You may want to investigate or re-run with --force-restart")

    # Verify index stats
    try:
        print("\n📊 Verifying Pinecone index...")
        time.sleep(2)  # Give Pinecone a moment to update stats
        stats = index.describe_index_stats()
        print(f"   Total vectors in index: {stats.total_vector_count:,}")
        print(f"   Dimensions: {stats.dimension}")
        if hasattr(stats, 'index_fullness'):
            print(f"   Index fullness: {stats.index_fullness * 100:.2f}%")
        
        # Verify count matches
        if stats.total_vector_count >= len(chunks):
            print(f"   ✅ All {len(chunks):,} chunks successfully indexed!")
        else:
            print(f"   ⚠️  Expected {len(chunks):,} vectors, found {stats.total_vector_count:,}")
            
    except Exception as e:
        print(f"⚠️  Could not retrieve index stats: {e}")

    # Recommendations
    print("\n" + "=" * 80)
    print("📋 NEXT STEPS:")
    print("=" * 80)
    print("  1. Test the Pinecone search:")
    print("     curl -X POST http://localhost:8000/search \\")
    print("       -H 'Content-Type: application/json' \\")
    print("       -d '{\"query\":\"illegal recruitment\",\"top_k\":3}'")
    print("")
    print("  2. Update your Spring Boot application.properties:")
    print("     # Comment out Qdrant, use Pinecone")
    print("     # vector.db.type=qdrant")
    print("     vector.db.type=pinecone")
    print("")
    print("  3. Update main.py to use Pinecone instead of Qdrant")
    print("")
    print("  4. Start your services:")
    print("     cd Ally-FinetuneRAG && uvicorn main:app --reload --port 8000")
    print("     cd Ally && ./mvnw spring-boot:run")
    print("     cd ally-frontend && npm run dev")
    print("=" * 80)
    
    # Cleanup checkpoint on complete success
    if total_uploaded == len(chunks_to_process) and not failed_batches:
        try:
            if os.path.exists(CHECKPOINT_FILE):
                os.remove(CHECKPOINT_FILE)
                print("\n🗑️  Checkpoint file cleaned up (upload completed successfully)")
        except Exception as e:
            print(f"⚠️  Could not remove checkpoint: {e}")
    else:
        print(f"\n💾 Checkpoint preserved at: {CHECKPOINT_FILE}")

    return 0 if not failed_batches else 1


if __name__ == "__main__":
    try:
        exit_code = main()
        exit(exit_code)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)