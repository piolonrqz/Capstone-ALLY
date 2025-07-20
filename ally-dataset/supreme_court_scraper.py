import requests
from bs4 import BeautifulSoup
import csv
import time
import re
import os
from urllib.parse import urljoin

# Prerequisites:
#   pip install requests beautifulsoup4


# Create CSV file with headers
def create_csv(filename):
    if not os.path.exists(filename):
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=headers)
            writer.writeheader()
        print(f"Created new CSV file: {filename}")

# Base URL
base_url = "https://elibrary.judiciary.gov.ph"

# CSV headers
headers = ["Case Number", "Case Title", "Facts", "Decision", "Ruling", "Verdict"]

# Function to get all case links from a monthly listing page
def get_case_links(url):
    print(f"Accessing monthly listing page: {url}")
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        case_links = []
        
        # Find all G.R. No. cases in the page
        gr_headers = soup.find_all(['a', 'div'], text=re.compile(r'G\.R\. No\. \d+'))
        ac_headers = soup.find_all(['a', 'div'], text=re.compile(r'A\.C\. No\. \d+'))
        
        # Combine all case headers
        case_headers = gr_headers + ac_headers
        
        for case_header in case_headers:
            # Check if it's directly a link
            if case_header.name == 'a' and '/thebookshelf/showdocs/' in case_header.get('href', ''):
                case_url = urljoin(base_url, case_header['href'])
                case_title = case_header.text.strip()
                case_links.append((case_url, case_title))
            else:
                # Find the surrounding link
                parent = case_header.parent
                while parent and parent.name != 'a' and parent.name != 'body':
                    parent = parent.parent
                
                if parent and parent.name == 'a' and '/thebookshelf/showdocs/' in parent.get('href', ''):
                    case_url = urljoin(base_url, parent['href'])
                    case_title = case_header.text.strip()
                    case_links.append((case_url, case_title))
                
                # Check for links in sibling elements
                siblings = case_header.find_next_siblings('a')
                for sibling in siblings:
                    if '/thebookshelf/showdocs/' in sibling.get('href', ''):
                        case_url = urljoin(base_url, sibling['href'])
                        case_title = case_header.text.strip() + " " + sibling.text.strip()
                        case_links.append((case_url, case_title))
                        break
        
        if not case_links:
            all_links = soup.find_all('a', href=lambda href: href and '/thebookshelf/showdocs/' in href)
            
            for link in all_links:
                case_url = urljoin(base_url, link['href'])
                case_title = link.text.strip()
                if case_title:
                    case_links.append((case_url, case_title))
        
        # Remove duplicates while preserving order
        unique_links = []
        seen = set()
        for url, title in case_links:
            if url not in seen:
                seen.add(url)
                unique_links.append((url, title))
                print(f"Found case link: {title} at {url}")
        
        return unique_links
    except Exception as e:
        print(f"Error accessing listing page: {e}")
        return []

