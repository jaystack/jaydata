$C('$data.storageProviders.Storm.StormProvider', $data.StorageProviderBase, null, {
    constructor: function(cfg, ctx){
        this.context = ctx;
        this.providerConfiguration = $data.typeSystem.extend({
            url: 'http://localhost:3000/'
        }, cfg);
    },
    initializeStore: function(callback){
        callback = $data.typeSystem.createCallbackSetting(callback);
        callback.success(this.context);
    },
    executeQuery: function(query, callback){
        callBack = $data.typeSystem.createCallbackSetting(callback);
        
        query.modelBinderConfig = {};
        var modelBinder = Container.createModelBinderConfigCompiler(query, this.includes, false);
        modelBinder.Visit(query.expression);
        
        var compiler = new $data.storageProviders.InMemory.InMemoryCompiler(this);
        var compiled = compiler.compile(query);
        
        var sets = query.getEntitySets().map(function(it){ return it.name; });
        
        for (var i in compiled){
            if (i.indexOf('$') == 0){
                if (typeof compiled[i] === 'function')
                    compiled[i] = compiled[i].toString().replace('function anonymous', 'function').replace(/\n/g, ' ');
                else if (compiled[i] instanceof Array && i === '$order'){
                    for (var k = 0; k < compiled[i].length; k++){
                        if (typeof compiled[i][k] === 'function'){
                            var dir = compiled[i][k].ASC;
                            compiled[i][k] = compiled[i][k].toString().replace('function anonymous', 'function').replace(/\n/g, ' ');
                            compiled[i][k] = { fn: compiled[i][k], direction: dir };
                            /*if (compiled[i][k].ASC){
                                if (!compiled.$orderby) compiled*/
                        }else{
                            var dir = compiled[i][k].ASC;
                            compiled[i][k] = { fn: compiled[i][k], direction: dir };
                        }
                    }
                }
            }
        }
        
        /*var qs = 'db.' + sets[0];
        if (compiled.$include){
            for (var i = 0; i < compiled.$include.length; i++){
                qs += '.include("' + compiled.$include[i] + '")';
            }
        }
        if (compiled.$filter) qs += '.filter(' + compiled.$filter + ')';
        if (compiled.$order){
            for (var i = 0; i < compiled.$order.length; i++){
                qs += compiled.$order[i];
            }
        }
        if (compiled.$skip) qs += '.skip(' + compiled.$skip + ')';
        if (compiled.$take) qs += '.take(' + compiled.$take + ')';
        if (compiled.$length) qs += '.length(callback)';
        else qs += '.toArray(callback)';*/
        
        $data.ajax({
            url: this.providerConfiguration.url,
            dataType: 'json',
            data: { entitySet: sets[0], expression: compiled },
            success: function(data, textStatus, jqXHR){
                query.rawDataList = typeof data.length !== 'undefined' ? data : [{ cnt: data }];
                query.context = this;
                
                callBack.success(query);
            },
            error: function(jqXHR, textStatus, errorThrown){
                var errorData = {};
                try {
                    errorData = JSON.parse(jqXHR.responseText).error;
                } catch (e) {
                    errorData = errorThrown + ': ' + jqXHR.responseText;
                }
                callBack.error(errorData);
            }
        });
    },
    saveChanges: function(callBack, changedItems){
        var self = this;
        if (changedItems.length){
            var independentBlocks = this.buildIndependentBlocks(changedItems);
            
            var convertedItems = [];
            var collections = {};
            var entities = [];
            for (var i = 0; i < independentBlocks.length; i++){
                for (var j = 0; j < independentBlocks[i].length; j++) {
                    convertedItems.push(independentBlocks[i][j].data);
                    
                    var es = collections[independentBlocks[i][j].entitySet.name];
                    if (!es){
                        es = {};
                        collections[independentBlocks[i][j].entitySet.name] = es;
                    }
                    
                    switch (independentBlocks[i][j].data.entityState){
                        case $data.EntityState.Unchanged: continue; break;
                        case $data.EntityState.Added:
                            /*if (!es.insertAll) es.insertAll = [];
                            es.insertAll.push(this.save_getInitData(independentBlocks[i][j], convertedItems));
                            break;*/
                        case $data.EntityState.Modified:
                            /*if (!es.updateAll) es.updateAll = [];
                            es.updateAll.push(this.save_getInitData(independentBlocks[i][j], convertedItems));
                            break;*/
                        case $data.EntityState.Deleted:
                            /*if (!es.removeAll) es.removeAll = [];
                            es.removeAll.push(this.save_getInitData(independentBlocks[i][j], convertedItems));
                            break;*/
                            entities.push({
                                entitySet: independentBlocks[i][j].entitySet.name,
                                entityState: independentBlocks[i][j].data.entityState,
                                entity: independentBlocks[i][j].data,
                                data: this.save_getInitData(independentBlocks[i][j], convertedItems)
                            });
                            break;
                        default: Guard.raise(new Exception("Not supported Entity state"));
                    }
                }
            }
            
            $data.ajax({
                url: this.providerConfiguration.url,
                type: 'post',
                dataType: 'json',
                data: { items: JSON.stringify(entities.map(function(it){ return { entitySet: it.entitySet, entityState: it.entityState, data: it.data }; })) },
                success: function(data, textStatus, jqXHR){
                    for (var i = 0; i < data.items.length; i++){
                        var item = data.items[i];
                        for (var p in item){
                            entities[i].entity[p] = item[p];
                        }
                    }
                    callBack.success(data.__count);
                },
                error: function(jqXHR, textStatus, errorThrown){
                    var errorData = {};
                    try {
                        errorData = JSON.parse(jqXHR.responseText).error;
                    } catch (e) {
                        errorData = errorThrown + ': ' + jqXHR.responseText;
                    }
                    callBack.error(errorData);
                }
            });
            
        }else callBack.success(0);
    },
    save_getInitData: function(item, convertedItems) {
        item.physicalData = this.context._storageModel.getStorageModel(item.data.getType()).PhysicalType.convertTo(item.data, convertedItems);
        var serializableObject = {};
        var self = this;
        item.physicalData.getType().memberDefinitions.asArray().forEach(function (memdef) {
            if (memdef.kind == $data.MemberTypes.navProperty || memdef.kind == $data.MemberTypes.complexProperty || (memdef.kind == $data.MemberTypes.property && !memdef.notMapped)) {
                serializableObject[memdef.name] = item.physicalData[memdef.name];
            }
        }, this);
        return serializableObject;
    },
    supportedDataTypes: { value: [$data.Integer, $data.String, $data.Number, $data.Blob, $data.Boolean, $data.Date, $data.ObjectID], writable: false },
    supportedBinaryOperators: {
        value: {
            equal: { mapTo: ' == ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            notEqual: { mapTo: ' != ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            equalTyped: { mapTo: ' === ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            notEqualTyped: { mapTo: ' !== ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            greaterThan: { mapTo: ' > ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            greaterThanOrEqual: { mapTo: ' >= ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },

            lessThan: { mapTo: ' < ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            lessThenOrEqual: { mapTo: ' <= ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            or: { mapTo: ' || ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            and: { mapTo: ' && ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },

            "in": { mapTo: " in ", allowedIn: [$data.Expressions.FilterExpression] }
        }
    },
    supportedUnaryOperators: {
        value: {
            not: { mapTo: '!' }
        }
    },
    supportedSetOperations: {
        value: {
            filter: {},
            map: {},
            length: {},
            forEach: {},
            toArray: {},
            single: {},
            /*some: {
                invokable: false,
                allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "filter", dataType: "$data.Queryable" }],
                mapTo: 'any',
                frameType: $data.Expressions.SomeExpression
            },
            every: {
                invokable: false,
                allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "filter", dataType: "$data.Queryable" }],
                mapTo: 'all',
                frameType: $data.Expressions.EveryExpression
            },*/
            take: {},
            skip: {},
            orderBy: {},
            orderByDescending: {},
            first: {},
            include: {}
        },
        enumerable: true,
        writable: true
    },
    fieldConverter: {
        value: {
            fromDb: {
                '$data.Integer': function (number) { return number; },
                '$data.Number': function (number) { return number; },
                '$data.Date': function (date) { return typeof date === 'string' ? new Date(date) : date; },
                '$data.String': function (text) { return text; },
                '$data.Boolean': function (bool) { return bool; },
                '$data.Blob': function (blob) { return blob; },
                '$data.Object': function (o) { if (o === undefined) { return new $data.Object(); } return JSON.parse(o); },
                '$data.Array': function (o) { if (o === undefined) { return new $data.Array(); } return JSON.parse(o); },
                '$data.ObjectID': function (id) { return id; }
            },
            toDb: {
                '$data.Integer': function (number) { return number; },
                '$data.Number': function (number) { return number; },
                '$data.Date': function (date) { return 'ISODate("' + date.toISOString() + '")'; },
                '$data.String': function (text) { return "\"" + text + "\""; },
                '$data.Boolean': function (bool) { return bool; },
                '$data.Blob': function (blob) { return blob; },
                '$data.Object': function (o) { return JSON.stringify(o); },
                '$data.Array': function (o) { return JSON.stringify(o); },
                '$data.ObjectID': function (id) { return '"' + id + '"'; }
            }
        }
    }
}, {
    isSuppported: {
        get: function(){
            return 'XMLHttpRequest' in window;
        }
    }
});

if ($data.storageProviders.Storm.StormProvider.isSupported){
    $data.StorageProviderBase.registerProvider('storm', $data.storageProviders.Storm.StormProvider);
}
