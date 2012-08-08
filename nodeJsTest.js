require('jaydata');
require('./NewsReaderContext.js');

var reporter = require('nodeunit').reporters.default;

//Tests
exports['EntityTransform'] = require('./UnitTests/NodeJS/EntityTransformTests.js');
exports['oDataMetaDataGenerator'] = require('./UnitTests/NodeJS/oDataMetaDataGeneratorTests.js');
exports['oDataResponseDataBuilder'] = require('./UnitTests/NodeJS/oDataResponseDataBuilderTests.js');

reporter.run(exports);
