import requests
import json

# URL of the registration endpoint
url = "http://localhost:8000/api/auth/register"

# Data for registration
data = {
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
}

# Make the request
response = requests.post(url, json=data)

# Print the response
print(f"Status code: {response.status_code}")
print(f"Response: {response.text}")

# If the response is not successful, print more details
if response.status_code >= 400:
    print(f"Error details: {response.text}")
