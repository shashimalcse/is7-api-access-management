import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

const scopes = {
    'pending': 'courses:read-pending',
    'approved': 'courses:read-approved',
    'published': 'courses:read-all'
};

export const determineScopeForCourseStatus = (req, res, next) => {

    var requiredScope
    if (req.path === '/api/courses') {
        if (req.method === 'GET') {
            const status = typeof req.query.status === 'string' ? req.query.status.toLowerCase() : 'published';
            // Default to 'courses:read-all' if status is not recognized
            requiredScope = scopes[status] || 'courses:read-all';
        }
    }
    // Store the required scope in the request object for later use
    req.requiredScope = requiredScope;
    next();
}

export const jwtCheck = expressjwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://localhost:9443/oauth2/jwks'
    }),
    audience: 'Qi757PrbaGjyVY8fzCCj4_MaLP8a',
    issuer: 'https://localhost:9443/oauth2/token',
    algorithms: ['RS256']
});

export const checkScope = (req, res, next) => {
    if (!req.auth || !req.auth.scope || req.auth.scope.split(' ').indexOf(req.requiredScope) < 0) {
        return next(new Error('Cannot perform action. Missing scope ' + req.requiredScope));
    }
    next();
}
