# WSO2 Identity Server 7 API Access Management Samples

This repository contains the source code for the API Access Management samples that are used for demonstrating the capabilities of WSO2 Identity Server 7.0.0.

### Prerequisites
- [Node.js](https://nodejs.org/en/download/)

This repository contains the following samples:

## Course Management API:
This is a simple Node.js API that is used to manage courses (you can fine the sample story for this from blog [1]).
To start the API, run the following commands:
```bash
cd course-management-api
npm install
npm start
```

## Course Management Portal:
<img width="1512" alt="Screenshot 2024-06-22 at 02 45 08" src="https://github.com/shashimalcse/is7-api-access-management/assets/43197743/3547b927-2db1-4e84-ad3d-ca6ffa9aebbd">
<img width="1512" alt="Screenshot 2024-06-22 at 02 51 22" src="https://github.com/shashimalcse/is7-api-access-management/assets/43197743/cb8fb72d-44f9-4ca4-b39e-46ee92e067a4">

This is a simple Next.js application that is used to manage courses from a course management portal.
To start the Portal, first create a .env.local file and add following env values :
```
NEXT_PUBLIC_HOSTED_URL="http://localhost:3001"
NEXTAUTH_URL="http://localhost:3001"
NEXT_PUBLIC_IS7_BASE_URL="https://localhost:9443"
CLIENT_ID="<client_id>"
NEXTAUTH_SECRET="<any_secret>"
NODE_TLS_REJECT_UNAUTHORIZED=0
```
Then run following commands:
```bash
cd course-management-portal
npm install
npm run dev
```


## Scheduled Job for Publishing Courses:
This is a simple bash script that is used to publish courses (sdheduled job for publishing courses can be created using cron jobs)
To execute the script for publishing courses, navigate to the schedule-jobs directory and run the publish script:
```bash
cd schedule-jobs
./publish.sh
```

## Blogs for the samples:

- [1] [Machine to Machine API Authorization with Identity Server 7](https://medium.com/@shashimalsenarath.17/machine-to-machine-api-authorization-with-identity-server-7-dc277764c729)
