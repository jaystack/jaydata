(function ($data) {
    var schemaCache = {};

    $data.schemaCache = schemaCache;

    //$data.Base.extend("$data.ContextBuilder", null, {
    //    addEntityType: function (type, setName) {

    //    }
    //});

    var JayData_Schema = $data.define("JayData_Schema", {
        DatabaseName: String,
        SchemaSource: String,
        SchemaHash: $data.Integer,
        Version: Number
    });


    var JayData_SchemaStoreContext = $data.EntityContext.extend("JayData_SchemaStoreContext", {
        JayData_Schemas: { type: $data.EntitySet, elementType: JayData_Schema }
    });

    var schemaStore = new JayData_SchemaStoreContext({ provider: 'local', databaseName: 'JayData_SchemaStore__' });

    function hash(str) {
        var hash = 0, i, char;
        if (str.length == 0) return hash;
        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    $data.registerSchema = function (schemaName, source) {
        var schemaDef = schemaCache[schemaName] = schemaCache[schemaName] || {};
        //schemaDef.version = jQuery.Deferred(function (newDefer) { }).promise();
        if (source instanceof HTMLScriptElement) {
            schemaDef.sourceInfo = $.Deferred(function (newDefer) {
                newDefer.resolve({ hash: hash(source.innerText), source: source.innerText });
            }).promise();
        } else {

        }
    }

    var schemaInterceptors = {};

    $data.interceptSchemaDefinition = function (schemaName, callback) {
        schemaInterceptors[schemaName] = schemaInterceptors[schemaName] || [];
        schemaInterceptors[schemaName].push(callback);
    }

    $data.defineSchema = function (schemaName, schemaTypeFactory) {
        if (schemaInterceptors[schemaName] && schemaInterceptors[schemaName].length > 0) {
            schemaInterceptors[schemaName].forEach(function (interceptor) {
                interceptor(schemaTypeFactory);
            });
            schemaInterceptors[schemaName] = [];
        } else {
            var c = $data.createContainer();
            c.name = schemaName;
            var ctxType = schemaTypeFactory(c);
            schemaCache[schemaName] = schemaCache[schemaName] || {};
            schemaCache[schemaName].contextType = ctxType;
        }
    }



    $data.EntityContext.createFromSchema = function (schemaName, options) {
        //lookup inmemory schema cache
        //  if no schema found: check schema store
        //      if no schema: throw
        //      load schema
        //      set no version check
        //version check
        //      check if previous version exists
        //      compare
        //      init one or init two
        var schemaDef;
        if (schemaDef = schemaCache[schemaName]) {
            $.when(schemaDef.sourceInfo, schemaStore.onReady())
             .then(function (sourceInfo, schemaStore) {
                 console.log("1", arguments);
                 console.log(schemaStore);
                 //

                 return schemaStore.JayData_Schemas
                                   .filter("it.DatabaseName == dbName", { dbName: schemaName })
                                   .toArray()
                                   .then(function (items) {
                                       var actualVersion = null, oldVersion = null, saveNeeded = false;
                                       if (items.length > 0) {
                                           actualVersion = items[items.length - 1];
                                           if (actualVersion.SchemaHash !== sourceInfo.hash) {
                                               oldVersion = actualVersion;
                                               $data.interceptSchemaDefinition(schemaName, function(schemaFactory) {
                                                   var c = $data.createContainer();
                                                   oldVersion.contextType = schemaFactory(c);
                                               });
                                               eval(oldVersion.SchemaSource);
                                               actualVersion =  {
                                                   DatabaseName: schemaName,
                                                   SchemaSource: sourceInfo.source,
                                                   SchemaHash: sourceInfo.hash,
                                                   Version: actualVersion.Version + 1
                                               };
                                           };
                                       } else {
                                           actualVersion = {
                                               DatabaseName: schemaName,
                                               SchemaSource: sourceInfo.source,
                                               SchemaHash: sourceInfo.hash,
                                               Version: 1
                                           };
                                           schemaStore.JayData_Schemas.add(actualVersion);
                                           schemaStore.saveChanges();
                                       }
                                       actualVersion.contextType = schemaDef.contextType;

                                       var promises = [];
                                       //var actualCtxInstance = new actualVersion.contextType({ provider: 'local', databaseName: schemaName + actualVersion.Version });
                                       //promises.push(actualCtxInstance.onReady());

                                       if (oldVersion) {
                                           console.log("old version exists!");
                                           var oldCtxInstance = new oldVersion.contextType({ provider: 'local', databaseName: schemaName + oldVersion.Version });
                                           //promises.push(oldCtxInstance.onReady());
                                       }
                                       //$.when.apply({}, promises)
                                       //      .then(function () {
                                       //          if ((arguments.length > 1) && options.onSchemaChange) {
                                       //              var defer = $.Deferred();
                                       //              var result = options.onSchemaChange(defer, arguments[0], arguments[1]);
                                       //              return defer.promise();
                                       //          }
                                       //      })
                                       //      .then(function () {
                                       //          alert("sync is done!");
                                       //      });
                                   }).fail(function () {
                                       alert("!");
                                   });
             })
        } else {

        }

    }

})($data);


