require('jaydata');
try{ require('jaydata-mongodb-pro'); }catch(err){}
require('./NewsReaderContext.js');

$data.Class.define('$data.Logger', $data.TraceBase, null, {
    log: function () {},
    warn: function () {},
    error: function () {}
});

require('./test_Node.js');

var reporter = require('nodeunit').reporters.default;

//Tests
exports['commonTests'] = require('./UnitTests/NodeJS/commonTests.js');
exports['EntityTransform'] = require('./UnitTests/NodeJS/EntityTransformTests.js');
exports['oDataMetaDataGenerator'] = require('./UnitTests/NodeJS/oDataMetaDataGeneratorTests.js');
exports['oDataResponseDataBuilder'] = require('./UnitTests/NodeJS/oDataResponseDataBuilderTests.js');
exports['oDataBatchTest'] = require('./UnitTests/NodeJS/oDataBatchTests.js');
//exports['oDataGeoTests'] = require('./UnitTests/NodeJS/oDataGeoTests.js');
exports['argumentBinderTests'] = require('./UnitTests/NodeJS/argumentBinderTests.js');
exports['oDataXmlResultTests'] = require('./UnitTests/NodeJS/oDataXmlResultTests.js');

try{ exports['mongoProviderTests'] = require('./Pro/UnitTests/mongoProviderTests.js'); }
catch(err){ exports['mongoProviderTests'] = require('./UnitTests/mongoProviderTests.js'); }

reporter.run(exports, null, function(){
    process.exit();
});
