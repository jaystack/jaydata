// JayData 1.3.6
// Dual licensed under MIT and GPL v2
// Copyright JayStack Technologies (http://jaydata.org/licensing)
//
// JayData is a standards-based, cross-platform Javascript library and a set of
// practices to access and manipulate data from various online and offline sources.
//
// Credits:
//     Hajnalka Battancs, Dániel József, János Roden, László Horváth, Péter Nochta
//     Péter Zentai, Róbert Bónay, Szabolcs Czinege, Viktor Borza, Viktor Lázár,
//     Zoltán Gyebrovszki, Gábor Dolla
//
// More info: http://jaydata.org
(function ($data) {
    var oldProcessor = $data.Entity.inheritedTypeProcessor;

    $data.kendo = {};
    $data.kendo.BaseModelType = kendo.data.Model.define({
        init: function (data) {
            kendo.data.Model.fn.init.call(this, data);
        }
    });

    var kendoTypeMap = {
        "$data.Blob": "string",
        "$data.String": "string",
        "$data.Boolean": "boolean",
        "$data.Integer": "number",
        "$data.Number": "number",
        "$data.Date": "date",
        "$data.DateTimeOffset": "date",
        "$data.Time": "string",
        "$data.Byte": "number",
        "$data.SByte": "number",
        "$data.Int16": "number",
        "$data.Int32": "number",
        "$data.Int64": "number",
        "$data.Decimal": "string",
        "$data.Float": "number"
    }

    $data.Entity.inheritedTypeProcessor = function (type) {
        var memberDefinitions = type.memberDefinitions;

        function getKendoTypeName(canonicType, pd) {
            return kendoTypeMap[canonicType] || 'object';
        };

        function createKendoModel(options) {
            ///<param name="options">Contains options.owningContextType if initialized in a scope of a context</param>
            var memberDefinitions = type.memberDefinitions,
			fields = {};
            //debugger;
            function getNullable(canonicType, pd) {
                if (canonicType === "$data.Boolean") {
                    //grid validation errs on requied/nonnull bools
                    return true;
                }
                return pd.required !== true;
            };

            function getRequired(canonicType, pd) {
                if ("$data.Boolean" === canonicType) {
                    return false;
                }
                return pd.required || "nullable" in pd ? !(pd.nullable) : false;
            }

            memberDefinitions
			.getPublicMappedProperties()
			.forEach(function (pd) {
			    var canonicType = $data.Container.resolveName(pd.type);
			    //if (pd.dataType !== "Array" && !(pd.inverseProperty)) {
			    fields[pd.name] = {
			        //TODO
			        type: getKendoTypeName(canonicType, pd),
			        nullable: getNullable(canonicType, pd),
			        defaultValue: pd.defaultValue,
			        //nullable: false,
			        //nullable:  "nullable" in pd ? pd.nullable : true,
			        editable: !pd.computed,
			        //defaultValue: true,
			        //defaultValue: 'abc',
			        //defaultValue: pd.type === "Edm.Boolean" ? false : undefined,
			        validation: {
			            required: getRequired(canonicType, pd)
			        }
			    }
			    //};
			});

            function setInitialValue(obj, memDef) {
                return;
                //if (!obj[memDef.name]) {
                //    function getDefault() {
                //        switch ($data.Container.resolveType(memDef.type)) {
                //            case $data.Number: return 0.0;
                //            case $data.Integer: return 0;
                //            case $data.Date: return new Date();
                //            case $data.Boolean: return false;
                //        }
                //    }
                //    obj[memDef.name] = getDefault();
                //}
            }

            //console.dir(memberDefinitions.getPublicMappedMethods());
            var modelDefinition = {
                fields: fields,
                init: function (data) {
                    //console.dir(arguments);
                    var ctxType = options && options.owningContextType || undefined;

                    var contextSetTypes = [];
                    if (options && options.owningContextType) {
                        contextSetTypes = options.owningContextType
						.memberDefinitions
						.getPublicMappedProperties()
						.filter(function (pd) {
						    return $data.Container.resolveType(pd.type) === $data.EntitySet
						})
						.map(function (pd) {
						    return $data.Container.resolveType(pd.elementType)
						});
                    }

                    var newInstanceOptions = {
                        entityBuilder: function (instance, members) {
                            members.forEach(function (memberInfo) {
                                if (!(memberInfo.key === true) && (memberInfo.required === true || memberInfo.nullable === false)) {
                                    var memberType = $data.Container.resolveType(memberInfo.type);
                                    if (memberType.isAssignableTo && memberType.isAssignableTo($data.Entity) && contextSetTypes.indexOf(memberType) === -1) {
                                        //it's a complex property
                                        var _data;
                                        if (data) {
                                            _data = data[memberInfo.name];
                                        }
                                        instance[memberInfo.name] = new memberType(_data, newInstanceOptions);
                                    }
                                    else {
                                        setInitialValue(instance, memberInfo);
                                    }
                                }
                            });
                        }
                    }

                    var jayInstance = data instanceof type ? data : new type(data, newInstanceOptions);

                    var seed = jayInstance.initData;

                    var feed = {};

                    //TODO create precompiled strategy
                    for (var j in seed) {
                        var md = type.getMemberDefinition(j);
                        var seedValue = seed[j];
                        if (seedValue instanceof $data.Entity) {
                            var kendoInstance = seedValue.asKendoObservable();
                            feed[j] = kendoInstance;
                        }
                        else if (md && $data.Container.resolveType(md.type) === Array) {
                            var jayType = $data.Container.resolveType(md.elementType);
                            var kendoType = jayType;
                            if (jayType.asKendoModel) {
                                kendoType = jayType.asKendoModel();
                            }
                            var feedValue = new kendo.data.ObservableArray(seed[j], kendoType);
                            feed[j] = feedValue;
                            feed[j].bind('change', function (e) {
                                jayInstance.changeFromKendo = true;
                                this.parent().dirty = true;
                                jayInstance[md.name] = this.toJSON();
                                delete jayInstance.changeFromKendo;
                            });
                        }
                        else if (md && $data.Container.resolveType(md.type) === $data.Blob){
                            feed[j] = $data.Blob.toBase64(seedValue);
                            //feed[j] = new kendo.data.Observable($data.Blob.toBase64(seedValue));
                            /*feed[j].bind('change', function(e){
                                //jayInstance.changeFromKendo = true;
                                jayInstance[md.name] = $data.Container.convertTo(atob(this), $data.Blob);
                                //delete jayInstance.changeFromKendo;
                            });*/
                        }
                        else {
                            feed[j] = seedValue;
                        }
                    }

                    var arrayMemberDef = type.memberDefinitions.getPublicMappedProperties().filter(function (item) {
                        return (($data.Container.resolveType(item.dataType) === Array) && (!$data.Container.resolveType(item.elementType).asKendoModel))
                    });
                    for (var j = 0; j < arrayMemberDef.length; j++) {
                        var memberDef = arrayMemberDef[j];
                        if (seed[memberDef.name] === null || seed[memberDef.name] === undefined) {
                            feed[memberDef.name] = new kendo.data.ObservableArray([], $data.Container.resolveType(memberDef.elementType))
                            feed[memberDef.name].bind('change', function (e) {
                                jayInstance.changeFromKendo = true;
                                this.parent().dirty = true;
                                jayInstance[memberDef.name] = this.toJSON();
                                delete jayInstance.changeFromKendo;
                            });
                        }
                    }

                    var self = this;
                    this.innerInstance = function () {
                        return jayInstance
                    }

                    //kendo.data.Model.fn.init.call(this, feed);
                    $data.kendo.BaseModelType.fn.init.call(this, feed);

                    jayInstance.propertyChanged.attach(function (obj, propinfo) {
                        var jay = this;
                        var newValue = propinfo.newValue;
                        var md = jayInstance.getType().getMemberDefinition(propinfo.propertyName);
                        if (!jay.changeFromKendo) {
                            newValue = newValue ? (newValue.asKendoObservable ? newValue.asKendoObservable() : newValue) : newValue;
                            jayInstance.changeFromJay = true;
                            if ($data.Container.resolveType(md.type) === $data.Blob && newValue){
                                newValue = $data.Blob.toBase64(newValue);
                            }
                            self.set(propinfo.propertyName, newValue);
                            if (md.computed && self[propinfo.propertyName] !== newValue){
                                self[propinfo.propertyName] = newValue;
                            }
                            delete jayInstance.changeFromJay;
                        }else{
                            if ($data.Container.resolveType(md.type) === $data.Blob){
                                var blob = $data.Blob.toString(newValue);
                                newValue = $data.Container.convertTo(atob(blob), $data.Blob);
                                jayInstance.changeFromJay = true;
                                jayInstance.initData[md.name] = newValue;
                                //self.set(propinfo.propertyName, blob);
                                delete jayInstance.changeFromJay;
                            }
                        }
                    });

                    this.bind("set", function (e) {
                        var propName = e.field;
                        var propNameParts = propName.split(".");
                        jayInstance.changeFromKendo = true;
                        if (propNameParts.length == 1) {
                            var propValue = e.value;
                            if (!jayInstance.changeFromJay) {
                                propValue = propValue.innerInstance ? propValue.innerInstance() : propValue;
                                jayInstance[propName] = propValue;
                                if (options && options.autoSave) {
                                    jayInstance.save();
                                }
                            }
                        }
                        else {
                            var rootProp = jayInstance[propNameParts[0]];
                            if (rootProp instanceof $data.Entity) {
                                jayInstance[propNameParts[0]] = rootProp;
                            }
                        }
                        delete jayInstance.changeFromKendo;
                    });
                    if (options && options.newInstanceCallback) {
                        options.newInstanceCallback(jayInstance);
                    }
                },
                save: function () {
                    //console.log("item.save", this, arguments);
                    return this.innerInstance().save();
                },
                remove: function () {
                    return this.innerInstance().remove();
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
            $data.Trace.log("md", modelDefinition);

            var returnValue = kendo.data.Model.define($data.kendo.BaseModelType, modelDefinition);

            return returnValue;
        }

        function asKendoModel(options) {
            var cacheObject = options || type;
            return cacheObject.kendoModelType || (cacheObject.kendoModelType = createKendoModel(options));
        }

        function asKendoObservable(instance, options) {
            var kendoModel = type.asKendoModel(options);
            return new kendoModel(instance);
        }

        type.asKendoModel = asKendoModel;
        //type.asKendoModelType = asKendoModel;

        type.prototype.asKendoObservable = function (options) {
            var self = this;

            var kendoObservable = asKendoObservable(this, options);

            return kendoObservable;
        }

        function r(value) {
            return value || '';
        }
        function registerStoreAlias(type, options) {
            if (!options.provider)
                return;
            var key = r(options.databaseName) + r(options.tableName) + r(options.url) + r(options.apiUrl) + r(options.oDataServiceHost);
            var storeDef = {
                provider: options.provider,
                databaseName: options.databaseName,
                tableName: options.tableName,
                dataSource: options.url,
                apiUrl: options.apiUrl,
                oDataServiceHost: options.oDataServiceHost
            };
            Object.keys(storeDef).forEach(function (k) {
                delete options[k];
            });

            type.setStore(key, storeDef);
            return key;
        }

        type.asKendoDataSource = function (options, modelOptions, storeAlias) {
            options = options || {};
            var mOptions = modelOptions || {};
            var salias = registerStoreAlias(type, options) || storeAlias;
            var token = $data.ItemStore._getStoreAlias(type, salias);
            var ctx = $data.ItemStore._getContextPromise(token, type);
            var set = ctx.getEntitySetFromElementType(type);
            return set.asKendoDataSource(options, mOptions);
        };

        if (oldProcessor) {
            oldProcessor(type);
        }
    }
    $data.Queryable.addMember("asKendoColumns", function (columns) {
        var result = [];
        columns = columns || {};
        var showComplex = columns['$showComplexFields'] === true;
        delete columns['$showComplexFields'];

        this.defaultType
		.memberDefinitions
		.getPublicMappedProperties()
		.forEach(function (pd) {
		    //if (pd.dataType !== "Array" && !(pd.inverseProperty)) {
		    if (showComplex || kendoTypeMap[$data.Container.resolveName(pd.type)]) {
		        var col = columns[pd.name] || {};
		        var colD = { field: pd.name };
		        $.extend(colD, col)
		        result.push(colD);
		    }
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
            var it = this.filter(function (item) {
                return item.field == colName
            })[0];
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

    $data.Queryable.addMember("asKendoModel", function (options) {
        options.owningContextType = options.owningContextType || this.entityContext.getType();
        return this.defaultType.asKendoModel(options);
    });

    $data.Queryable.addMember("asKendoRemoteTransportClass", function (modelItemClass) {
        var self = this;
        var ctx = self.entityContext;
        function reset() {
            ctx.stateManager.reset();
        };
        var TransportClass = kendo.data.RemoteTransport.extend({
            init: function () {
                this.items = [];
            },
            read: function (options) {
                var query = self;

                query.entityContext.onReady().then(function () {
                    var _this = this;
                    var q = query;
                    var sp = query.entityContext.storageProvider;
                    var withInlineCount = query.entityContext.storageProvider.supportedSetOperations.withInlineCount;
                    var withLength = (!withInlineCount) && query.entityContext.storageProvider.supportedSetOperations.length;

                    if (withInlineCount) {
                        q = q.withInlineCount();
                    }

                    if (options.data.filter) {
                        var filter = "";
                        var thisArg = {};
                        options.data.filter.filters.forEach(function (f, index) {
                            if (index > 0) {
                                filter += options.data.filter.logic == "or" ? " || " : " && ";
                            }

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
                                    $data.Trace.log('unknown operator', f.operator);
                                    break;
                            }
                            thisArg[f.field] = f.value;
                        })
                        q = q.filter(filter, thisArg);
                    }
                    var allItemsQ = q;

                    if (options.data.sort) {
                        options.data.sort.forEach(function (s) {
                            q = q.order((s.dir == 'desc' ? "-" : "") + s.field);
                        })
                    }

                    if (options.data.skip) {
                        q = q.skip(options.data.skip);
                    }
                    if (options.data.take) {
                        q = q.take(options.data.take);
                    }

                    //Data.defaultHttpClient.enableJsonpCallback = true;
                    var promises = [];

                    promises.push(q.toArray());
                    //var ta = q.toArray();
                    if (withLength) {
                        promises.push(allItemsQ.length());
                    }
                    else if (!withInlineCount) {
                        promises.push(allItemsQ.toArray());
                    }

                    $data.Trace.log(promises);
                    jQuery.when.apply(this, promises).then(function (items, total) {
                        console.dir(arguments);
                        //var result = items.map(function (item) { return item instanceof $data.Entity ? new model(item.initData) : item; });
                        var result = items.map(function (item) {
                            var d = (item instanceof $data.Entity) ? item.initData : item;
                            var kendoItem = item.asKendoObservable();
                            return kendoItem;
                        });
                        var r = {
                            data: result,
                            total: withInlineCount ? items.totalCount : (withLength ? total : total.length)
                        }
                        $data.Trace.log(r);
                        options.success(r);
                    }).fail(function () {
                        console.log("error in create");
                        options.error({}, arguments);
                    });
                });
            },
            create: function (options, model) {
                var query = self;
                query.entityContext.onReady().then(function () {
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
                            options.success(/*{ data: data }*/);
                        }).fail(function () {
                            console.log("error in create");
                            options.error({}, arguments);
                            ctx.stateManager.reset();
                        });
                    }
                    else {
                        console.dir(ctx.storeToken);
                        model[0]
						.innerInstance()
						.save(ctx.storeToken)
						.then(function () {
						    options.success(/*{ data: model[0].innerInstance().initData }*/);
						})
						.fail(function () {
						    console.log("error in create");
						    options.error({}, arguments);
						});
                    }
                });
            },
            update: function (options, model) {
                var query = self;
                query.entityContext.onReady().then(function () {
                    if (model.length > 1) {
                        var items = model.map(function (item) {
                            return item.innerInstance()
                        });
                        items.forEach(function (item) {
                            ctx.attach(item, true);
                        });
                        ctx.saveChanges().then(function () {
                            options.success();
                        }).fail(function () {
                            ctx.stateManager.reset();
                            //alert("error in batch update");
                            options.error({}, arguments);
                        });
                    }
                    else {
                        model[0].innerInstance().save().then(function (item) {
                            options.success();
                        }).fail(function () {
                            //alert("error in update")
                            options.error({}, arguments);
                        });
                    }
                });
            },

            destroy: function (options, model) {
                var query = self;
                query.entityContext.onReady().then(function () {
                    if (model.length > 1) {
                        model.forEach(function (item) {
                            ctx.remove(item.innerInstance());
                        });
                        ctx.saveChanges().then(function () {
                            options.success({ data: options.data });
                        }).fail(function () {
                            ctx.stateManager.reset();
                            //alert("error in save:" + arguments[0]);
                            options.error({}, "error", options.data);
                        });
                    }
                    else {
                        model[0].innerInstance().remove().then(function () {
                            options.success({ data: options.data });
                        }).fail(function () {
                            ctx.stateManager.reset();
                            //alert("error in save:" + arguments[0]);
                            options.error({}, "error", options.data);
                        });
                    }
                });
            },
            setup: function () {
                $data.Trace.log("setup");
                $data.Trace.log(arguments);
            }
        });
        return TransportClass;
    });

    var jayDataSource = kendo.data.DataSource.extend({
        init: function () {
            kendo.data.DataSource.fn.init.apply(this, arguments);
        },
        createItem: function (initData) {
            var type = this.options.schema.model;
            return new type(initData);
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
        }
    });

    $data.kendo = $data.kendo || {};

    $data.kendo.defaultPageSize = 25;

    $data.Queryable.addMember("asKendoDataSource", function (ds, modelOptions) {
        var self = this;

        modelOptions = modelOptions || {};
        var model = self.asKendoModel(modelOptions);

        ds = ds || {};
        //unless user explicitly opts out server side logic
        //we just force it.
        ds.serverPaging = ds.serverPaging || true;
        ds.serverFiltering = ds.serverFiltering || true;
        ds.serverSorting = ds.serverSorting || true;
        ds.pageSize = ds.pageSize === undefined ? $data.kendo.defaultPageSize : ds.pageSize;

        var TransportClass = self.asKendoRemoteTransportClass(model);
        ds.transport = new TransportClass();

        ds.schema = {
            model: model,
            data: "data",
            total: "total"
        };
        return new jayDataSource(ds);
    });

    kendo.data.binders.submit = kendo.data.Binder.extend({
        init: function (element, bindings, options) {
            kendo.data.Binder.fn.init.call(this, element, bindings, options);
            $(element).bind("submit", function () {
                var obj = bindings.submit.source;
                var fn = obj[bindings.submit.path];
                if (typeof fn === 'function') {
                    fn.apply(obj, arguments);
                    return false;
                }
            });
        },
        refresh: function () {
        }
    });
})($data);