import express from 'express';
import { expressjwt, GetVerificationKey, Request as JWTRequest } from "express-jwt";
import jwksRsa from 'jwks-rsa';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
app.use(express.json());

interface Course {
    id: number;
    name: string;
    details: string;
    pending: boolean;
    published: boolean
}

// Mock database
const coursesDb: Course[] = [
    { id: 1, name: 'Course 1', details: 'Details of Course 1', pending: false, published: true },
];

// Enrollment mock database
const enrollments: { [sub: string]: number[] } = {};


const jwtCheck = expressjwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://localhost:9444/oauth2/jwks'
    }) as GetVerificationKey,
    audience: 'MPydZFwuXfZfhdqHB_FnHRIjUKYa',
    issuer: 'https://localhost:9444/oauth2/token',
    algorithms: ['RS256']
});

const checkScope = (expectedScope: string) => {
    return function (req: JWTRequest, res: any, next: (err?: Error) => void) {
        if (!req.auth || !req.auth.scope || req.auth.scope.split(' ').indexOf(expectedScope) < 0) {
            return next(new Error('Cannot perform action. Missing scope ' + expectedScope));
        }
        next();
    };
}

/*
 * Courses API
 */
app.use('/api', jwtCheck, function (req: JWTRequest, res, next) {
    if (req.auth?.sub) {
        console.log(req.auth?.scope)
    }
    next();
});

/* 
 * Get all courses
 */
app.get('/api/courses', checkScope("courses:read-all"), async (req, res) => {
    const activeCourses = coursesDb.filter(course => course.published === true);
    res.json(activeCourses);
});

/*
 * Get a specific course
 */
app.get('/api/courses/:courseId', checkScope("courses:read"), async (req, res) => {
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
app.post('/api/courses', checkScope('courses:create'), async (req, res) => {
    const newCourse: Course = req.body;
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
app.put('/api/courses/:courseId', checkScope('courses:update'), async (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const course = coursesDb.find(c => c.id === courseId);
    if (!course ||  course.pending) {
        res.status(404).send('Course not found');
    }
    const updateCourse: Course = req.body;
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

app.get('/api/courses/pending', checkScope('courses:read-pending'), async (req, res) => {
    const activeCourses = coursesDb.filter(course => course.pending === true);
    res.json(activeCourses);
});

app.put('/api/courses/:courseId/approve', checkScope('courses:approve'), async (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const course = coursesDb.find(c => c.id === courseId && c.pending === true);

    if (!course) {
        return res.status(404).send('Course not found');
    }

    course.pending = false;
    res.json(course);
});

app.put('/api/courses/:courseId/publish', checkScope('courses:publish'), async (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const course = coursesDb.find(c => c.id === courseId && c.pending === false);

    if (!course) {
        return res.status(404).send('Course not found');
    }

    course.published = true;
    res.json(course);
});

app.post('/api/courses/:courseId/enroll', checkScope('courses:enroll'), async (req : JWTRequest, res) => {
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

app.get('/api/enrollments', checkScope('enrollments:read'), async (req: JWTRequest, res) => {
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

