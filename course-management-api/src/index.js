import express from 'express';
import { jwtCheck, determineScopeForCourseStatus, checkScope } from './middleware/jwt.js';
import e from 'express';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
app.use(express.json());
app.use(jwtCheck);

// Mock database
const coursesDb = [
    { id: 1, name: 'Course 1', details: 'Details of Course 1', pending: false, published: true },
];

// Enrollment mock database
const enrollments = {};

/*
 * Courses API
 */
app.use('/api', jwtCheck, async (req, res, next) => {
    next();
});

/* 
 * Get all courses
 */
app.get('/api/courses', determineScopeForCourseStatus, checkScope, async (req, res) => {
    var courses;
    if (req.query.status === 'pending') {
        courses = coursesDb.filter(course => course.pending === true);
    } else if (req.query.status === 'approved') {
        courses = coursesDb.filter(course => course.pending === false);
    } else {
        courses = coursesDb.filter(course => course.published === true);
    }
    res.json(courses);
});

/*
 * Get a specific course
 */
app.get('/api/courses/:courseId', determineScopeForCourseStatus, checkScope, async (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const course = coursesDb.find(c => c.id === courseId);
    if (course && course.published === true) {
        res.json(course);
    } else {
        res.status(404).send('Course not found');
    }
});

/*
 * Create a new course
 */
app.post('/api/courses', determineScopeForCourseStatus, checkScope, async (req, res) => {
    const newCourse = req.body;
    // Validate input
    if (!newCourse || !newCourse.name || !newCourse.details) {
        return res.status(400).send('Invalid course data');
    }
    // Assign an id to the new course
    newCourse.id = coursesDb.length + 1;
    newCourse.pending = true;
    newCourse.published = false;
    // Add the new course to the database
    coursesDb.push(newCourse);
    // Return the new course
    res.json(newCourse);
});

/*
 * Update a course
 */
app.put('/api/courses/:courseId', determineScopeForCourseStatus, checkScope, async (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const course = coursesDb.find(c => c.id === courseId);
    if (!course ||  course.pending) {
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
    res.json(course);
});

app.put('/api/courses/:courseId/approve', determineScopeForCourseStatus, checkScope, async (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const course = coursesDb.find(c => c.id === courseId && c.pending === true);

    if (!course) {
        return res.status(404).send('Course not found');
    }

    course.pending = false;
    res.json(course);
});

app.put('/api/courses/:courseId/publish', determineScopeForCourseStatus, checkScope, async (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const course = coursesDb.find(c => c.id === courseId && c.pending === false);

    if (!course) {
        return res.status(404).send('Course not found');
    }

    course.published = true;
    res.json(course);
});

app.post('/api/courses/:courseId/enroll', determineScopeForCourseStatus, checkScope, async (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const course = coursesDb.find(c => c.id === courseId);

    if (!course) {
        return res.status(404).send('Course not found');
    }

    // Get the user's sub from the auth object
    const sub = req.auth?.sub;

    if (!sub) {
        return res.status(401).send('Unauthorized');
    }

    // If the user is not in the enrollments dictionary, add them
    if (!enrollments[sub]) {
        enrollments[sub] = [];
    }

    // If the user is already enrolled in the course, return an error
    if (enrollments[sub].includes(courseId)) {
        return res.status(400).send('Already enrolled in this course');
    }

    // Enroll the user in the course
    enrollments[sub].push(courseId);

    res.json(course);
});

app.get('/api/courses/enrollments', determineScopeForCourseStatus, checkScope, async (req, res) => {
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

    res.json(enrolledCourses);
});

app.listen(3000, () => console.log('Server running on port 3000'));

