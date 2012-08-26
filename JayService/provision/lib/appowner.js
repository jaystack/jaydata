
var q = require('q');

var mongoose = module.parent.exports.mongoose
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var tokensrv = module.parent.exports.tokensrv;

var app = module.parent.exports.app;

var AppOwnerSchema = new Schema({
    id: { type: String, unique: true },
    login : { type: String, unique: true, index: true },
    password: { type: String, index: false },
    passwordsalt: { type: String, index: false },
    enabled: { type: Boolean, index: false }
});

var AppOwner = mongoose.model('AppOwner', AppOwnerSchema);

function createAppOwner(req, res) {
    var defer = q.defer();
    var appowner = new AppOwner({
        id: req.body._id,
        login: req.body.login,
        password: req.body.password,
        passwordsalt: req.body.passwordsalt,
        enabled: req.body.enabled
    });
    appowner.save(function (err) {
        if (!err) {
console.log('create appowner ok')
            defer.resolve();
        } else {
console.log('create appowner err')
console.log(err);
            defer.reject(err);
        }
    });
    return defer.promise;
}

// ez tulajdonkeppen valami template kellene legyen...
//app.post('/appowners', function (req, res){
app.post('/addappowner', function (req, res){
    var promise = createAppOwner(req, res);
    q.when(promise)
        .then(function(result) {
console.log('set token ok '+req.token);
            tokensrv.set(req.token, { status: 'Done', result: 'Succeeded' });
        })
        .fail(function(reason) {
console.log('set token error '+req.token);
            tokensrv.set(req.token, { status: 'Done', result: 'Failed', reason: reason });
        })
    res.end(JSON.stringify(tokensrv.get(req.token)));
});

