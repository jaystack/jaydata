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
        this.fireCancelAble = function (eventData, snder) {
            var snd = snder || sender || this;
            //eventData.eventName = name;
            ///<value name="subscriberList type="Array" />
            var isValid = true;
            if (subscriberList) {
                subscriberList.forEach(function (subscriber) {
                    ///<param name="subscriber" type="EventSubscriber" />
                    try {
                        isValid = isValid && (subscriber.handler.call(subscriber.thisArg, snd, eventData, subscriber.state) === false ? false : true);
                    } catch (ex) {
                        console.log("unhandled exception in event handler. exception suppressed");
                        console.dir(ex);
                    }
                });
            }
            return isValid;
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
    constructor: function (initData, newInstanceOptions) {
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
        var thisType = this.getType();
        if (thisType.__copyPropertiesToInstance) {
            $data.typeSystem.writePropertyValues(this);
        }

        var ctx = null;
        this.context = ctx;
        if ("setDefaultValues" in thisType) {
            if (!newInstanceOptions || newInstanceOptions.setDefaultValues !== false) {
                if (!initData || Object.keys(initData).length < 1) {
                    initData = thisType.setDefaultValues(initData);
                }
            }
        }

        if (typeof initData === "object") {
            var typeMemDefs = thisType.memberDefinitions;
            var memDefNames = typeMemDefs.getPublicMappedPropertyNames();

            for (var i in initData) {
                if (memDefNames.indexOf(i) > -1) {
                    var memberDef = typeMemDefs.getMember(i);
                    var type = Container.resolveType(memberDef.type);
                    var value = initData[i];

                    if (memberDef.concurrencyMode === $data.ConcurrencyMode.Fixed) {
                        this.initData[i] = value;
                    } else {
                        if (newInstanceOptions && newInstanceOptions.converters) {
                            var converter = newInstanceOptions.converters[Container.resolveName(type)];
                            if (converter)
                                value = converter(value);
                        }

                        this.initData[i] = Container.convertTo(value, type, memberDef.elementType, newInstanceOptions);
                    }
                }
            }

        }

        if (newInstanceOptions && newInstanceOptions.entityBuilder) {
            newInstanceOptions.entityBuilder(this, thisType.memberDefinitions.asArray(), thisType);
        }

        this.changedProperties = undefined;
        this.entityState = undefined;

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
            if (self[memDef.name] instanceof Date && memDef.type && Container.resolveType(memDef.type) === $data.DateTimeOffset) {
                result[memDef.name] = new $data.DateTimeOffset(self[memDef.name]);
            } else {
                result[memDef.name] = self[memDef.name];
            }
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
            if (this[entityPk[i].name] != entity[entityPk[i].name]) {
                return false;
            }
        }
        return true;
    },

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

        if (memberDefinition.concurrencyMode !== $data.ConcurrencyMode.Fixed) {
            value = Container.convertTo(value, memberDefinition.type, memberDefinition.elementType);
        }

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

        this._setPropertyChanged(memberDefinition);

        if (memberDefinition.monitorChanges != false) {
            //if (!this.changedProperties) {
            //    this.changedProperties = [];
            //}

            //if (!this.changedProperties.some(function (memDef) { return memDef.name == memberDefinition.name }))
            //    this.changedProperties.push(memberDefinition);

            if (this._propertyChanged)
                this.propertyChanged.fire(eventData);

            //TODO mixin framework
            if ("instancePropertyChanged" in this.constructor) {
                this.constructor["instancePropertyChanged"].fire(eventData, this);
            }
        }
    },
    _setPropertyChanged: function (memberDefinition) {
        if (memberDefinition.monitorChanges != false) {
            if (!this.changedProperties) {
                this.changedProperties = [];
            }

            if (!this.changedProperties.some(function (memDef) { return memDef.name == memberDefinition.name }))
                this.changedProperties.push(memberDefinition);
        }
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
    getProperty: function (memberDefinition, callback, tran) {
        /// <summary>Retrieve value of member</summary>
        /// <param name="memberDefinition" type="MemberDefinition" />
        /// <param name="callback" type="Function">
        ///     <signature>
        ///         <param name="value" />
        ///     </signature>
        /// </param>
        /// <returns>value associated for [i]memberDefinition[/i]</returns>

        callback = $data.typeSystem.createCallbackSetting(callback);
        if (this[memberDefinition.name] != undefined) {
            if (tran instanceof $data.Transaction)
                callback.success(this[memberDefinition.name], tran);
            else
                callback.success(this[memberDefinition.name]);
            return;
        }

        var context = this.context;
        if (!this.context) {
            try {
                var that = this;
                var storeToken = this.storeToken || this.getType().storeToken;
                if (storeToken && typeof storeToken.factory === 'function') {
                    var ctx = storeToken.factory();
                    return ctx.onReady().then(function (context) {
                        return context.loadItemProperty(that, memberDefinition, callback);
                    });
                }
            } catch (e) { }

            Guard.raise(new Exception('Entity not in context', 'Invalid operation'));
        } else {
            return context.loadItemProperty(this, memberDefinition, callback, tran);
        }
    },
    // protected
    setProperty: function (memberDefinition, value, callback, tran) {
        /// <param name="memberDefinition" type="MemberDefinition" />
        /// <param name="value" />
        /// <param name="callback" type="Function">done</param>
        this[memberDefinition.name] = value;
        
        //callback = $data.typeSystem.createCallbackSetting(callback);
        var pHandler = new $data.PromiseHandler();
        callback = pHandler.createCallback(callback);
        callback.success(this[memberDefinition.name]);
        return pHandler.getPromise();
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

    remove: function () {
        if ($data.ItemStore && 'EntityInstanceRemove' in $data.ItemStore)
            return $data.ItemStore.EntityInstanceRemove.apply(this, arguments);
        else
            throw 'not implemented'; //todo
    },
    save: function () {
        if ($data.ItemStore && 'EntityInstanceSave' in $data.ItemStore)
            return $data.ItemStore.EntityInstanceSave.apply(this, arguments);
        else
            throw 'not implemented'; //todo
    },
    refresh: function () {
        if ($data.ItemStore && 'EntityInstanceSave' in $data.ItemStore)
            return $data.ItemStore.EntityInstanceRefresh.apply(this, arguments);
        else
            throw 'not implemented'; //todo
    },
    storeToken: { type: Object, monitorChanges: false, notMapped: true, storeOnObject: true },

    getFieldUrl: function (field) {
        if (this.context) {
            return this.context.getFieldUrl(this, field);
        } else if (this.getType().storeToken && typeof this.getType().storeToken.factory === 'function') {
            var context = this.getType().storeToken.factory();
            return context.getFieldUrl(this, field);
        } else if (this.getType().storeToken){
            try {
                var ctx = $data.ItemStore._getContextPromise('default', this.getType());
                if (ctx instanceof $data.EntityContext) {
                    return ctx.getFieldUrl(this, field);
                }
            } catch (e) {
            }
        }
        return '#';
    }
},
{
    //create get_[property] and set_[property] functions for properties
    __setPropertyfunctions: { value: true, notMapped: true, enumerable: false, storeOnObject: true },
    //copy public properties to current instance
    __copyPropertiesToInstance: { value: false, notMapped: true, enumerable: false, storeOnObject: true },

    inheritedTypeProcessor: function (type) {
        if ($data.ItemStore && 'EntityInheritedTypeProcessor' in $data.ItemStore)
            $data.ItemStore.EntityInheritedTypeProcessor.apply(this, arguments);

        //default value setter method factory
        type.defaultValues = {};

        type.memberDefinitions.asArray().forEach(function (pd) {
            if (pd.hasOwnProperty("defaultValue")) {
                type.defaultValues[pd.name] = pd.defaultValue;
            }
        });

        if (Object.keys(type.defaultValues).length > 0) {
            type.setDefaultValues = function (initData, instance) {
                initData = initData || {};
                var dv = type.defaultValues;
                for (var n in dv) {
                    if (!(n in initData)) {
                        var value = dv[n];
                        if ("function" === typeof value) {
                            initData[n] = dv[n](n, instance);
                        } else {
                            initData[n] = dv[n];
                        }
                    }
                }
                return initData;
            }
        }
    },


    //Type Events
    addEventListener: function(eventName, fn) {
        var delegateName = "on" + eventName;
        if (!(delegateName in this)) {
            this[delegateName] = new $data.Event(eventName, this);
        }
        this[delegateName].attach(fn);
    },
    removeEventListener: function(eventName, fn) {
        var delegateName = "on" + eventName;
        if (!(delegateName in this)) {
            return;
        }
        this[delegateName].detach(fn);
    },
    raiseEvent: function(eventName, data) {
        var delegateName = "on" + eventName;
        if (!(delegateName in this)) {
            return;
        }
        this[delegateName].fire(data);
    },

    getFieldNames: function () {
        return this.memberDefinitions.getPublicMappedPropertyNames();
    },

    'from$data.Object': function (value, type, t, options) {
        if (!Object.isNullOrUndefined(value)) {
            var newInstanceOptions;
            if (options && options.converters) {
                newInstanceOptions = {
                    converters: options.converters
                }
            }

            return new this(value, newInstanceOptions);
        } else {
            return value;
        }
    }

});


$data.define = function (name, container, definition) {
    if (container && !(container instanceof $data.ContainerClass)) {
        definition = container;
        container = undefined;
    }
    if (!definition) {
        throw new Error("json object type is not supported yet");
    }
    var _def = {};
    var hasKey = false;
    var keyFields = [];
    Object.keys(definition).forEach(function (fieldName) {
        var propDef = definition[fieldName];
        if (typeof propDef === 'object' && ("type" in propDef || "get" in propDef || "set" in propDef)) {

            _def[fieldName] = propDef;
            if (propDef.key) {
                keyFields.push(propDef);
            }

            if (("get" in propDef || "set" in propDef) && (!('notMapped' in propDef) || propDef.notMapped === true)) {
                propDef.notMapped = true;
                propDef.storeOnObject = true;
            }
            if ("get" in propDef && !("set" in propDef)) {
                propDef.set = function () { };
            } else if ("set" in propDef && !("get" in propDef)) {
                propDef.get = function () { };
            }

        } else {
            _def[fieldName] = { type: propDef };
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


    var entityType = $data.Entity.extend(name, container, _def);
    return entityType;
}
$data.implementation = function (name) {
    return Container.resolveType(name);
};




