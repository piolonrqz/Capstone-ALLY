"""
Upload new chunks to Pinecone (incremental update)
Optimized for Philippines → US East-1

Usage:
    python scripts/3_update_pinecone.py
    python scripts/3_update_pinecone.py --batch-size 200
    python scripts/3_update_pinecone.py --dry-run
"""

from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
import json
import argparse
import time
from tqdm import tqdm
from dotenv import load_dotenv
import os
from pathlib import Path
from typing import List, Dict

load_dotenv()

PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME', 'ally-supreme-court-cases')
MAX_METADATA_TEXT_LENGTH = 40000


def truncate_text(text: str, max_length: int = MAX_METADATA_TEXT_LENGTH) -> str:
    """Safely truncate text to fit Pinecone metadata limits."""
    if not text or len(text) <= max_length:
        return text or ""
    return text[:max_length - 3] + "..."


def prepare_vector_batch(chunks: List[Dict], model: SentenceTransformer) -> List[Dict]:
    """Prepare vectors with embeddings and metadata."""
    vectors = []
    
    for chunk in chunks:
        try:
            case_title = chunk.get('case_title', '')
            text = chunk.get('text', '')
            text_to_embed = f"{case_title} {text}"
            
            embedding = model.encode(
                text_to_embed, 
                normalize_embeddings=True,
                show_progress_bar=False
            ).tolist()
            
            chunk_id = chunk.get('chunk_id', '')
            case_number = chunk.get('case_number', 'unknown')
            vector_id = f"{case_number}_{chunk_id}".replace(' ', '_')
            
            metadata = {
                'case_number': truncate_text(chunk.get('case_number', ''), 200),
                'case_title': truncate_text(case_title, 500),
                'chunk_type': chunk.get('chunk_type', 'unknown'),
                'text': truncate_text(text, 8000),
                'chunk_id': str(chunk_id),
                'case_id': chunk.get('case_id', '')
            }
            
            if 'metadata' in chunk:
                meta = chunk['metadata']
                if 'category' in meta:
                    metadata['category'] = truncate_text(str(meta['category']), 100)
                if 'source_year' in meta:
                    metadata['source_year'] = str(meta['source_year'])
                if 'section' in meta:
                    metadata['section'] = str(meta['section'])
            
            vectors.append({
                'id': vector_id,
                'values': embedding,
                'metadata': metadata
            })
            
        except Exception as e:
            print(f"\n⚠️  Error processing chunk: {e}")
            continue
    
    return vectors


