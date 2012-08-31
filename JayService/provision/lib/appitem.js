
var app = module.parent.exports.app;
var ctx = module.parent.exports.ctx;

function createAppItem(req, res) {
  return ctx.findAppById(req.body.appid)
  .then(function(app) {
    var appitem = new $provision.Types.AppItem({Id: req.body._id, AppId: req.body.appid, Type: req.body.type});
    delete req.body._id;
    delete req.body.appid;
    delete req.body.type;
    delete req.body.token;
    delete req.body.method;
    appitem.Data = req.body;
    return ctx.additem(appitem, app);
   });
}
function changeAppItem(req, res) { return true; }
function removeAppItem(req, res) { return true; }
function startAppItem(req, res) { return true; }
function stopAppItem(req, res) { return true; }

app.post('/addappitem', function (req, res){
    module.parent.exports.tokenizedFunction(req, res, createAppItem);
});
app.post('/changeappitem', function (req, res){
    module.parent.exports.tokenizedFunction(req, res, changeAppItem);
});
app.post('/removeappitem', function (req, res){
    module.parent.exports.tokenizedFunction(req, res, removeAppItem);
});
app.post('/startappitem', function (req, res){
    module.parent.exports.tokenizedFunction(req, res, startAppItem);
});
app.post('/stopappitem', function (req, res){
    module.parent.exports.tokenizedFunction(req, res, stopAppItem);
});

