const isAuthenticated = (req, res, next) => {
    if (req.session.isAuthenticated) {
        // User is authenticated, proceed to the next middleware
        next();
    } else {
        // User is not authenticated, send an unauthorized response
        res.redirect('/');
        res.status(401).json({ message: 'Unauthorized' });
    }
};

export default isAuthenticated;