def parse_case_page(url, title=""):
    print(f"Processing case: {url}")
    try:
        case_number = ""
        case_title = title
        facts_section = ""
        decision_section = ""
        ruling_section = ""
        verdict_section = ""

        # Validate URL first
        if not url.startswith('http'):
            url = urljoin(base_url, url)
            
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract case number - look for both G.R. and A.C. numbers
        gr_pattern = re.compile(r'G\.R\. No\. \d+-?\d*')
        ac_pattern = re.compile(r'A\.C\. No\. \d+-?\d*')
        
        case_number_element = soup.find(string=gr_pattern)
        if not case_number_element:
            case_number_element = soup.find(string=ac_pattern)
            
        if case_number_element:
            case_number = case_number_element.strip()
        else:
            # Try to find case number in a different way
            for element in soup.find_all(['h1', 'h2', 'h3', 'h4', 'div', 'p']):
                text = element.get_text()
                gr_match = gr_pattern.search(text)
                ac_match = ac_pattern.search(text)
                if gr_match:
                    case_number = gr_match.group(0)
                    break
                elif ac_match:
                    case_number = ac_match.group(0)
                    break
        
        # Extract case title if not already provided
        if not case_title:
            case_title_pattern = re.compile(r'([A-Z][A-Z\s.,]+\s+VS\.\s+[A-Z][A-Z\s.,]+)', re.IGNORECASE)
            case_title_elements = soup.find_all(string=case_title_pattern)
            
            for element in case_title_elements:
                match = case_title_pattern.search(element)
                if match:
                    case_title = match.group(0)
                    break
        
        # Look for Antecedents or Facts section
        facts_headers = ["Antecedents", "Antecedent", "ANTECEDENT", "ANTECEDENTS", "The Antecedent", "The Antecedents", "THE ANTECEDENT", "THE ANTECEDENTS", "Factual Antecedent", "Factual Antecedents", "FACTUAL ANTECEDENT", "FACTUAL ANTECEDENTS", "Facts of the Case", "Antecedent Facts", "The Facts", "THE FACTS"]
        for header_text in facts_headers:
            # First try exact match
            facts_header = soup.find(string=lambda text: text and header_text in text)
            
            # If not found, try case-insensitive match
            if not facts_header:
                pattern = re.compile(re.escape(header_text), re.IGNORECASE)
                facts_header = soup.find(string=pattern)
            
            if facts_header:
                # Try to get the parent element containing this text
                facts_container = None
                if hasattr(facts_header, 'find_parent'):
                    facts_container = facts_header.find_parent(['p', 'div', 'h2', 'h3', 'h4'])
                
                if facts_container:
                    # Extract text from this element and subsequent siblings until next section
                    current = facts_container
                    facts_section = current.get_text().strip() + "\n"
                    
                    current = current.find_next_sibling()
                    while current and not is_section_boundary(current, ["Ruling", "Decision", "DECISION", "Discussion"]):
                        facts_section += current.get_text().strip() + "\n"
                        current = current.find_next_sibling()
                break
        
        # Find Decision section
        decision_headers = ["DECISION", "Decision"]
        for header_text in decision_headers:
            decision_header = soup.find(string=lambda text: text and header_text in text)
            if not decision_header:
                pattern = re.compile(re.escape(header_text), re.IGNORECASE)
                decision_header = soup.find(string=pattern)
                
            if decision_header:
                decision_container = None
                if hasattr(decision_header, 'find_parent'):
                    decision_container = decision_header.find_parent(['p', 'div', 'h2', 'h3', 'h4'])
                
                if decision_container:
                    current = decision_container
                    decision_section = current.get_text().strip() + "\n"
                    
                    current = current.find_next_sibling()
                    while current and not is_section_boundary(current, ["WHEREFORE", "Conclusion", "FOR THESE REASONS"]):
                        decision_section += current.get_text().strip() + "\n"
                        current = current.find_next_sibling()
                break
        
        # Find Ruling section
        ruling_headers = ["Ruling", "RULING", "THE RULING", "Findings", "Court's Findings", "Ruling of the Court", "RULING OF THE COURT", "COURT'S RULING", "Court's Ruling"]
        for header_text in ruling_headers:
            ruling_header = soup.find(string=lambda text: text and header_text in text)
            if not ruling_header:
                pattern = re.compile(re.escape(header_text), re.IGNORECASE)
                ruling_header = soup.find(string=pattern)
                
            if ruling_header:
                ruling_container = None
                if hasattr(ruling_header, 'find_parent'):
                    ruling_container = ruling_header.find_parent(['p', 'div', 'h2', 'h3', 'h4'])
                
                if ruling_container:
                    current = ruling_container
                    ruling_section = current.get_text().strip() + "\n"
                    
                    current = current.find_next_sibling()
                    while current and not is_section_boundary(current, ["WHEREFORE", "Conclusion", "FOR THESE REASONS"]):
                        ruling_section += current.get_text().strip() + "\n"
                        current = current.find_next_sibling()
                break
        
        # Get verdict section
        verdict_section = get_verdict_section(soup)
        
        return {
            "Case Number": clean_text(case_number),
            "Case Title": clean_text(case_title),
            "Facts": clean_text(facts_section),
            "Decision": clean_text(decision_section),
            "Ruling": clean_text(ruling_section),
            "Verdict": clean_text(verdict_section)
        }
        
    except Exception as e:
        print(f"Error processing case page: {e}")
        return {
            "Case Number": f"Error retrieving data: {str(e)}",
            "Case Title": title or f"Error retrieving data: {str(e)}",
            "Facts": f"Error retrieving data: {str(e)}",
            "Decision": f"Error retrieving data: {str(e)}",
            "Ruling": f"Error retrieving data: {str(e)}",
            "Verdict": f"Error retrieving data: {str(e)}"
        }

