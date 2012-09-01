
var app = module.parent.exports.app;
var provision = require('./provision');

function addAppDb(ctx, instance) {
  return provision.createDatabase(ctx, instance, {Data:{name:'ApplicationDB'}},
	{
	  'ApplicationDB':  {
            coll1: { x: 1 },
             coll2: { y :1 }
           }
	});
}

function addApp(req, appowner) {
  var app = new $provision.Types.App({Id: req.body._id, AppOwnerId: req.body.appownerid, Name: req.body.name});
  return req.ctx.addapp(app, appowner);
}

function createApp(req, res) {
  return req.ctx.findAppOwnerById(req.body.appownerid)
    .then(function(appowner){return addApp(req, appowner);})
    .then(function(instance){return addAppDb(req.ctx, instance);});
}

function destroyApp(req, res) {
  return 'ok';
}

app.post('/addapp', function (req, res){
    module.parent.exports.tokenizedFunction(req, res, createApp);
});

app.post('/destroyapp', function (req, res){
    module.parent.exports.tokenizedFunction(req, res, destroyApp);
});

