
var app = module.parent.exports.app;

app.post('/getqueryabledatabases', function (req, res) {
    //req.body.appid
    var context = req.ctx;
    context.Instances
        .filter(function (inst) { return inst.Id == this.Id; }, { Id: req.body.appid })
        .toArray()
        .then(function (instances) {
            return context.AppItems
                .filter(function (app) { return app.AppId in this.appId && app.Type == this.type; }, {
                    appId: instances.map(function (inst) { return inst.AppId; }),
                    type: 'QueryableDB'
                }).toArray();
        })
        .then(function (apps) {
            var resp = {
                list: apps.map(function (app) {
                    return {
                        _id: app.Id,
                        name: app.Data.dbname,
                        creationdate: app.CreationDate
                    }
                }),
                appid: req.body.appid
            }

            res.end(JSON.stringify(resp));
        });
});


app.post('/getprovisionedapplications', function (req, res) {
    //req.body.appid
    //req.body.provisionid
    var context = req.ctx;
    context.Instances
        .filter(function (inst) { return inst.AppId == this.Id && inst.ProvisionId == this.ProvisionId && inst.IsProvision == true; }, { Id: req.body.appid, ProvisionId: req.body.provisionid })
        .select(function (inst) { return { _id: inst.Id, startdate: inst.StartDate, enddate: inst.StopDate }; })
        .toArray()
        .then(function (instances) {
            var resp = {
                list: instances,
                appid: req.body.appid
            };

            res.end(JSON.stringify(resp));
        });
});

