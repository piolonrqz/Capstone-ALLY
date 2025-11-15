import pandas as pd
import json
import re
from pathlib import Path
from typing import List, Dict
import hashlib
from datetime import datetime

class SupremeCourtDataProcessor:
    """Process Supreme Court CSV data for RAG system"""
    
    def __init__(self, csv_directory: str, output_directory: str):
        self.csv_dir = Path(csv_directory)
        self.output_dir = Path(output_directory)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.stats = {
            'total_cases': 0,
            'total_chunks': 0,
            'cases_with_facts': 0,
            'cases_with_decision': 0,
            'cases_with_ruling': 0,
            'cases_with_verdict': 0,
            'empty_cases': 0
        }
        
    def load_csv_files(self) -> pd.DataFrame:
        """Load all CSV files from directory"""
        all_data = []
        
        # Check if directory exists
        if not self.csv_dir.exists():
            raise ValueError(f"Directory not found: {self.csv_dir}")
        
        # Find all CSV files recursively
        csv_files = list(self.csv_dir.rglob("*.csv"))
        
        if not csv_files:
            raise ValueError(f"No CSV files found in {self.csv_dir}")
        
        print(f"📁 Found {len(csv_files)} CSV files")
        
        for csv_file in csv_files:
            try:
                # Try different encodings
                df = None
                for encoding in ['utf-8', 'latin-1', 'cp1252']:
                    try:
                        df = pd.read_csv(csv_file, encoding=encoding)
                        break
                    except UnicodeDecodeError:
                        continue
                
                if df is None:
                    print(f"   ✗ Could not decode {csv_file.name}")
                    continue
                
                # Clean column names
                df.columns = df.columns.str.strip()
                
                # Extract year from parent folder
                parent_folder = csv_file.parent.name
                source_year = parent_folder if parent_folder.isdigit() else 'unknown'
                
                df['source_file'] = csv_file.name
                df['source_year'] = source_year
                
                all_data.append(df)
                print(f"   ✓ {parent_folder}/{csv_file.name}: {len(df)} cases")
                
            except Exception as e:
                print(f"   ✗ Error loading {csv_file.name}: {e}")
        
        if not all_data:
            raise ValueError("No CSV files could be loaded!")
        
        combined_df = pd.concat(all_data, ignore_index=True)
        
        # Check if Case Number column exists
        if 'Case Number' not in combined_df.columns:
            print(f"\n⚠️  Warning: 'Case Number' column not found")
            print(f"Available columns: {', '.join(combined_df.columns)}")
            # Try to find similar column
            for col in combined_df.columns:
                if 'case' in col.lower() and 'number' in col.lower():
                    print(f"Using '{col}' instead")
                    combined_df['Case Number'] = combined_df[col]
                    break
        
        original_count = len(combined_df)
        
        # Remove duplicates if Case Number exists
        if 'Case Number' in combined_df.columns:
            combined_df = combined_df.drop_duplicates(subset=['Case Number'], keep='first')
            duplicates_removed = original_count - len(combined_df)
            
            if duplicates_removed > 0:
                print(f"   🔄 Removed {duplicates_removed} duplicate cases")
        
        print(f"\n✅ Total unique cases loaded: {len(combined_df)}")
        return combined_df
    
    def clean_text(self, text) -> str:
        """Clean and normalize text"""
        if pd.isna(text) or text is None:
            return ""
        text = str(text)
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\x00-\x7F]+', ' ', text)
        text = re.sub(r'\s+([.,;:])', r'\1', text)
        return text.strip()
    
    def extract_category(self, case_title: str, decision: str, ruling: str) -> str:
        """Categorize case based on keywords"""
        text = f"{case_title} {decision} {ruling}".lower()
        
        categories = {
            'criminal': ['criminal', 'murder', 'homicide', 'theft', 'robbery'],
            'civil': ['damages', 'contract', 'obligation', 'property'],
            'labor': ['labor', 'employment', 'dismissal', 'wages'],
            'commercial': ['corporation', 'partnership', 'business'],
            'family': ['marriage', 'custody', 'adoption'],
            'tax': ['tax', 'taxation', 'revenue'],
            'administrative': ['administrative', 'government', 'graft'],
            'land': ['land', 'agrarian', 'cadastral']
        }
        
        for category, keywords in categories.items():
            if any(keyword in text for keyword in keywords):
                return category
        return 'general'
    
    def extract_case_data(self, row: pd.Series) -> Dict:
        """Extract case data from CSV row"""
        case_number = str(row.get('Case Number', 'Unknown')).strip()
        case_title = str(row.get('Case Title', 'Untitled')).strip()
        
        case_data = {
            'case_id': hashlib.md5(case_number.encode()).hexdigest()[:12],
            'case_number': case_number,
            'case_title': case_title,
            'facts': self.clean_text(row.get('Facts', '')),
            'decision': self.clean_text(row.get('Decision', '')),
            'ruling': self.clean_text(row.get('Ruling', '')),
            'verdict': self.clean_text(row.get('Verdict', '')),
            'source_file': row.get('source_file', ''),
            'source_year': row.get('source_year', ''),
            'date': 'Unknown',
            'category': None
        }
        
        case_data['category'] = self.extract_category(
            case_title, case_data['decision'], case_data['ruling']
        )
        
        self.stats['total_cases'] += 1
        if case_data['facts']: self.stats['cases_with_facts'] += 1
        if case_data['decision']: self.stats['cases_with_decision'] += 1
        if case_data['ruling']: self.stats['cases_with_ruling'] += 1
        if case_data['verdict']: self.stats['cases_with_verdict'] += 1
        
        # Track empty cases
        if not any([case_data['facts'], case_data['decision'], 
                   case_data['ruling'], case_data['verdict']]):
            self.stats['empty_cases'] += 1
        
        return case_data
    
    def chunk_case(self, case_data: Dict) -> List[Dict]:
        """Split case into chunks"""
        chunks = []
        base_context = f"Case: {case_data['case_title']} ({case_data['case_number']})"
        
        if case_data['facts']:
            chunks.append({
                'chunk_id': f"{case_data['case_id']}_facts",
                'case_id': case_data['case_id'],
                'case_number': case_data['case_number'],
                'case_title': case_data['case_title'],
                'chunk_type': 'facts',
                'text': f"{base_context}\n\nFACTS:\n{case_data['facts']}",
                'metadata': {
                    'section': 'facts',
                    'category': case_data['category'],
                    'source_year': case_data['source_year'],
                    'priority': 'medium'
                }
            })
        
        if case_data['decision']:
            chunks.append({
                'chunk_id': f"{case_data['case_id']}_decision",
                'case_id': case_data['case_id'],
                'case_number': case_data['case_number'],
                'case_title': case_data['case_title'],
                'chunk_type': 'decision',
                'text': f"{base_context}\n\nDECISION:\n{case_data['decision']}",
                'metadata': {
                    'section': 'decision',
                    'category': case_data['category'],
                    'source_year': case_data['source_year'],
                    'priority': 'high'
                }
            })
        
        if case_data['ruling']:
            chunks.append({
                'chunk_id': f"{case_data['case_id']}_ruling",
                'case_id': case_data['case_id'],
                'case_number': case_data['case_number'],
                'case_title': case_data['case_title'],
                'chunk_type': 'ruling',
                'text': f"{base_context}\n\nRULING:\n{case_data['ruling']}",
                'metadata': {
                    'section': 'ruling',
                    'category': case_data['category'],
                    'source_year': case_data['source_year'],
                    'priority': 'highest'
                }
            })
        
        if case_data['verdict']:
            chunks.append({
                'chunk_id': f"{case_data['case_id']}_verdict",
                'case_id': case_data['case_id'],
                'case_number': case_data['case_number'],
                'case_title': case_data['case_title'],
                'chunk_type': 'verdict',
                'text': f"{base_context}\n\nVERDICT:\n{case_data['verdict']}",
                'metadata': {
                    'section': 'verdict',
                    'category': case_data['category'],
                    'source_year': case_data['source_year'],
                    'priority': 'high'
                }
            })
        
        return chunks
    
    def process_all_cases(self) -> List[Dict]:
        """Process all CSV files"""
        print("\n" + "="*60)
        print("📊 PROCESSING SUPREME COURT CASES")
        print("="*60)
        
        df = self.load_csv_files()
        all_chunks = []
        
        print(f"\n🔄 Creating chunks from {len(df)} cases...")
        
        for idx, row in df.iterrows():
            try:
                case_data = self.extract_case_data(row)
                chunks = self.chunk_case(case_data)
                all_chunks.extend(chunks)
                
                if (idx + 1) % 100 == 0:
                    print(f"   Progress: {idx + 1}/{len(df)} cases processed...")
            except Exception as e:
                print(f"   ⚠️  Error processing case {idx}: {e}")
        
        self.stats['total_chunks'] = len(all_chunks)
        
        print("\n" + "="*60)
        print("📈 PROCESSING STATISTICS")
        print("="*60)
        for key, value in self.stats.items():
            print(f"{key.replace('_', ' ').title():.<30} {value}")
        print("="*60)
        
        return all_chunks
    
    def save_chunks(self, chunks: List[Dict]):
        """Save chunks to JSONL"""
        output_path = self.output_dir / "chunks.jsonl"
        
        with open(output_path, 'w', encoding='utf-8') as f:
            for chunk in chunks:
                f.write(json.dumps(chunk, ensure_ascii=False) + '\n')
        
        print(f"\n💾 Saved {len(chunks)} chunks to {output_path}")
        
        metadata = {
            'processing_date': datetime.now().isoformat(),
            'total_chunks': len(chunks),
            'statistics': self.stats
        }
        
        with open(self.output_dir / "processing_metadata.json", 'w') as f:
            json.dump(metadata, f, indent=2)
        
        return output_path


if __name__ == "__main__":
    processor = SupremeCourtDataProcessor(
        csv_directory="ally-dataset/csv-dataset",
        output_directory="processed-for-rag"
    )
    
    chunks = processor.process_all_cases()
    processor.save_chunks(chunks)
    
    print("\n✅ Data processing complete!")
    print("Next: Run scripts/2_index_pinecone.py")