def is_section_boundary(element, section_titles):
    if not element or not hasattr(element, 'name') or not element.name:
        return True
    if element.name in ['h2', 'h3', 'h4']:
        return True
    
    if not hasattr(element, 'get_text'):
        return True
        
    text = element.get_text().strip()
    return any(title.lower() in text.lower() for title in section_titles)

def clean_text(text):
    if not text:
        return ""
    # Remove excessive whitespace and newlines
    text = ' '.join(text.split())
    # Remove page numbers or footers if present
    text = re.sub(r'Page \d+ of \d+', '', text)
    return text.strip()

def get_verdict_section(soup):
    verdict_markers = [
        "WHEREFORE", "IN VIEW WHEREOF", "FOR THESE REASONS",
        "ACCORDINGLY", "IN LIGHT OF THE FOREGOING",
        "PREMISES CONSIDERED", "FOR THE FOREGOING REASONS"
    ]
    
    # Try to find any of the verdict markers
    for marker in verdict_markers:
        pattern = re.compile(re.escape(marker), re.IGNORECASE)
        verdict_elements = soup.find_all(string=pattern)
        
        for verdict_element in verdict_elements:
            if hasattr(verdict_element, 'find_parent'):
                verdict_container = verdict_element.find_parent(['p', 'div'])
                
                if verdict_container:
                    verdict_text = verdict_container.get_text().strip()
                    
                    # Include subsequent elements until "SO ORDERED" or concurring justices
                    current = verdict_container.find_next_sibling()
                    while current:
                        current_text = current.get_text().strip()
                        verdict_text += "\n" + current_text
                        
                        if "SO ORDERED" in current_text or "concur" in current_text.lower():
                            break
                            
                        current = current.find_next_sibling()
                    
                    return clean_text(verdict_text)
    
    # Fallback: Look for penalty or disposition language
    penalty_keywords = ["is found GUILTY", "is sentenced to", "is ordered to pay", "penalty of"]
    for elem in soup.find_all(['p', 'div']):
        text = elem.get_text().strip()
        if any(keyword in text for keyword in penalty_keywords):
            return clean_text(text)
    
    return "Verdict section not found"

def scrape_month(month, year, max_cases=None):
    # Create URL for the specified month and year
    url = f"https://elibrary.judiciary.gov.ph/thebookshelf/docmonth/{month}/{year}/1"
    
    month_map = {
        "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4,
        "May": 5, "Jun": 6, "Jul": 7, "Aug": 8,
        "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12
    }
    month_number = month_map.get(month, 0)

    # Create a specific CSV file for this month
    csv_filename = f"{month_number}_scraped_{month}-{year}-dataset.csv"
    create_csv(csv_filename)
    
    print(f"\nScraping cases for {month} {year} from {url}")
    
    # Get case links from the monthly listing page
    case_links = get_case_links(url)
    
    # Limit number of cases if specified
    if max_cases and len(case_links) > max_cases:
        case_links = case_links[:max_cases]
        
    print(f"Found {len(case_links)} cases for {month} {year}")
    
    # Process each case and save to CSV
    cases_scraped = 0
    with open(csv_filename, 'a', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=headers)
        
        for case_url, case_title in case_links:
            try:
                case_data = parse_case_page(case_url, case_title)
                writer.writerow(case_data)
                cases_scraped += 1
                print(f"Successfully scraped case {cases_scraped}/{len(case_links)}: {case_data['Case Number'] or case_title}")
                
                # Add a delay between requests
                time.sleep(2)
            except Exception as e:
                print(f"Error processing {case_url}: {e}")
    
    print(f"\nScraping complete for {month} {year}. Total cases scraped: {cases_scraped}")
    print(f"Data saved to {csv_filename}")
    return cases_scraped

if __name__ == "__main__":
   
    scrape_month("Jan", 2023)

    # Example usage:
    # To scrape January 2025 with no limit on number of cases:
    #   scrape_month("Jan", 2025, max_cases=5)
    # To scrape January 2025 with a limit of 5 cases:
    #   scrape_month("Jan", 2025, max_cases=5)