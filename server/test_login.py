import requests
import json

# URL of the login endpoint
url = "http://localhost:8000/api/auth/token"

# Data for login - using form data for OAuth2 password flow
data = {
    "username": "test@example.com",
    "password": "password123"
}

# Make the request with form data
response = requests.post(url, data=data)

# Print the response
print(f"Status code: {response.status_code}")
print(f"Response: {response.text}")

# If the response is not successful, print more details
if response.status_code >= 400:
    print(f"Error details: {response.text}")
else:
    # If successful, extract the token
    token = response.json().get("access_token")
    print(f"Token: {token}")
    
    # Test the /me endpoint with the token
    me_url = "http://localhost:8000/api/auth/me"
    headers = {"Authorization": f"Bearer {token}"}
    me_response = requests.get(me_url, headers=headers)
    print(f"\nMe endpoint status code: {me_response.status_code}")
    print(f"Me endpoint response: {me_response.text}")
