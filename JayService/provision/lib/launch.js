
var q = require('q');

var app = module.parent.exports.app;

function genjson(app, instances) {
    var json = {};
    json.type = 'init-compute-unit';
    json.appOwner = ''; // FIXME
    json.application = {};
    json.application.type = 'application';
    json.application.appID = app.appid;
    json.application.hosts = [ app.appid+'.jaystack.net']; // FIXME
    json.application.processLogin = ''; // FIXME
    json.application.processPassword = ''; // FIXME
    return json;
}

// ez csak nem provisionalt app eseten fut le
// provisionalas eseten a launch automatikus
function launchImpl(appid) {
    var defer = q.defer();
    q.ncall(model.findApp, model, appid)
//        .then(function(app) { console.log(JSON.stringify(app)); return app; })
        .then(function(app) { return q.ncall(reserve, this, app); })
//        .then(function(x) { console.log(x); return x; })
        .spread(function(app, instances) { defer.resolve(instances); return [app, instances]; })
        .fail(function(reason) { defer.reject(reason); })
        .spread(function(app, instances) {  return genjson(app, instances); })
        .then(function(x) { console.log(JSON.stringify(x)); })
    return defer.promise;
}

module.exports = {

    // nem provisionalt alkalmazas eseten
    launch: function(appid) {
        return launchImpl(appid);
    }

}

