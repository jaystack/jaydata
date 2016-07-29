global.__jaydataModuleRoot = __dirname;
module.exports = require('./lib/Types/StorageProviders/mongoDB/index.js');
delete global.__jaydataModuleRoot;