import $data, { $C, Guard, Container, Exception, MemberDefinition } from 'jaydata/core';

var strategy = {
    name: 'single',
    condition: function (provider, convertedItems) {
        var requests = convertedItems.getItems();
        return requests.length > 0;
    },
    save: function (provider, convertedItems, callBack) {
        var that = provider;
        var items = convertedItems.getItems();
        
        var doSave = function(items, index, done){
            var item = items[index];
            if(!item) return done()
            
            var request = item.request.build().get();
            var requestData = [request, function (data, response) {
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    var item = convertedItems.getByResponse(response, index);
                    if(item instanceof $data.Entity && response.statusCode != 204){
                        that.reload_fromResponse(item, data, response);
                        convertedItems.setProcessed(item);
                    }

                    doSave(items, ++index, done);
                } else {
                    done(response);
                }

            }, done];

            that.appendBasicAuth(requestData[0], that.providerConfiguration.user, that.providerConfiguration.password, that.providerConfiguration.withCredentials);
            that.context.prepareRequest.call(that, requestData);
            that.oData.request.apply(that, requestData);
        }
        
        doSave(items, 0, function(err, result){
            if(err) return callBack.error(that.parseError(err));
            callBack.success(result);
        })
    }
}


export { strategy }