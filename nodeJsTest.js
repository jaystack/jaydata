require('jaydata');
require('./NewsReaderContext.js');

var reporter = require('nodeunit').reporters.default;

//Server Files
require('./JayService/EntityTransform.js');
require('./JayService/oDataMetaDataGenerator.js');
require('./JayService/oDataResponseDataBuilder.js');

//Tests
exports['EntityTransform'] = require('./UnitTests/NodeJS/EntityTransformTests.js');
exports['oDataMetaDataGenerator'] = require('./UnitTests/NodeJS/oDataMetaDataGeneratorTests.js');
exports['oDataResponseDataBuilder'] = require('./UnitTests/NodeJS/oDataResponseDataBuilderTests.js');

reporter.run(exports);