def get_new_chunks() -> List[Dict]:
    """Get new chunks that haven't been uploaded yet."""
    chunks_file = Path("processed-for-rag/chunks.jsonl")
    metadata_file = Path("processed-for-rag/processing_metadata.json")
    checkpoint_file = Path("processed-for-rag/pinecone_upload_checkpoint.json")
    
    if not chunks_file.exists():
        print(f"❌ Error: {chunks_file} not found!")
        return []
    
    # Load all chunks
    all_chunks = []
    with open(chunks_file, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                all_chunks.append(json.loads(line))
    
    # Check if there's a checkpoint (from interrupted full upload)
    uploaded_count = 0
    if checkpoint_file.exists():
        with open(checkpoint_file, 'r') as f:
            checkpoint = json.load(f)
            uploaded_count = checkpoint.get('last_processed_index', 0)
            print(f"📍 Found upload checkpoint: {uploaded_count:,} chunks already uploaded")
    
    # If metadata has update history, get only newest chunks
    if metadata_file.exists() and uploaded_count == 0:
        with open(metadata_file, 'r') as f:
            metadata = json.load(f)
            updates = metadata.get('updates', [])
            
            if updates:
                # Get chunks from last update only
                last_update = updates[-1]
                new_chunk_count = last_update.get('new_chunks', 0)
                
                if new_chunk_count > 0:
                    print(f"📊 Detected {new_chunk_count:,} new chunks from last update")
                    return all_chunks[-new_chunk_count:]
    
    # Otherwise, return chunks that haven't been uploaded
    if uploaded_count > 0:
        remaining = all_chunks[uploaded_count:]
        print(f"📊 {len(remaining):,} chunks remaining from previous upload")
        return remaining
    
    # If no checkpoint and no updates, assume all need uploading
    print(f"📊 All {len(all_chunks):,} chunks will be uploaded")
    return all_chunks


def main():
    parser = argparse.ArgumentParser(
        description='Upload new chunks to Pinecone (incremental update)',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument('--batch-size', type=int, default=200,
                       help='Batch size for upload (default: 200)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Test without uploading')
    args = parser.parse_args()
    
    print("=" * 80)
    print("📤 PINECONE INCREMENTAL UPDATE")
    print("=" * 80)
    
    # Load embedding model
    print("\n🤖 Loading embedding model...")
    model = SentenceTransformer('BAAI/bge-large-en-v1.5')
    print("   ✅ Model loaded")
    
    # Connect to Pinecone
    print("\n🔌 Connecting to Pinecone...")
    if not PINECONE_API_KEY:
        print("❌ Error: PINECONE_API_KEY not found in .env")
        return 1
    
    pc = Pinecone(api_key=PINECONE_API_KEY, pool_threads=4)
    index = pc.Index(PINECONE_INDEX_NAME)
    print(f"   ✅ Connected to index: {PINECONE_INDEX_NAME}")
    
    # Get new chunks
    print("\n📂 Checking for new chunks...")
    new_chunks = get_new_chunks()
    
    if not new_chunks:
        print("✅ No new chunks to upload - already up to date!")
        return 0
    
    print(f"   ✅ Found {len(new_chunks):,} new chunks to upload")
    
    # Get current index stats
    print("\n📊 Current Index Status:")
    stats = index.describe_index_stats()
    print(f"   Existing vectors: {stats.total_vector_count:,}")
    print(f"   Will add: {len(new_chunks):,} new vectors")
    print(f"   Total after update: {stats.total_vector_count + len(new_chunks):,}")
    
    # Estimate time
    estimated_minutes = (len(new_chunks) * 0.5 * 1.5 * 0.7) / 60
    print(f"\n⏱️  Estimated time: {estimated_minutes:.1f} minutes")
    
    if args.dry_run:
        print("\n🧪 DRY RUN - Testing on 5 chunks...")
        test_vectors = prepare_vector_batch(new_chunks[:5], model)
        print(f"   ✅ Successfully prepared {len(test_vectors)} test vectors")
        if test_vectors:
            print(f"   Sample ID: {test_vectors[0]['id']}")
        return 0
    
    # Confirm
    confirm = input("\nReady to upload new chunks? [y/N]: ")
    if confirm.lower() not in ['y', 'yes']:
        print("Update cancelled.")
        return 0
    
    # Upload
    print(f"\n⬆️  Uploading {len(new_chunks):,} new chunks...")
    batch_size = args.batch_size
    total_uploaded = 0
    start_time = time.time()
    
    try:
        pbar = tqdm(total=len(new_chunks), desc="📤 Uploading", unit=" chunks", colour='green')
        
        for i in range(0, len(new_chunks), batch_size):
            batch = new_chunks[i:i + batch_size]
            
            vectors = prepare_vector_batch(batch, model)
            if vectors:
                index.upsert(vectors=vectors, namespace='', async_req=True)
                total_uploaded += len(vectors)
                pbar.update(len(batch))
                time.sleep(0.05)
        
        pbar.close()
        
    except KeyboardInterrupt:
        print("\n⚠️  Upload interrupted")
        return 1
    
    elapsed = time.time() - start_time
    
    # Final stats
    print("\n" + "=" * 80)
    print("✅ UPDATE COMPLETE!")
    print("=" * 80)
    print(f"   New vectors uploaded: {total_uploaded:,}")
    print(f"   Time taken: {elapsed/60:.1f} minutes")
    print(f"   Average speed: {total_uploaded/elapsed:.1f} chunks/sec")
    
    # Verify
    print("\n📊 Verifying index...")
    time.sleep(2)
    new_stats = index.describe_index_stats()
    print(f"   Total vectors now: {new_stats.total_vector_count:,}")
    
    if new_stats.total_vector_count >= stats.total_vector_count + total_uploaded:
        print("   ✅ All new chunks successfully indexed!")
    
    print("\n💡 Next: Restart your FastAPI and test the updated search!")
    print("=" * 80)
    
    return 0


if __name__ == "__main__":
    exit(main())