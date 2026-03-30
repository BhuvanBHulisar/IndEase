/**
 * ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
 * Purpose: Ensures the current user has the correct industrial privileges.
 * e.g. Only 'producer' can accept jobs, only 'consumer' can add machines.
 */
export const roleCheck = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        console.log(`[RBAC] User: ${req.user.email}, Role: ${req.user.role}, Required: ${roles.join(', ')}`);
        
        if (req.user.role === 'admin' || roles.includes(req.user.role)) {
            return next();
        }

        return res.status(403).json({
            message: `Industrial clearance failure. Required role: ${roles.join(' or ')}`
        });
    };
};
