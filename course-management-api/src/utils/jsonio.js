import fs from 'fs';

// Read courses from JSON file
const readCoursesFromFile = () => {
    const data = fs.readFileSync('courses.json', 'utf8');
    return JSON.parse(data);
};

// Write courses to JSON file
const writeCoursesToFile = (courses) => {
    fs.writeFileSync('courses.json', JSON.stringify(courses, null, 2));
};

// Read enrollments from JSON file
const readEnrollmentsFromFile = () => {
    const data = fs.readFileSync('enrollments.json', 'utf8');
    return JSON.parse(data);
};

// Write enrollments to JSON file
const writeEnrollmentsToFile = (enrollments) => {
    fs.writeFileSync('enrollments.json', JSON.stringify(enrollments, null, 2));
};

const ensureFileExists = (filePath, defaultContent) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2));
    }
};

export {readCoursesFromFile, writeCoursesToFile, readEnrollmentsFromFile, writeEnrollmentsToFile, ensureFileExists}
