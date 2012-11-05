var EventSubscriber = $data.Class.define("EventSubscriber", null, null, {
    constructor: function (handler, state, thisArg) {
        /// <param name="handler" type="Function">
        ///     <summary>event handler</summary>
        ///     <signature>
        ///         <param name="sender" type="$data.Entity" />
        ///         <param name="eventData" type="EventData" />
        ///         <param name="state" type="Object" />
        ///     </signature>
        /// </param>
        /// <param name="state" type="Object" optional="true">custom state object</param>
        /// <param name="thisArg" type="Object" optional="true">[i]this[/i] context for handler</param>
        ///
        /// <field name="handler" type="function($data.Entity sender, EventData eventData, Object state)">event handler</field>
        /// <field name="state" type="Object">custom state object</field>
        /// <field name="thisArg">[i]this[/i] context for handler</field>
        this.handler = handler;
        this.state = state;
        this.thisArg = thisArg;
    },
    handler: {},
    state: {},
    thisArg: {}
});

$data.Event = Event = $data.Class.define("$data.Event", null, null, {
    constructor: function (name, sender) {
        ///<param name="name" type="string">The name of the event</param>
        ///<param name="sender" type="Object">The originator/sender of the event. [this] in handlers will be set to this</param>
        var subscriberList = null;
        var parentObject = sender;

        function detachHandler(list, handler) {
            ///<param name="list" type="Array" elementType="EventSubscriber" />
            ///<param name="handler" type="Function" />
            list.forEach(function (item, index) {
                if (item.handler == handler) {
                    list.splice(index, 1);
                }
            });
        }

        this.attach = function (handler, state, thisArg) {
            ///<param name="handler" type="Function">
            ///<signature>
            ///<param name="sender" type="Object" />
            ///<param name="eventData" type="Object" />
            ///<param name="state" type="Object" />
            ///</signature>
            ///</param>
            ///<param name="state" type="Object" optional="true" />
            ///<param name="thisArg" type="Object" optional="true" />
            if (!subscriberList) {
                subscriberList = [];
            }
            subscriberList.push(new EventSubscriber(handler, state, thisArg || sender));
        };
        this.detach = function (handler) {
            detachHandler(subscriberList, handler);
        };
        this.fire = function (eventData, snder) {
            var snd = snder || sender || this;
            //eventData.eventName = name;
            ///<value name="subscriberList type="Array" />
            if (subscriberList) {
                subscriberList.forEach(function (subscriber) {
                    ///<param name="subscriber" type="EventSubscriber" />
                    try {
                        subscriber.handler.call(subscriber.thisArg, snd, eventData, subscriber.state);
                    } catch(ex) {
                        console.log("unhandled exception in event handler. exception suppressed");
                        console.dir(ex);
                    }
                });
            }
        };
    }
});


var eventData = $data.Class.define("EventData", null, null, {
    eventName: {}
});

var PropertyChangeEventData = $data.Class.define("PropertyChangeEventData", EventData, null, {
    constructor: function (propertyName, oldValue, newValue) {
        this.propertyName = propertyName;
        this.oldValue = oldValue;
        this.newValue = newValue;
    },
    propertyName: {},
    oldValue: {},
    newValue: {}
});

var PropertyValidationEventData = $data.Class.define("PropertyValidationEventData", EventData, null, {
    constructor: function (propertyName, oldValue, newValue, errors) {
        this.propertyName = propertyName;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.errors = errors;
        this.cancel = false;
    },
    propertyName: {},
    oldValue: {},
    newValue: {},
    errors: {},
    cancel: {}
});

