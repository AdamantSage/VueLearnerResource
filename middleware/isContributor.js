// middleware/isContributor.js
const isContributor = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();  // Allow access if the user is an admin
    }
    res.status(403).send('You are not authorized to perform this action');
};

module.exports = isContributor;
