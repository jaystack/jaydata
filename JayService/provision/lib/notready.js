
var app = module.parent.exports.app;

//app.post('/allocateappitem', function (req, res){
    //res.end(JSON.stringify({ Succeeded : true }));
//});

app.get('/launch', function (req, res){
    res.end(JSON.stringify({ Succeeded : true }));
});

app.post('/getqueryabledatabases', function (req, res){
var resp =
{
"list":[
{
"_id":"5d623177-c569-4794-98dd-344503ce90c9",
"name":"MyDatabase_0_234932.465",
"creationdate":"2012-08-30T23:49:32.4650108+02:00"
},
{
"_id":"7512b559-22f0-4f64-95c5-2f2b66214f40",
"name":"MyDatabase_1_234932.480",
"creationdate":"2012-08-30T23:49:32.4806282+02:00"
},
{
"_id":"9794822d-d2f8-4cd8-84cd-86c27ddddd7e",
"name":"MyDatabase_2_234932.496",
"creationdate":"2012-08-30T23:49:32.4962456+02:00"
}
]
};
resp.appid = req.body.appid;
    res.end(JSON.stringify(resp));
});


app.post('/getprovisionedapplications', function (req, res){
var resp =
{
"list":[
{
"_id":"5d623177-c569-4794-98dd-344503ce90c9",
"startdate":"2012-08-30T23:49:32.4650108+02:00",
"enddate": null
},
{
"_id":"5d623177-c569-4794-98dd-344503ce90c9",
"startdate":"2012-08-30T23:49:32.4650108+02:00",
"enddate": null
}
]};
resp.appid = req.body.appid;
    res.end(JSON.stringify(resp));
});

