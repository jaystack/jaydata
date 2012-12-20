(function ($data) {

    var oldProcessor = $data.Entity.inheritedTypeProcessor;
    $data.Entity.inheritedTypeProcessor = function (type) {

        var memberDefinitions = type.memberDefinitions;

        function getKendoTypeName(jayDataTypeName) {
            jayDataTypeName = $data.Container.resolveName(jayDataTypeName);
            switch (jayDataTypeName) {
                case "$data.Blob":
                case "$data.String":
                    return "string";
                case "$data.Boolean":
                    return "boolean";
                case "$data.Integer":
                case "$data.Number":
                    return "number";
                case "$data.Date":
                    return "date";
                default:
                    return 'object'; // TODO ???
                    throw new Error("unimplemented: " + jayDataTypeName);
            }
        };


        function createKendoModel(newInstanceDelegate) {
            console.log("creating type");
            var memberDefinitions = type.memberDefinitions,
                fields = {};

            memberDefinitions
                .getPublicMappedProperties()
                .forEach(function (pd) {
                    //if (pd.dataType !== "Array" && !(pd.inverseProperty)) {
                    fields[pd.name] = {
                        type: getKendoTypeName(pd.type),
                        nullable: false,
                        editable: !pd.computed,
                        //defaultValue: pd.type === "Edm.Boolean" ? true : undefined,
                        validation: {
                            required: pd.required
                        }
                    }
                    //};
                });


            console.dir(memberDefinitions.getPublicMappedMethods());
            var modelDefinition = {
                fields: fields,
                init: function (data) {
                    //console.dir(arguments);
                    var jayInstance = data instanceof type ? data : new type(data);

                    var seed = jayInstance.initData;
                    var feed = {};
                    //TODO create precompiled strategy
                    for (var j in seed) {
                        var md = type.getMemberDefinition(j);
                        var seedValue = seed[j];
                        if (seedValue instanceof $data.Entity) {
                            var kendoInstance = seedValue.asKendoObservable();
                            feed[j] = kendoInstance;
                        } else if (md && md.type === "Array") {
                            var jayType = $data.Container.resolveType(md.elementType);
                            var kendoType = jayType.asKendoModel();
                            var feedValue = new kendo.data.ObservableArray(seed[j], kendoType);
                            feed[j] = feedValue;
                        } else {
                            feed[j] = seedValue;
                        }
                    }

                    var self = this;
                    this.innerInstance = function () { return jayInstance }



                    kendo.data.Model.fn.init.call(this, feed);
                    jayInstance.propertyChanged.attach(function (obj, propinfo) {
                        self.set(propinfo.propertyName, propinfo.newValue)
                    });
                    this.bind("set", function (e) {
                        var v = jayInstance[e.field];
                        if (v !== e.value) {
                            jayInstance[e.field] = e.value;
                        }
                    });
                    if (newInstanceDelegate) {
                        newInstanceDelegate(jayInstance);
                    }
                },
                save: function () {
                    this.innerInstance().save();
                }

            };

            var keyProperties = memberDefinitions.getKeyProperties();
            switch (keyProperties.length) {
                case 0:
                    break;
                case 1:
                    modelDefinition.id = keyProperties[0].name;
                    break;
                default:
                    console.warn("entity with multiple keys not supported");
                    break;
            }

            var returnValue = kendo.data.Model.define(modelDefinition);
            //TODO align with kendoui concept
            for (var j in returnValue.prototype.defaults) {
                returnValue.prototype.defaults[j] = undefined;
            }
            //console.log("default", returnValue.prototype.defaults)
            return returnValue;
        }

        function asKendoModel(newInstanceDelegate) {
            var cacheObject = newInstanceDelegate || type;
            return cacheObject.kendoModelType || (cacheObject.kendoModelType = createKendoModel(newInstanceDelegate));
        }

        function asKendoObservable(instance) {

            var kendoModel = type.asKendoModel();
            return new kendoModel(instance);
        }

        type.asKendoModel = asKendoModel;

        type.prototype.asKendoObservable = function () {
            var self = this;

            var kendoObservable = asKendoObservable(this);

            return kendoObservable;
        }

        if (oldProcessor) {
            oldProcessor(type);
        }
    }
    $data.Queryable.addMember("asKendoColumns", function (columns) {
        //console.log('col', this, arguments);
        var result = [];
        columns = columns || {};
        this.defaultType
            .memberDefinitions
            .getPublicMappedProperties()
            .forEach(function (pd) {
                //if (pd.dataType !== "Array" && !(pd.inverseProperty)) {
                var col = (columns[pd.name] ? columns[pd.name] : {});
                var colD = { field: pd.name };
                $.extend(colD, col)
                result.push(colD);
                //}
            });

        function append(field) {
            field = Array.isArray(field) ? field : [field];
            var result = this.concat(field);
            return prepareResult(result);
        }

        function prepend(field) {
            field = Array.isArray(field) ? field : [field];
            var result = field.concat(this);
            return prepareResult(result);
        }

        function setColumn(colName, def) {
            var it = this.filter(function (item) { return item.field == colName })[0];
            $.extend(it, def);
            return this;
        }


        function prepareResult(r) {
            r.prepend = prepend;
            r.append = append;
            r.setColumn = setColumn;
            return r;
        }
        return prepareResult(result);
        //return ['id', 'Year', 'Manufacturer', { command: ["edit", "create", "destroy", "update"] }];
    }),

    //, { command: ["edit", "create", "destroy", "update"]}
    $data.EntityContext.addProperty("EntitySetNames", function () {
        var self = this;
        //var sets = Object.keys(self._entitySetReferences);
        //return sets;
        return Object.keys(self._entitySetReferences).map(function (set) {
            return self._entitySetReferences[set].tableName;
        });
    });


    $data.Queryable.addMember("asKendoModel", function (newInstanceDelegate) {
        return this.defaultType.asKendoModel(newInstanceDelegate);

    });

    $data.Queryable.addMember("asKendoRemoteTransportClass", function (modelItemClass) {
        var self = this;
        var ctx = self.entityContext;
        function reset() {
            ctx.stateManager.reset();
        };
        var TransportClass = kendo.data.RemoteTransport.extend({
            init: function (dynamicEntries) {
                this.de = dynamicEntries;
                this.items = [];
            },
            read: function (options) {
                var query = self;
                var _this = this;
                if (options.data.filter) {

                    //console.log(options.data.filter);

                    var filter = "";
                    var thisArg = {};
                    options.data.filter.filters.forEach(function (f, index) {
                        if (index > 0) { filter += options.data.filter.logic == "or" ? " || " : " && "; }

                        //console.log(filter, f);

                        switch (f.operator) {
                            case 'eq':
                                filter += "it." + f.field;
                                filter += " == this." + f.field;
                                break;
                            case 'neq':
                                filter += "it." + f.field;
                                filter += " != this." + f.field;
                                break;
                            case 'startswith':
                                filter += "it." + f.field;
                                filter += ".startsWith(this." + f.field + ")";
                                break;
                            case 'contains':
                                filter += "it." + f.field;
                                filter += ".contains(this." + f.field + ")";
                                break;
                            case 'doesnotcontain':
                                filter += "!";
                                filter += "it." + f.field;
                                filter += ".contains(this." + f.field + ")";
                                break;
                            case 'endswith':
                                filter += "it." + f.field;
                                filter += ".endsWith(this." + f.field + ")";
                                break;
                            case 'gte':
                                filter += "it." + f.field;
                                filter += " >= this." + f.field;
                                break;
                            case 'gt':
                                filter += "it." + f.field;
                                filter += " > this." + f.field;
                                break;
                            case 'lte':
                                filter += "it." + f.field;
                                filter += " <= this." + f.field;
                                break;
                            case 'lt':
                                filter += "it." + f.field;
                                filter += " < this." + f.field;
                                break;
                            default:
                                console.log('unknown operator', f.operator);
                                break;
                        }
                        thisArg[f.field] = f.value;
                    })
                    query = query.filter(filter, thisArg);
                }
                if (options.data.sort) {
                    options.data.sort.forEach(function (s) {
                        query = query.order((s.dir == 'desc' ? "-" : "") + s.field);
                    })
                }
                var qcount = query;
                var q = query.skip(options.data.skip).take(options.data.take);
                //Data.defaultHttpClient.enableJsonpCallback = true;
                var ta = q.toArray();
                var l = qcount.length();
                jQuery.when(ta, l).then(function (items, total) {
                    //var result = items.map(function (item) { return item instanceof $data.Entity ? new model(item.initData) : item; });
                    var result = items.map(function (item) {
                        var d = (item instanceof $data.Entity) ? item.initData : item;
                        var kendoItem = item.asKendoObservable();
                        return kendoItem;
                    });

                    options.success({
                        data: result,
                        total: total
                    });
                });
            },
            create: function (options, model) {

                if (model.length > 1) {
                    var modelItems = [];
                    model.forEach(function (modelItem) {
                        modelItems.push(modelItem.innerInstance());
                    });
                    ctx.addMany(modelItems);
                    ctx.saveChanges().then(function () {
                        var data = [];
                        modelItems.forEach(function (modelItem) {
                            data.push(modelItem.initData);
                        });
                        options.success({ data: data });
                    }).fail(function () {
                        console.log("error in create");
                        options.error({}, arguments);
                        ctx.stateManager.reset();
                    });
                } else {
                    //console.log("save single");
                    model[0]
                        .innerInstance()
                        .save()
                        .then(function () {
                            options.success({ data: model[0].innerInstance().initData });
                        });
                }
            },
            update: function (options, model) {
                //console.log("update");
                //console.dir(arguments);

                if (model.length > 1) {
                    var items = model.map(function (item) { return item.innerInstance() });
                    items.forEach(function (item) {
                        ctx.attach(item, true);
                    });
                    ctx.saveChanges().then(function () {
                        options.success();
                    }).fail(function () {
                        ctx.stateManager.reset();
                        alert("error in batch update");
                        options.error({}, "error");
                    });
                } else {
                    model[0].innerInstance().save().then(function (item) {
                        options.success();
                    }).fail(function () { alert("error in update") });
                }
            },

            destroy: function (options, model) {
                if (model.length > 1) {
                    model.forEach(function (item) {
                        ctx.remove(item.innerInstance());
                    });
                    ctx.saveChanges().then(function () {
                        options.success({ data: options.data });
                    }).fail(function () {
                        ctx.stateManager.reset();
                        alert("error in save:" + arguments[0]);
                        options.error({}, "error", options.data);
                    });
                } else {
                    model[0].innerInstance().remove().then(function () {
                        options.success({ data: options.data });
                    }).fail(function () {

                    });
                }
            },
            setup: function () {
                console.log("setup");
                console.dir(arguments);
            }
        });
        return TransportClass;
    });

    var jayDataSource = kendo.data.DataSource.extend({
        init: function () {
            kendo.data.DataSource.fn.init.apply(this, arguments);
        },
        _promise: function (data, models, type) {
            var that = this,
                extend = $.extend,
                transport = that.transport;

            return $.Deferred(function (deferred) {
                transport[type].call(transport, extend({
                    success: function (response) {
                        deferred.resolve({
                            response: response,
                            models: models,
                            type: type
                        });
                    },
                    error: function (response, status, error) {
                        deferred.reject(response);
                        that.error(response, status, error);
                    }
                }, data), models
                );
            }).promise();
        },
    });

    $data.Queryable.addMember("asKendoDataSource", function (ds) {
        var self = this;

        var newEntries = [];

        var model = self.asKendoModel(function (item) { newEntries.push(item); });

        ds = ds || {};
        //unless user explicitly opts out server side logic
        //we just force it.
        ds.serverPaging = ds.serverPaging || true;
        ds.serverFiltering = ds.serverFiltering || true;
        ds.serverSorting = ds.serverSorting || true;
        ds.pageSize = ds.pageSize || 25;

        var TransportClass = self.asKendoRemoteTransportClass(model);
        ds.transport = new TransportClass(newEntries);

        ds.schema = {
            model: model,
            data: "data",
            total: "total"
        };
        return new jayDataSource(ds);
    });
})($data);