#!/bin/bash

# Define API endpoints
tokenEndpoint="https://localhost:9443/oauth2/token"
getCoursesUrl="https://localhost:3000//api/courses/:courseId/approve"

# Obtain an access token
response=$(curl -k -s -X POST $tokenEndpoint \
    -d "grant_type=client_credentials" \
    -d "client_id=Qi757PrbaGjyVY8fzCCj4_MaLP8a" \
    -d "client_secret=P5e2xxHFQTf6f72cHsFsd8u_8b5iD9XwiZYWxYF76jAa" \
    -d "scope=course:read")
# Extract access token from response
accessToken=$(echo $response | jq -r '.access_token')
# Check if the access token was actually received
if [ -z "$accessToken" ] || [ "$accessToken" == "null" ]; then
  echo "Failed to retrieve access token"
  exit 1
fi