$data.Entity = Entity = $data.Class.define("$data.Entity", null, null, {
    constructor: function (initData) {
        /// <description>
        ///     This class provide a light weight, object-relational interface between 
        ///     your javascript code and database.
        /// </description>
        ///
        /// <signature>
        ///     <param name="initData" type="Object">initialization data</param>
        ///     <example>
        ///         var category = new $news.Types.Category({ Title: 'Tech' });
        ///         $news.context.Categories.add(category);
        ///     </example>
        /// </signature>
        ///
        /// <field name="initData" type="Object">initialization data</field>
        /// <field name="context" type="$data.EntityContext"></field>
        /// <field name="propertyChanging" type="$data.Event"></field>
        /// <field name="propertyChanged" type="$data.Event"></field>
        /// <field name="propertyValidationError" type="$data.Event"></field>
        /// <field name="isValidated" type="Boolean">Determines the current $data.Entity is validated.</field>
        /// <field name="ValidationErrors" type="Array">array of $data.Validation.ValidationError</field>
        /// <field name="ValidationErrors" type="Array">array of MemberDefinition</field>
        /// <field name="entityState" type="Integer"></field>
        /// <field name="changedProperties" type="Array">array of MemberDefinition</field>

        this.initData = {};
        if (this.getType().__copyPropertiesToInstance) {
            $data.typeSystem.writePropertyValues(this);
        }

        var ctx = null;
        this.context = ctx;

        if (arguments.length == 1 && typeof initData === "object") {
            var typeMemDefs = this.getType().memberDefinitions;
            var memDefNames = typeMemDefs.getPublicMappedPropertyNames();//.map(function (memDef) { return memDef.name; });
            //            if (Object.keys(initData).every(function (key) { return memDefNames.indexOf(key) != -1; })) {
            //                this.initData = initData;
            //            }
            this.initData = {};
            for (var i in initData) {
                if (memDefNames.indexOf(i) > -1) {
                    var type = Container.resolveType(typeMemDefs.getMember(i).type);
                    if (type === $data.Date && typeof initData[i] === 'string')
                        this.initData[i] = new Date(initData[i]);
                    else if (type === $data.Geography && typeof initData[i] === 'object' && !(initData[i] instanceof $data.Geography))
                        this.initData[i] = new $data.Geography(initData[i]);
                    else {
                        this.initData[i] = initData[i];

                    }
                }
            }

            this.changedProperties = undefined;
            this.entityState = undefined;
        }
    },
    toString: function () {
        /// <summary>Returns a string that represents the current $data.Entity</summary>
        /// <returns type="String"/>

        return this.getType().fullName + "(" + (this.Id || this.Name || '') + ")"
    },
    toJSON: function () {
        /// <summary>Creates pure JSON object from $data.Entity.</summary>
        /// <returns type="Object">JSON representation</returns>

        var result = {};
        var self = this;
        this.getType().memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
            result[memDef.name] = self[memDef.name];
        });
        return result;
    },
    equals: function (entity) {
        /// <summary>Determines whether the specified $data.Entity is equal to the current $data.Entity.</summary>
        /// <returns type="Boolean">[b]true[/b] if the specified $data.Entity is equal to the current $data.Entity; otherwise, [b]false[/b].</returns>

        if (entity.getType() !== this.getType()) {
            return false;
        }
        var entityPk = this.getType().memberDefinitions.getKeyProperties();
        for (var i = 0; i < entityPk.length; i++) {
            if (this[entityPk[i].name] == entity[entityPk[i].name]) {
                return true;
            }
        }
        return false;
    },
    //propertyChanging: { dataType: $data.Event, storeOnObject: true, monitorChanges: false, notMapped: true, enumerable: false },

    //propertyChanged: { dataType: $data.Event, storeOnObject: true, monitorChanges: false, notMapped: true, enumerable: false },
    propertyChanging: {
        dataType: $data.Event, storeOnObject: true, monitorChanges: false, notMapped: true, enumerable: false, prototypeProperty: true,
        get: function () {
            if (!this._propertyChanging)
                this._propertyChanging = new Event('propertyChanging', this);

            return this._propertyChanging;
        },
        set: function (value) { this._propertyChanging = value; }
    },
    propertyChanged: {
        dataType: $data.Event, storeOnObject: true, monitorChanges: false, notMapped: true, enumerable: false, prototypeProperty: true,
        get: function () {
            if (!this._propertyChanged)
                this._propertyChanged = new Event('propertyChanged', this);

            return this._propertyChanged;
        },
        set: function (value) { this._propertyChanged = value; }
    },
    propertyValidationError: {
        dataType: $data.Event, storeOnObject: true, monitorChanges: false, notMapped: true, enumerable: false, prototypeProperty: true,
        get: function () {
            if (!this._propertyValidationError)
                this._propertyValidationError = new Event('propertyValidationError', this);

            return this._propertyValidationError;
        },
        set: function (value) { this._propertyValidationError = value; }
    },

    // protected
    storeProperty: function (memberDefinition, value) {
        /// <param name="memberDefinition" type="MemberDefinition" />
        /// <param name="value" />

        //if (origValue == value) return;
        value = this.typeConversion(memberDefinition, value);
        var eventData = null;
        if (memberDefinition.monitorChanges != false && (this._propertyChanging || this._propertyChanged || "instancePropertyChanged" in this.constructor)) {
            var origValue = this[memberDefinition.name];
            eventData = new PropertyChangeEventData(memberDefinition.name, origValue, value);
            if (this._propertyChanging)
                this.propertyChanging.fire(eventData);
        }

        if (memberDefinition.monitorChanges != false && (this._propertyValidationError || "instancePropertyValidationError" in this.constructor)) {
            var errors = $data.Validation.Entity.ValidateEntityField(this, memberDefinition, value);
            if (errors.length > 0) {
                var origValue = this[memberDefinition.name];
                var errorEventData = new PropertyValidationEventData(memberDefinition.name, origValue, value, errors);

                if (this._propertyValidationError)
                    this.propertyValidationError.fire(errorEventData);
                if ("instancePropertyValidationError" in this.constructor)
                    this.constructor["instancePropertyValidationError"].fire(errorEventData, this);

                if (errorEventData.cancel == true)
                    return;
            }
        }

        if (memberDefinition.storeOnObject == true) {
            //TODO refactor to Base.getBackingFieldName
            var backingFieldName = "_" + memberDefinition.name;
            this[backingFieldName] = value;
        } else {
            this.initData[memberDefinition.name] = value;
        }
        this.isValidated = false;

        if (memberDefinition.monitorChanges != false && this.entityState == $data.EntityState.Unchanged)
            this.entityState = $data.EntityState.Modified;

        if (memberDefinition.monitorChanges != false) {
            if (!this.changedProperties) {
                this.changedProperties = [];
            }

            if (!this.changedProperties.some(function (memDef) { return memDef.name == memberDefinition.name }))
                this.changedProperties.push(memberDefinition);

            if (this._propertyChanged)
                this.propertyChanged.fire(eventData);

            //TODO mixin framework
            if ("instancePropertyChanged" in this.constructor) {
                this.constructor["instancePropertyChanged"].fire(eventData, this);
            }
        }
    },
    typeConversion: function (memberDefinition, value) {
        var convertedValue = value;
        if (typeof value === 'string' && !memberDefinition.concurrencyMode) {
            switch (Container.resolveName(memberDefinition.type)) {
                case '$data.Guid':
                    convertedValue = $data.parseGuid(value);
                    break;
                case '$data.Integer':
                    convertedValue = parseInt(value);
                    if (isNaN(convertedValue))
                        throw Guard.raise(new Exception('TypeError: ', 'value not convertable to $data.Integer', [memberDefinition, value]));
                    break;
                case '$data.Number':
                    convertedValue = parseFloat(value);
                    if (isNaN(convertedValue))
                        throw Guard.raise(new Exception('TypeError: ', 'value not convertable to $data.Number', [memberDefinition, value]));
                    break;
                case '$data.Date':
                    convertedValue = new Date(value);
                    if (isNaN(convertedValue.valueOf()))
                        throw Guard.raise(new Exception('TypeError: ', 'value not convertable to $data.Date', [memberDefinition, value]));
                    break;
                case '$data.Boolean':
                    switch (value.toLowerCase()) {
                        case 'true': 
                            convertedValue = true;
                            break;
                        case 'false': 
                            convertedValue = false;
                            break;
                        default:
                            throw Guard.raise(new Exception('TypeError: ', 'value not convertable to $data.Boolean', [memberDefinition, value]));
                    }
                    break;
                case '$data.Object':
                    try {
                        convertedValue = JSON.parse(value);
                    } catch (e) {
                        throw Guard.raise(new Exception('TypeError: ', e.toString(), [memberDefinition, value]));
                    }
                    break;
            }
        }

        return convertedValue;
    },

    // protected
    retrieveProperty: function (memberDefinition) {
        /// <param name="memberDefinition" type="MemberDefinition" />

        if (memberDefinition.storeOnObject == true) {
            //TODO refactor to Base.getBackingFieldName
            var backingFieldName = "_" + memberDefinition.name;
            return this[backingFieldName];
        } else {
            return this.initData[memberDefinition.name];
        }
    },

    // protected
    getProperty: function (memberDefinition, callback) {
        /// <summary>Retrieve value of member</summary>
        /// <param name="memberDefinition" type="MemberDefinition" />
        /// <param name="callback" type="Function">
        ///     <signature>
        ///         <param name="value" />
        ///     </signature>
        /// </param>
        /// <returns>value associated for [i]memberDefinition[/i]</returns>

        if (this[memberDefinition.name] != undefined) {
            callback(this[memberDefinition.name]);
            return;
        }

        if (!this.context)
            Guard.raise(new Exception('Entity not in context', 'Invalid operation'));

        return this.context.loadItemProperty(this, memberDefinition, callback);
    },
    // protected
    setProperty: function (memberDefinition, value, callback) {
        /// <param name="memberDefinition" type="MemberDefinition" />
        /// <param name="value" />
        /// <param name="callback" type="Function">done</param>
        this[memberDefinition.name] = value;
        callback();
    },

    isValid: function () {
        /// <summary>Determines the current $data.Entity is validated and valid.</summary>
        /// <returns type="Boolean" />

        if (!this.isValidated) {
            this.ValidationErrors = $data.Validation.Entity.ValidateEntity(this);
            this.isValidated = true;
        }
        return this.ValidationErrors.length == 0;
    },
    isValidated: { dataType: "bool", storeOnObject: true, monitorChanges: false, notMapped: true, enumerable: false, value: false },
    ValidationErrors: {
        dataType: Array,
        elementType: $data.Validation.ValidationError,
        storeOnObject: true,
        monitorChanges: true,
        notMapped: true,
        enumerable: false
    },

    resetChanges: function () {
        /// <summary>reset changes</summary>

        delete this._changedProperties;
    },

    changedProperties: {
        dataType: Array,
        elementType: window["MemberDefinition"],
        storeOnObject: true,
        monitorChanges: false,
        notMapped: true,
        enumerable: false
    },

    entityState: { dataType: "integer", storeOnObject: true, monitorChanges: false, notMapped: true, enumerable: false },
    /*
    toJSON: function () {
        if (this.context) {
            var itemType = this.getType();
            var storageModel = this.context._storageModel[itemType.name];
            var o = new Object();
            for (var property in this) {
                if (typeof this[property] !== "function") {
                    var excludedFields = storageModel.Associations.every(function (association) {
                        return association.FromPropertyName == property && (association.FromMultiplicity == "0..1" || association.FromMultiplicity == "1");
                    }, this);
                    if (!excludedFields) {
                        o[property] = this[property];
                    }
                }
            }
            return o;
        }
        return this;
    }   */
    //,
  
    //onReady: function (callback) {
    //    this.__onReadyList = this.__onReadyList || [];
    //    this.__onReadyList.push(callback);
    //},


    promiseWrapper: function (action, store, options) {

        var self = this;
        var pHandler = new $data.PromiseHandler();
        var deferred = pHandler.deferred;
        var pHandlerResult = pHandler.getPromise();
        try {
            var contextFactory = $data.Entity.getDefaultItemStoreFactory(self, store, options);
            var context = contextFactory();
            context.onReady(function () {
                var result = action(context);
                context.saveChanges({
                    success: function () {
                        deferred.resolve(result);
                    },
                    error: function (err) {
                        deferred.reject(err);
                    }
                });
            });
            //var set = context.getEntitySetFromElementType(entity.getType());
            
        } catch (error) {
            deferred.reject(error);
        }
        //deferred.resolve("!");

        return pHandlerResult;
    },

    remove: function (store, options, callback) {
        var self = this;
        return self.promiseWrapper(function (context) {
            context.remove(self);
            return self;
        });
    },



    save: function(store, options) {
        var self = this;
        return self.promiseWrapper(function (context) {
           var key = self.getType().memberDefinitions.getKeyProperties()[0];
            //return context.add(self);
           if (self[key.name]) {
               context.attach(self, true);
               return self;

           } else {
               return context.add(self);
           }
        }, store, options);
    }
 
}, {
    //create get_[property] and set_[property] functions for properties
    __setPropertyfunctions: { value: true, notMapped: true, enumerable: false, storeOnObject: true },
    //copy public properties to current instance
    __copyPropertiesToInstance: { value: false, notMapped: true, enumerable: false, storeOnObject: true },
     
    defaultItemStoreFactory: { value: undefined },
    

    inheritedTypeProcessor: function (type) {

        function findById (set, keyValue) {

            //var callback = $data.typeSystem.createCallbackSetting(cb);
            //todo multifield key support
            var key = set.defaultType.memberDefinitions.getKeyProperties()[0];
            if ("filter" in set.entityContext.storageProvider.supportedSetOperations) {
                return set.filter("it." + key.name + " == this.value", { value: keyValue });
            } else {
                return {
                    toArray: function (cb) {
                        console.log(set);
                        var pHandler = new $data.PromiseHandler();
                        var deferred = pHandler.deferred;
                        var promise = pHandler.getPromise();
                        set.toArray({
                            success: function (items) {
                                console.log("!");
                                for (var i = 0; i < items.length; i++) {
                                    if (items[i][key.name] === keyValue) {
                                        //deferred.resolve(items[i]);
                                        cb.success(items[i]);
                                        return items[i];
                                    }
                                }
                                cb.error(new Error("unknown id"));
                                //deferred.reject(new Error("unknown id"));
                            },
                            error: function (error) {
                                console.log("error");
                                cb.error(error);
                                //console.log(error);
                                //deferred.reject(error);
                            }
                        });

                    }
                }
                
            }

        };

        type.get = function (key, store, options) {
            var result = new Type({ Id: key });
            result.defaultItemStore = store;
            result.refresh();
        },

        type.removeAll = function (store, options) {

            var self = this;
            var pHandler = new $data.PromiseHandler();
            var deferred = pHandler.deferred;
            var pHandlerResult = pHandler.getPromise();
            try {
                var contextFactory = $data.Entity.getDefaultItemStoreFactory(type, store, options);
                var context = contextFactory();
                context.onReady(function () {
                    console.dir(self._changedProperties);
                    var set = context.getEntitySetFromElementType(type);
                    //var result = action(context);
                    set.toArray({
                        success: function (items) {
                            items.forEach(function (item) {
                                context.remove(item);
                            });
                            context.saveChanges({
                                success: function () {
                                    deferred.resolve(items);
                                },
                                error: function (err) {
                                    deferred.reject(err);
                                }
                            });
                        },
                        error: function (err) {
                            deferred.reject(err);
                        }
                    });
                });
            } catch (error) {
                deferred.reject(error);
            }
            //deferred.resolve("!");

            return pHandlerResult;
        },
        type.readAll = function (store, options) {
            //return the entity
            //refresh when ready
            var pHandler = new $data.PromiseHandler();
            var deferred = pHandler.deferred;
            var promise = pHandler.getPromise();
            var storeFactory = $data.Entity.getDefaultItemStoreFactory(type, store, options);
            var store = storeFactory();
            store.onReady(function () {
                var set = store.getEntitySetFromElementType(type);
                set.toArray({
                    success: function (items) {
                        console.log("readl all running");
                        //callback(items, null);
                        deferred.resolve(items);
                    },
                    error: function (err) {
                        //callback(null, err);
                        deferred.reject(err);
                    }
                });
            });
            //var keyFields
            return promise;
        };

        type.read = function (key, store, options) {
            //return the entity
            //refresh when ready
            var pHandler = new $data.PromiseHandler();
            var deferred = pHandler.deferred;
            var promise = pHandler.getPromise();
            var storeFactory = $data.Entity.getDefaultItemStoreFactory(type, store, options);
            var store = storeFactory();
            store.onReady(function () {
                var set = store.getEntitySetFromElementType(type);
                var itemsQuery = findById(set, key);
                itemsQuery.toArray({
                    success: function (items) {
                        //callback(items, null);
                        if (items.length < 1) {
                            deferred.reject(new Error("Not items found by that key"));
                        } else {
                            if (items.length === 1) {
                                deferred.resolve(items[0]);
                            } else {
                                deferred.resolve(items);
                            }
                        }
                    },
                    error: function (err) {
                        //callback(null, err);
                        deferred.reject(err);
                    }
                });
            });
            //var keyFields
            return promise;
        };

        type.save = function ( initData, store, options) {
            var instance = new type(initData);
            return instance.save();
        };

        type.remove = function (key, store, options) {
            var entityPk = type.memberDefinitions.getKeyProperties();
            var obj = {};
            obj[entityPk[0].name] = key;
            var inst = new type(obj);
            return inst.remove();
        };
        type.itemCount = function () {

        }
    },

    getDefaultItemStoreFactory: function (instanceOrType, store, options) {

        //function resolveStoreName(store, options) {
        //    if (!store) {
        //        var type = ("function" === typeof instanceOrType) ? instanceOrType : instanceOrType.getType();
        //        var typeName = $data.Container.resolveName(type) + "_items";
        //        var typeName = typeName.replace(".", "_");
        //        store = "local:" + typeName;
        //    } else {
        //        var splitStore = store.split(":");
        //        if (splitStore.length < 2) {
        //            //if 
        //        }
        //    }
        //}

        var type = ("function" === typeof instanceOrType) ? instanceOrType : instanceOrType.getType();
        var typeName = $data.Container.resolveName(type) + "_items";
        var typeName = typeName.replace(".", "_");
        store = "local:" + typeName;

        //provider = 'indexedDb';
        var provider = 'local';

        var inMemoryType = $data.EntityContext.extend(typeName, {
            'Items': { type: $data.EntitySet, elementType: type }
        });

        var factory = function () {
            return new inMemoryType({ name: provider, databaseName: typeName });
        }
        return factory;
    }
});




