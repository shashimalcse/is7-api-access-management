import express from 'express';
import cors from 'cors';
import { jwtCheck, determineScopes, checkScope } from './middleware/jwt.js';
import { readCoursesFromFile, writeCoursesToFile, readEnrollmentsFromFile, writeEnrollmentsToFile, ensureFileExists } from './utils/jsonio.js';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
app.use(express.json());
// Allow cross-origin requests
app.use(cors());

// Ensure courses.json and enrollments.json exist
ensureFileExists('courses.json', []);
ensureFileExists('enrollments.json', {});

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
 * Get course by id
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
 * Update course by id
 */
app.put('/api/courses/:courseId', determineScopes, checkScope, async (req, res) => {
    const coursesDb = readCoursesFromFile();
    const courseId = parseInt(req.params.courseId);
    const course = coursesDb.find(c => c.id === courseId);
    if (!course) {
        res.status(404).send('Course not found');
    }
    if (!course.pending) {
        return res.status(400).send('Cant update a course that is not pending');
    }
    const updateCourse = req.body;
    // Validate input
    if (!updateCourse) {
        return res.status(400).send('Invalid course data');
    }
    if (updateCourse.name) {
        course.name = updateCourse.name;
    }
    if (updateCourse.details) {
        course.details = updateCourse.details;
    }
    if (updateCourse.started_date) {
        course.started_date = updateCourse.started_date;
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
 * Update course status by id
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
 * Delete course by id
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

    const sub = req.auth.sub;

    const status = req.body.status;

    if (status === 'enroll') {
        if (!enrollments[sub]) {
            enrollments[sub] = [];
        }
    
        if (enrollments[sub].includes(courseId)) {
            return res.status(400).send('Already enrolled in this course');
        }
        enrollments[sub].push(courseId);
    } else if (status === 'unenroll') {
        if (!enrollments[sub].includes(courseId)) {
            return res.status(400).send('Not enrolled in this course');
        }
        enrollments[sub] = enrollments[sub].filter(c => c !== courseId);
    }

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
    const sub = req.auth.sub;

    // Get the user's enrollments
    const userEnrollments = enrollments[sub];

    if (!userEnrollments) {
        return res.json([]);
    }

    // Get the course objects for the user's enrollments
    var enrolledCourses = userEnrollments.map(courseId => coursesDb.find(c => c.id === courseId));
    if (!enrolledCourses) {
        return res.json([]);
    }
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

