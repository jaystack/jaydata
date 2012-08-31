
var q = require('q');

var tokensrv = module.parent.exports.tokensrv;
var app = module.parent.exports.app;
var ctx = module.parent.exports.ctx;
var provision = module.parent.exports.provision;

function createApp(req, res) {
  return ctx.findAppOwnerById(req.body.appownerid)
  .then(function(appowner) {
    var app = new $provision.Types.App({Id: req.body._id, AppOwnerId: req.body.appownerid, Name: req.body.name});
    return ctx.addapp(app, appowner, 'admin', 'admin');
   });
}

app.post('/addapp', function (req, res){
    module.parent.exports.tokenizedFunction(req, res, createApp);
});

app.post('/destroyapp', function (req, res){
    tokensrv.set(req.token, { status: 'Done', result: 'Succeeded' });
	// TODO implement it
    res.end(JSON.stringify(tokensrv.get(req.token)));
});

