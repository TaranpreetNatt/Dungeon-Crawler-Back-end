const auth = function(req, res, next) {
    if (req.session && req.session.loggedin && req.session.email) return next();
    else return res.status(401).send("Unauthorized. Please log in and try again.");;
};

const loggedInAlert = function(req, res, next) {
    // console.log(req.session);
    if (req.session.loggedin) return res.send("Already logged-in. Please logout first or return back home.");
    else return next();
};

module.exports.auth = auth;
module.exports.loggedInAlert = loggedInAlert;