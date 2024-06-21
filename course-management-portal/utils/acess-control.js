//function that get roles of the user and action and based on roles and action decide it can be performed or not

export function canPerformAction(roles, action) {

    const roleActions = {
        student: ['read-published', 'enroll'],
        lecturer: ['create', 'update', 'read-published', 'read-pending', 'read-approved'],
        administrator: ['approve', 'publish', 'delete', 'read-published', 'read-pending', 'read-approved']
    }

    if (!Array.isArray(roles)) {
        roles = [roles];
    }

    return roles.some(role => roleActions[role] && roleActions[role].includes(action));
}
