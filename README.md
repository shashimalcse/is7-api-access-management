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
This is a simple Next.js application that is used to manage courses from a course management portal.
To start the Portal, run the following commands:
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
