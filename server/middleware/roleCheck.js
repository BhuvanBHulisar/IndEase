/**
 * ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
 * Purpose: Ensures the current user has the correct industrial privileges.
 * e.g. Only 'producer' can accept jobs, only 'consumer' can add machines.
 */
module.exports = function (roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Industrial clearance failure. Required role: ${roles.join(' or ')}`
            });
        }

        next();
    };
};
