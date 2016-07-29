global.__jaydataModuleRoot = __dirname;
module.exports = require('./lib/Types/StorageProviders/SqLite/index.js');
delete global.__jaydataModuleRoot;