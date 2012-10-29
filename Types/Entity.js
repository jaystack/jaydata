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

