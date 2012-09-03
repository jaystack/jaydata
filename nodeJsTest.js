require('jaydata');
require('./NewsReaderContext.js');

var reporter = require('nodeunit').reporters.default;

//Tests
exports['commonTests'] = require('./UnitTests/NodeJS/commonTests.js');
exports['EntityTransform'] = require('./UnitTests/NodeJS/EntityTransformTests.js');
exports['oDataMetaDataGenerator'] = require('./UnitTests/NodeJS/oDataMetaDataGeneratorTests.js');
exports['oDataResponseDataBuilder'] = require('./UnitTests/NodeJS/oDataResponseDataBuilderTests.js');
exports['oDataBatchTest'] = require('./UnitTests/NodeJS/oDataBatchTests.js');
exports['argumentBinderTests'] = require('./UnitTests/NodeJS/argumentBinderTests.js');
exports['oDataXmlResultTests'] = require('./UnitTests/NodeJS/oDataXmlResultTests.js');

exports['mongoProviderTests'] = require('./UnitTests/mongoProviderTests.js');

reporter.run(exports);
