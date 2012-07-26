exports.tests = {
    'oDataResponseDataBuilder exists': function (test) {
        test.expect(1);
        test.equal(typeof $data.oDataServer.oDataResponseDataBuilder, 'function', '$data.oDataServer.oDataResponseDataBuilder exists');
        test.done();
    }
};