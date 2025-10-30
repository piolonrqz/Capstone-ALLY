import os
from dotenv import load_dotenv
import google.generativeai as genai
from vertexai.preview.generative_models import GenerativeModel
import vertexai

load_dotenv()

project_id = os.getenv('GOOGLE_PROJECT_ID')
location = os.getenv('GOOGLE_REGION', 'us-central1')
endpoint_id = os.getenv('GOOGLE_ENDPOINT_ID')
credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')

# Validate credentials file
if not credentials_path:
    raise ValueError("GOOGLE_APPLICATION_CREDENTIALS not set in .env file")

if not os.path.exists(credentials_path):
    raise FileNotFoundError(
        f"Service account key file not found: {credentials_path}\n"
        f"Current directory: {os.getcwd()}\n"
        "Please download your service account key from Google Cloud Console."
    )

# Set credentials
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path


# Old Test
# model = genai.GenerativeModel('gemini-2.5-flash')

vertexai.init(project=project_id, location=location)

# Use the fine-tuned model endpoint
model = GenerativeModel(f"projects/{project_id}/locations/{location}/endpoints/{endpoint_id}")

# Test the model
response = model.generate_content("Say hello")
print("✅ API key works!")
print(response.text)