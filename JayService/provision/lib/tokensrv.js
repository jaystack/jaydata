
var tokenstore = require('dirty')('tokens');

module.exports = exports = {

    parseToken: function() {
        return function parseToken(req, res, next) {
            var token = req.body.token;
            if (typeof token !== 'undefined' && token != null) {
                tokenstore.set(token, { status: 'running' });
                req.token = token;
            }
            next();
        }
    },

    set: function(key, value) {
        tokenstore.set(key, value);
    },

    get: function(key) {
        return tokenstore.get(key);
    }
}
