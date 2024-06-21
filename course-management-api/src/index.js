import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { jwtCheck, determineScopes, checkScope } from './middleware/jwt.js';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
app.use(express.json());
app.use(cors());

const ensureFileExists = (filePath, defaultContent) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2));
    }
};

// Ensure courses.json and enrollments.json exist
ensureFileExists('courses.json', []);
ensureFileExists('enrollments.json', {});

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

/*
 * Courses API
 */
app.use('/api', jwtCheck, async (req, res, next) => {
    next();
});

/* 
 * Get all courses
 */
app.get('/api/courses', determineScopes, checkScope, async (req, res) => {
    const coursesDb = readCoursesFromFile();
    var courses;
    if (req.query.status === 'pending') {
        courses = coursesDb.filter(course => course.pending === true && course.published === false);
    } else if (req.query.status === 'approved') {
        courses = coursesDb.filter(course => course.pending === false && course.published === false);
    } else {
        courses = coursesDb.filter(course => course.published === true && course.pending === false);
    }
    courses = courses.map(course => {
        return {
            id: course.id,
            name: course.name,
            details: course.details,
            started_date: course.started_date
        };
    });
    res.json(courses);
});

/*
 * Create a new course
 */
app.post('/api/courses', determineScopes, checkScope, async (req, res) => {
    const coursesDb = readCoursesFromFile();
    const newCourse = req.body;
    // Validate input
    if (!newCourse || !newCourse.name || !newCourse.details || !newCourse.started_date) {
        return res.status(400).send('Invalid course data');
    }
    // Assign an id to the new course
    newCourse.id = coursesDb.length + 1;
    newCourse.pending = true;
    newCourse.published = false;
    // Add the new course to the database
    coursesDb.push(newCourse);
    writeCoursesToFile(coursesDb);
    // Return the new course
    res.json({
        id: newCourse.id,
        name: newCourse.name,
        details: newCourse.details,
        started_date: newCourse.started_date
    });
});

/*
 * Get a specific course
 */
app.get('/api/courses/:courseId', determineScopes, checkScope, async (req, res) => {
    const coursesDb = readCoursesFromFile();
    const courseId = parseInt(req.params.courseId);
    const course = coursesDb.find(c => c.id === courseId);
    if (course && course.published === true) {
        res.json({
            id: course.id,
            name: course.name,
            details: course.details,
            started_date: course.started_date
        });
    } else {
        res.status(404).send('Course not found');
    }
});

/*
 * Update a course
 */
app.put('/api/courses/:courseId', determineScopes, checkScope, async (req, res) => {
    const coursesDb = readCoursesFromFile();
    const courseId = parseInt(req.params.courseId);
    const course = coursesDb.find(c => c.id === courseId);
    if (!course || course.pending) {
        res.status(404).send('Course not found');
    }
    const updateCourse = req.body;
    // Validate input
    if (!updateCourse) {
        return res.status(400).send('Invalid course data');
    }
    if (updateCourse.name && course) {
        course.name = updateCourse.name;
    }
    if (updateCourse.details && course) {
        course.details = updateCourse.details;
    }
    writeCoursesToFile(coursesDb);
    res.json({
        id: course.id,
        name: course.name,
        details: course.details,
        started_date: course.started_date
    });
});

/*
 * Update a course status
 */
app.patch('/api/courses/:courseId', determineScopes, checkScope, async (req, res) => {
    const coursesDb = readCoursesFromFile();
    const courseId = parseInt(req.params.courseId);
    const course = coursesDb.find(c => c.id === courseId);

    if (!course) {
        return res.status(404).send('Course not found');
    }

    const status = req.body.status;

    if (status === 'approved' && course.pending === true) {
        course.pending = false;
    }
    else if (status === 'published' && course.pending === false) {
        course.published = true;
    }
    else {
        return res.status(400).send('Invalid status');
    }
    writeCoursesToFile(coursesDb);
    res.json({
        id: course.id,
        name: course.name,
        details: course.details,
        started_date: course.started_date
    });
});

/*
 * Delete a course
 */
app.delete('/api/courses/:courseId', determineScopes, checkScope, async (req, res) => {
    const coursesDb = readCoursesFromFile();
    const courseId = parseInt(req.params.courseId);
    const course = coursesDb.find(c => c.id === courseId);

    if (!course) {
        return res.status(404).send('Course not found');
    }

    // delete course
    const updatedCoursesDb = coursesDb.filter(c => c.id !== courseId);
    writeCoursesToFile(updatedCoursesDb);
    res.sendStatus(204);
});

/*
 * Enroll/Unenroll course
 */
app.post('/api/courses/:courseId/enrollments', determineScopes, checkScope, async (req, res) => {
    const enrollments = readEnrollmentsFromFile();
    const coursesDb = readCoursesFromFile();
    const courseId = parseInt(req.params.courseId);
    const course = coursesDb.find(c => c.id === courseId);

    if (!course) {
        return res.status(404).send('Course not found');
    }

    const sub = req.auth?.sub;

    if (!sub) {
        return res.status(401).send('Unauthorized');
    }

    if (!enrollments[sub]) {
        enrollments[sub] = [];
    }

    if (enrollments[sub].includes(courseId)) {
        return res.status(400).send('Already enrolled in this course');
    }

    enrollments[sub].push(courseId);
    writeEnrollmentsToFile(enrollments);

    res.json();
});

/*
 * Get my enrolled course
 */
app.get('/api/me/enrollments', determineScopes, checkScope, async (req, res) => {
    const enrollments = readEnrollmentsFromFile();
    const coursesDb = readCoursesFromFile();
    // Get the user's sub from the auth object
    const sub = req.auth?.sub;

    if (!sub) {
        return res.status(401).send('Unauthorized');
    }

    // Get the user's enrollments
    const userEnrollments = enrollments[sub];

    if (!userEnrollments) {
        return res.status(404).send('No enrollments found for this user');
    }

    // Get the course objects for the user's enrollments
    const enrolledCourses = userEnrollments.map(courseId => coursesDb.find(c => c.id === courseId));
    enrolledCourses = enrolledCourses.map(course => {
        return {
            id: course.id,
            name: course.name,
            details: course.details,
            started_date: course.started_date
        };
    });
    res.json(enrolledCourses);
});

app.listen(3000, () => console.log('Server running on port 3000'));

