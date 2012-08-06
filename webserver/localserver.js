/**
 * Created with JetBrains WebStorm.
 * User: zpace
 * Date: 7/19/12
 * Time: 12:28 PM
 * To change this template use File | Settings | File Templates.
 */

var c = require('connect');
var app = c();
app.use("/", c["static"]("../"));
app.listen(8888);
