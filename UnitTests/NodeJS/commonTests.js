exports.Test = {
    'Q exists': function (test) {
        test.expect(2);
        
        $data.Class.define('$example.inMemoryQContext', $data.EntityContext, null, {
            Items: {
                type: $data.EntitySet,
                elementType: $data.Entity.extend('$example.inmemoryQEntity', {
                    Id: { type: 'int'},
                    Prop1: {type: 'string'}
                })
            }
        })

        var context = new $example.inMemoryQContext({ name: 'InMemory' });
        context.onReady(function(){
            var promise = context.Items.toArray();
            var q = require('q');
            
            test.equal(q.isPromise(new $data.PromiseHandlerBase().getPromise()), false, '$data.PromiseHandlerBase returns Q promise failed!');
            test.equal(q.isPromise(promise), true, '$data.PromiseHandler returns Q promise failed!' + promise);

            test.done();
        });
    },
    'Trace exists': function (test) {
        test.expect(4);

        test.equal(typeof $data.TraceBase, 'function', '$data.TraceBase exists failed');
        test.notEqual(typeof $data.Trace, 'undefined', '$data.Trace exists failed');
        test.equal(typeof $data.Logger, 'function', '$data.Logger exists failed');

        try {
            $data.Trace.log('hello', 'console', 42, { prop: 24 }, [1, 2, 3]);
            $data.Trace = new $data.Logger();
            $data.Trace.log('hello', 'console', 42, { prop: 24 }, [1, 2, 3]);
            test.ok(true, '$data.Trace log not throw exception');
            $data.Trace = new $data.TraceBase();
        } catch (e) {
            test.ok(false, '$data.Trace failed: ' + e);
        }

        test.done();
    }
}
