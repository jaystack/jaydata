import $data, { $C, Guard, Container, Exception, MemberDefinition } from 'jaydata/core';

var strategy = {
    name: 'batch',
    condition: function (provider, convertedItems) {
        var disabled = false;
        if(typeof provider.providerConfiguration.disableBatch !== 'undefined'){
            disabled = !!provider.providerConfiguration.disableBatch;
        } else {
            disabled = !!$data.defaults.OData.disableBatch;
        }
        
        if (!disabled) {
            var requests = convertedItems.getItems();
            return requests.length > 1;
        }
        
        return false;
    },
    save: function (provider, convertedItems, callBack) {
        var that = provider;
        var items = convertedItems.getItems();
        var requests = items.map(function(it){ return it.request.build().get() })
        
        var requestData = [{
            requestUri: that.providerConfiguration.oDataServiceHost + "/$batch",
            method: "POST",
            data: {
                __batchRequests: [{ __changeRequests: requests }]
            },
            headers: {
            }
        }, function (data, response) {
            if (response.statusCode == 200 || response.statusCode == 202) {
                var result = data.__batchResponses[0].__changeResponses;
                var errors = [];

                for (var i = 0; i < result.length; i++) {
                    if (result[i].statusCode >= 200 && result[i].statusCode < 300) {
                        var item = convertedItems.getByResponse(result[i], i);
                        if(item instanceof $data.Entity && result[i].statusCode != 204){
                            that.reload_fromResponse(item, result[i].data, result[i]);
                            convertedItems.setProcessed(item);
                        }
                    } else {
                        errors.push(that.parseError(result[i]));
                    }
                }
                if (errors.length > 0) {
                    if (errors.length === 1) {
                        callBack.error(errors[0]);
                    } else {
                        callBack.error(new Exception('See inner exceptions', 'Batch failed', errors));
                    }
                } else if (callBack.success) {
                    callBack.success(convertedItems.length);
                }
            } else {
                callBack.error(that.parseError(response));
            }

        }, function (e) {
            callBack.error(that.parseError(e));
        }, that.oData.batch.batchHandler];

        if (typeof that.providerConfiguration.useJsonLight !== 'undefined') {
            requestData[0].useJsonLight = that.providerConfiguration.useJsonLight;
        }

        that.appendBasicAuth(requestData[0], that.providerConfiguration.user, that.providerConfiguration.password, that.providerConfiguration.withCredentials);

        that.context.prepareRequest.call(that, requestData);
        that.oData.request.apply(that, requestData);
    }
}


export { strategy }