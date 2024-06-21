#!/bin/bash

# Define API endpoints
tokenEndpoint="https://localhost:9443/oauth2/token"
getApprovedCoursesUrl="http://localhost:3000/api/courses?status=approved"

# Obtain an access token
response=$(curl -k -s -X POST $tokenEndpoint \
    -d "grant_type=client_credentials" \
    -d "client_id=s4k1VTdeVsIPwDwRTOKsDSEBV5Ua" \
    -d "client_secret=P5e2xxHFQTf6f72cHsFsd8u_8b5iD9XwiZYWxYF76jAa" \
    -d "scope=courses:read-approved courses:publish")
# Extract access token from response
accessToken=$(echo $response | jq -r '.access_token')
# Check if the access token was actually received
if [ -z "$accessToken" ] || [ "$accessToken" == "null" ]; then
  echo "Failed to retrieve access token"
  exit 1
fi

# Get approved courses
approvedCourses=$(curl -k -s -X GET $getApprovedCoursesUrl \
    -H "Authorization:Bearer ${accessToken}")

# If approved courses were received, publish one by one
if [ -n "$approvedCourses" ] && [ "$approvedCourses" != "null" ]; then
  for row in $(echo "${approvedCourses}" | jq -r '.[] | @base64'); do
    _jq() {
      echo ${row} | base64 --decode | jq -r ${1}
    }
    courseId=$(_jq '.id')
    courseName=$(_jq '.name')
    startDate=$(_jq '.started_date')

    # Convert the start date to seconds
    startSeconds=$(date -j -f "%Y-%m-%d" "${startDate}" "+%s")

    # Get the current date in seconds
    currentSeconds=$(date "+%s")

    # Calculate the difference in weeks
    diffWeeks=$(( ($startSeconds - $currentSeconds) / 604800 ))
    echo $diffWeeks
    if [ $diffWeeks -lt 1 ]; then
      echo "Publishing course: $courseName"
      # Publish the course
      publishCourseUrl="http://localhost:3000/api/courses/$courseId"
      publishResponse=$(curl -k -s -X PATCH $publishCourseUrl \
          -H "Authorization:Bearer ${accessToken}" \
          -H "Content-Type:application/json" \
          -d '{"status":"published"}')
      echo $publishResponse    
      # Check if the course was published successfully
      if [ -n "$publishResponse" ] && [ "$publishResponse" != "null" ]; then
        echo "Course published successfully"
      else
        echo "Failed to publish course"
      fi
    else
      echo "Course start date is more than a week ago. Not publishing."
    fi
  done
else
  echo "No approved courses found"
fi
