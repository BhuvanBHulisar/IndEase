/**
 * Injects is_demo flag onto req based on the authenticated user.
 * Must run AFTER auth middleware.
 * Usage: router.get('/route', auth, demoFilter, handler)
 */
export const demoFilter = (req, res, next) => {
    req.isDemo = !!(req.user?.is_demo);
    next();
};

/**
 * Returns a SQL fragment for filtering by demo status.
 * Usage: WHERE ${demoClause(req, 'sr')}
 */
export const demoClause = (req, alias = '') => {
    const col = alias ? `${alias}.is_demo` : 'is_demo';
    return req.isDemo ? `${col} = TRUE` : `${col} = FALSE`;
};
