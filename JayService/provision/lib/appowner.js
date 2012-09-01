
var q = require('q');

var tokensrv = module.parent.exports.tokensrv;
var app = module.parent.exports.app;

function createAppOwner(req, res) {
    var appowner = new $provision.Types.AppOwner({Id: req.body._id});
    return req.ctx.addappowner(appowner);
}

app.post('/addappowner', function (req, res){
    module.parent.exports.tokenizedFunction(req, res, createAppOwner);
});

