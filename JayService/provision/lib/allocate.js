
var app = module.parent.exports.app;

app.post('/allocateappitem', function (req, res){
    res.end(JSON.stringify({ Succeeded : true }));
});

