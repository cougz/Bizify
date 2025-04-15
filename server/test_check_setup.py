import requests

# URL of the check-setup endpoint
url = "http://localhost:8000/api/auth/check-setup"

# Make the request
response = requests.get(url)

# Print the response
print(f"Status code: {response.status_code}")
print(f"Response: {response.text}")

# If the response is not successful, print more details
if response.status_code >= 400:
    print(f"Error details: {response.text}")
