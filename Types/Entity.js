var EventSubscriber = $data.Class.define("subscriber", null, null, {
    constructor: function (handler, state, thisArg) {
        ///<param name="handler" type="Function">
        ///<signature>
        ///<param name="eventData" type="Object" />
        ///<param name="state" type="Object" />
        ///</signature>
        ///</param>
        ///<param name="state" type="Object" optional="true" />
        ///<param name="thisArg" type="Object" optional="true" />
        this.handler = handler;
        this.state = state;
        this.thisArg = thisArg;
    },
    handler: {},
    state: {},
    thisArg: {}
});

$data.Event = Event = Class.define("Event", null, null, {
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
            eventData.eventName = name;
            ///<value name="subscriberList type="Array" />
            if (subscriberList) {
                subscriberList.forEach(function (subscriber) {
                    ///<param name="subscriber" type="EventSubscriber" />
                    subscriber.handler.call(subscriber.thisArg, snd, eventData, subscriber.state);
                });
            }
        };
    }
});


var eventData = $data.Class.define("EventData", null, null, {
    eventName: {}
});

var PropertyChangeEventData = $data.Class.define("PropertyChangeEventData", eventData, null, {
    constructor: function (propertyName, oldValue, newValue) {
        this.propertyName = propertyName;
        this.oldValue = oldValue;
        this.newValue = newValue;
    },
    propertyName: {},
    oldValue: {},
    newValue: {}
});

var PropertyValidationEventData = $data.Class.define("PropertyValidationEventData", eventData, null, {
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

$data.Entity = Entity = Class.define("$data.Entity", null, null, {

    constructor: function (initData) {
        //this.initData = {};
        if (this.getType().__copyPropertiesToInstance) {
            $data.typeSystem.writePropertyValues(this);
        }

        Object.defineProperty(this, 'initData', { enumerable: false, configurable: true, writable: true, value: {} });
        var ctx = null;
        Object.defineProperty(this, 'context', { enumerable: false, configurable: false, get: function () { return ctx; }, set: function (value) { ctx = value; } });
        if (arguments.length == 1 && typeof initData === "object") {
            var memDefNames = this.getType().memberDefinitions.getPublicMappedProperties().map(function (memDef) { return memDef.name; });
            if (Object.keys(initData).every(function (key) { return memDefNames.indexOf(key) != -1; })) {
                this.initData = initData;
            }
        }
    },
    toString: function() { return this.getType().fullName + "(" + ( this.Id || this.Name || '' ) + ")" },
    toJSON: function () {
        var result = {};
        var self = this;
        this.getType().memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
            result[memDef.name] = self[memDef.name];
        });
        return result;
    },
    equals: function (entity) {
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
            var member = 'propertyChanging';
            var memDef = $data.typeSystem.lookupMemberDefinition(this.getType().memberDefinitions, member);

            if (memDef) {
                delete this[member];
                delete memDef.get;
                delete memDef.set;
                Object.defineProperty(this, member, memDef.createPropertyDescriptor());
                this[member] = new Event(member, this);
                return this[member];
            }
        },
        set: function () { }
    },
    propertyChanged: {
        dataType: $data.Event, storeOnObject: true, monitorChanges: false, notMapped: true, enumerable: false, prototypeProperty: true,
        get: function () {
            var member = 'propertyChanged';
            var memDef = $data.typeSystem.lookupMemberDefinition(this.getType().memberDefinitions, member);

            if (memDef) {
                delete this[member];
                delete memDef.get;
                delete memDef.set;
                Object.defineProperty(this, member, memDef.createPropertyDescriptor());
                this[member] = new Event(member, this);
                return this[member];
            }
        },
        set: function () { }
    },
    propertyValidationError: {
        dataType: $data.Event, storeOnObject: true, monitorChanges: false, notMapped: true, enumerable: false, prototypeProperty: true,
        get: function () {
            var member = 'propertyValidationError';
            var memDef = $data.typeSystem.lookupMemberDefinition(this.getType().memberDefinitions, member);

            if (memDef) {
                delete this[member];
                delete memDef.get;
                delete memDef.set;
                Object.defineProperty(this, member, memDef.createPropertyDescriptor());
                this[member] = new Event(member, this);
                return this[member];
            }
        },
        set: function () { }
    },

    storeProperty: function (memberDefinition, value) {
        ///<param name="memberDefinition" type="MemberDefinition" />
        //if (origValue == value) return;
        var eventData = null;
        if (memberDefinition.monitorChanges != false && (this._propertyChanging || "instancePropertyChanged" in this.constructor)) {
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
            if (!this[backingFieldName]) {
                Object.defineProperty(this, backingFieldName, memberDefinition.createStorePropertyDescriptor(value));
            }
            else {
                this[backingFieldName] = value;
            }
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

    retrieveProperty: function (memberDefinition) {
        if (memberDefinition.storeOnObject == true) {
            //TODO refactor to Base.getBackingFieldName
            var backingFieldName = "_" + memberDefinition.name;
            return this[backingFieldName];
        } else {
            return this.initData[memberDefinition.name];
        }
    },

    getProperty: function (memberDefinition, callback) {
        if (this[memberDefinition.name] != undefined) {
            callback(this[memberDefinition.name]);
            return;
        }

        if (!this.context)
            Guard.raise(new Exception('Entity not in context', 'Invalid operation'));

        return this.context.loadItemProperty(this, memberDefinition, callback);
    },
    setProperty: function (memberDefinition, value, callback) {
        this[memberDefinition.name] = value;
        callback();
    },

    isValid: function () {
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
        monitorChanges: false,
        notMapped: true,
        enumerable: false
    },

    resetChanges: function () { delete this._changedProperties; },

    changedProperties: {
        dataType: Array,
        elementType: window["MemberDefinition"],
        storeOnObject: true,
        monitorChanges: false,
        notMapped: true,
        enumerable: false
    },
    entityState: { dataType: "integer", storeOnObject: true, monitorChanges: false, notMapped: true, enumerable: false }/*,
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
}, {
    //create get_[property] and set_[property] functions for properties
    __setPropertyfunctions: { value: true, notMapped: true, enumerable: false, storeOnObject: true },
    //copy public properties to current instance
    __copyPropertiesToInstance: { value: false, notMapped: true, enumerable: false, storeOnObject: true }
});