$data.__nameCache = {};

$data.define = function (name, definition) {
    if (!definition) {
        throw new Error("json object type is not supported yet");
    }
    var _def = {};
    var hasKey = false;
    var keyFields = [];
    Object.keys(definition).forEach(function (fieldName) {
        if (Object.hasOwnProperty(definition[fieldName],"type")) {
            var propDef = definition[fieldName]; 
            _def[fieldName] = propDef;
            if (propDef.key) {
                keyFields.push(propDef);
            }

        } else {
            _def[fieldName] = { type: definition[fieldName] };
        }
    });

    if (keyFields.length < 1) {
        var keyProp;
        switch (true) {
            case "id" in _def: 
                keyProp = "id";
                break;
            case "Id" in _def:
                keyProp = "Id"
                break;
            case "ID" in _def:
                keyProp = "ID"
                break;
        }
        if (keyProp) {
            _def[keyProp].key = true;
            var propTypeName = $data.Container.resolveName(_def[keyProp].type);
            _def[keyProp].computed = true;
            //if ("$data.Number" === propTypeName || "$data.Integer" === propTypeName) {
            //}
        } else {
            _def.Id = { type: "int", key: true, computed: true }
        }
    }


    var entityType = $data.Entity.extend(name, _def);
    $data.__nameCache[name] = entityType;
    return entityType;
}

$data.implementation = function (name) {
    console.dir(this);
    var result = $data.__nameCache[name];
    return result;
}

