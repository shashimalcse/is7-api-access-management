import e from 'express';
import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

const scopes = {
    'pending': 'courses:read-pending',
    'approved': 'courses:read-approved',
    'published': 'courses:read-published'
};

export const determineScopes = (req, res, next) => {

    var requiredScope
    if (req.path === '/api/courses') {
        if (req.method === 'GET') {
            const status = typeof req.query.status === 'string' ? req.query.status.toLowerCase() : 'published';
            requiredScope = scopes[status] || 'courses:read-published';
        }
        else if (req.method === 'POST') {
            requiredScope = 'courses:write';
        }
    }
    else if (req.path.match(/\/api\/courses\/\d+/)) {
        if (req.method === 'GET') {
            requiredScope = 'courses:read';
        }
        else if (req.method === 'PUT') {
            requiredScope = 'courses:update';
        }
        else if (req.method === 'DELETE') {
            requiredScope = 'courses:delete';
        }
        else if (req.method === 'PATCH') {
            const status = req.body.status;
            console.log(status)
            if (status === 'approved') {
                requiredScope = 'courses:approve';
            }
            else if (status === 'published') {
                requiredScope = 'courses:publish';
            }
            console.log(requiredScope)
        }
    }
    else if (req.path.match(/\/api\/courses\/\d+\/enrollments/)) {
        if (req.method === 'POST' || req.method === 'DELETE') {
            requiredScope = 'courses:enroll';
        }   

    }
    else if (req.path === '/api/me/enrollments') {
        if (req.method === 'GET') {
            requiredScope = 'courses:read';
        }
    }
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
        res.status(401).send('Cannot perform action. Missing scope ' + req.requiredScope);
        return;
    }
    next();
}
