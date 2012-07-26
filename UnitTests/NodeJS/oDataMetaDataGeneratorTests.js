exports.tests = {
    'MetaDataGenerator exists': function (test) {
        test.expect(1);
        test.equal(typeof $data.oDataServer.MetaDataGenerator, 'function', '$data.oDataServer.MetaDataGenerator exists');
        test.done();
    }
};