(function init($data, global) {

    function il(msg) {
        if (typeof intellisense !== 'undefined') {
            if (!intellisense.i) {
                intellisense.i = 0;
            }
            intellisense.i = intellisense.i + 1;
            intellisense.logMessage(msg + ":" + intellisense.i);
        }
    }


    function MemberDefinition(memberDefinitionData, definedClass) {
        
        ///<field name="name" type="String">*</field>
        ///<field name="dataType" type="Object">*</field>
        ///<field name="elementType" type="Object"></field>
        ///<field name="kind" type="String" />
        ///<field name="classMember" type="Boolean" />
        ///<field name="set" type="Function" />
        ///<field name="get" type="Function" />
        ///<field name="value" type="Object" />
        ///<field name="initialValue" type="Object" />
        ///<field name="method" type="Function" />
        ///<field name="enumerable" type="Boolean" />
        ///<field name="configurable" type="Boolean" />
        ///<field name="key" type="Boolean" />
        ///<field name="computed" type="Boolean" />
        ///<field name="storeOnObject" type="Boolean">[false] if false value is stored in initData, otherwise on the object</field>
        ///<field name="monitorChanges" type="Boolean">[true] if set to false propertyChange events are not raise and property tracking is disabled</field>

        this.kind = MemberTypes.property;
        //this.definedBy = definedClass;
        Object.defineProperty(this, 'definedBy', { value: definedClass, enumerable:false, configurable: false, writable: false });
        if (memberDefinitionData) {
            if (typeof memberDefinitionData === 'function') {
                this.method = memberDefinitionData;
                this.kind = MemberTypes.method;
            } else {
                this.enumerable = true;
                this.configurable = true;
                if (typeof memberDefinitionData === "number") {
                    this.value = memberDefinitionData;
                    this.dataType = "integer";
                } else if (typeof memberDefinitionData === "string") {
                    this.value = memberDefinitionData;
                    this.dataType = typeof memberDefinitionData;
                } else {
                    for (var item in memberDefinitionData) {
                        if (memberDefinitionData.hasOwnProperty(item)) {
                            this[item] = memberDefinitionData[item];
                        }
                    }
                }
            }
            if (this.type !== undefined) {
                this.dataType = this.dataType || this.type;
            } else {
                this.type = this.dataType;
            }
        }
    }


    MemberDefinition.prototype.createPropertyDescriptor = function (classFunction, value) {
        ///<returns type="Object" />
        var pd = this;
        var result = {
            enumerable: this.enumerable == undefined ? true : this.enumerable,
            configurable: this.configurable == undefined ? true : this.configurable
        };
        if (this.set && this.get) {
            result.set = this.set;
            result.get = this.get;
        } else if ("value" in this || value) {
            result.value = value || this.value;
            //TODO
            //result.writable = this.writable;
            result.writable = true;
        }
        else {
            result.set = function (value) { this.storeProperty(pd, value); };
            result.get = function () { return this.retrieveProperty(pd); };
        }
        return result;
    };
    MemberDefinition.prototype.createStorePropertyDescriptor = function (value) {
        var pd = this;
        return { enumerable: false, writable: true, configurable: pd.configurable, value: value };
    };
    MemberDefinition.prototype.createGetMethod = function () {
        var pd = this;
        return {
            enumerable: false, writable: false, configurable: false,
            value: function (callback) { return this.getProperty(pd, callback); }
        };
    };
    MemberDefinition.prototype.createSetMethod = function () {
        var pd = this;
        return {
            enumerable: false, writable: false, configurable: false,
            value: function (value, callback) { return this.setProperty(pd, value, callback); }
        };
    };

    MemberDefinition.prototype.toJSON = function () {
        var alma = {};
        for (var name in this) {
            if (name !== 'defineBy' && name !== 'storageModel') {
                alma[name] = this[name];
            }
        }
        return alma;
    }

    //TODO global/window
    $data.MemberDefinition = window["MemberDefinition"] = MemberDefinition;
    
    var memberDefinitionPrefix = '$';
    function MemberDefinitionCollection() { };
    MemberDefinitionCollection.prototype = {
		clearCache: function(){
			this.arrayCache = undefined;
			this.pubMapPropsCache = undefined;
			this.keyPropsCache = undefined;
			this.propByTypeCache = undefined;
		},
        asArray: function () {
            if (!this.arrayCache) {
                this.arrayCache = [];
                for (var i in this) {
                    if (i.indexOf(memberDefinitionPrefix) === 0)
                        this.arrayCache.push(this[i]);
                }
            }
            return this.arrayCache;
        },
        getPublicMappedProperties: function () {
			if (!this.pubMapPropsCache){
				this.pubMapPropsCache = [];
				for (var i in this){
					if (i.indexOf(memberDefinitionPrefix) === 0 && this[i].kind == 'property' && !this[i].notMapped && this[i].enumerable)
						this.pubMapPropsCache.push(this[i]);
				}
			}
			return this.pubMapPropsCache;// || (this.pubMapPropsCache = this.asArray().filter(function (m) { return m.kind == 'property' && !m.notMapped && m.enumerable; }));
		},
		getPublicMappedPropertyNames: function(){
		    if (!this.pubMapPropNamesCache){
		        this.pubMapPropNamesCache = [];
		        for (var i in this){
					if (i.indexOf(memberDefinitionPrefix) === 0 && this[i].kind == 'property' && !this[i].notMapped && this[i].enumerable)
						this.pubMapPropNamesCache.push(this[i].name);
				}
		    }
		    return this.pubMapPropNamesCache;
		},
        getKeyProperties: function () {
			if (!this.keyPropsCache){
				this.keyPropsCache = [];
				for (var i in this){
					if (i.indexOf(memberDefinitionPrefix) === 0 && this[i].kind == 'property' && this[i].key)
						this.keyPropsCache.push(this[i]);
				}
			}
			return this.keyPropsCache;
			//return this.keyPropsCache || (this.keyPropsCache = this.asArray().filter(function (m) { return m.kind == 'property' && m.key; }));
		},
        getPropertyByType: function (type) {
			if (!this.propByTypeCache){
				this.propByTypeCache = [];
				for (var i in this){
					if (i.indexOf(memberDefinitionPrefix) === 0 && this[i].dataType == type)
						this.propByTypeCache.push(this[i]);
				}
			}
			return this.propByTypeCache;
			//return this.propByTypeCache || (this.propByTypeCache = this.asArray().filter(function (m) { return m.dataType == type; }));
		},
        getMember: function (name) { return this[memberDefinitionPrefix + name]; },
        setMember: function (value) { this[memberDefinitionPrefix + value.name] = value; }
    };
    MemberDefinitionCollection.prototype.constructor = MemberDefinitionCollection;
    $data.MemberDefinitionCollection = window["MemberDefinitionCollection"] = MemberDefinitionCollection;

    
    eval('function Base() { };');

    $data.Base = Base;

    $data.Base.fullName = '$data.Base';
    if (!$data.Base.name) {
        $data.Base.name = "Base";
    };

    $data.Base.prototype.storeProperty = function (memberDefinition, value) {
        var backingFieldName = "_" + memberDefinition.name;
        if (!this[backingFieldName]) {
            Object.defineProperty(this, backingFieldName, memberDefinition.createStorePropertyDescriptor(value));
        }
        else {
            this[backingFieldName] = value;
        }
    };

    $data.Base.prototype.retrieveProperty = function (memberDefinition) {
        var backingFieldName = "_" + memberDefinition.name;
        return this[backingFieldName];
    };

    $data.Base.prototype.setProperty = function (memberDefinition, value, callback) {
        this[memberDefinition.name] = value;
        callback();
    };
    $data.Base.prototype.getProperty = function (memberDefinition, callback) {
        callback.apply(this, [this[memberDefinition.name]]);
    };
    $data.Base.extend = function (name, instanceDefinition, classDefinition) {
        return $data.Class.define(name, null, null, instanceDefinition, classDefinition);
    };
    //window['Base'] = Base;

    function ClassEngineBase() {
        this.classNames = {};
    }

    function MemberTypes() {
        ///<field name="method" type="string" />
        ///<field name="property" type="string" />
        ///<field name="field" type="string" />
        ///<field name="complexProperty" type="string" />
    }
    MemberTypes.__enum = true;

    MemberTypes.method = "method";
    MemberTypes.property = "property";
    MemberTypes.navProperty = "navProperty";
    MemberTypes.complexProperty = "complexProperty";
    MemberTypes.field = "field";

    $data.MemberTypes = MemberTypes;

    function TypeCreator() {

    }

    function TypeCreateStep(definedBy, initFunc) {
        this.definedBy = definedBy;
        this.initfunc = initFunc;
    }
    TypeCreateStep.constructor = "constructor";
    TypeCreateStep.classConstructor = "classConstructor";
    TypeCreateStep.mixin = "mixin";
    TypeCreateStep.propagation = "propagation";

    function TypeCreateObject()
    {
        this._createOrder = [];
        this._createOrder.calculated = false;
        this.keyIndex = [];

        this.constructorKeys = [];
        this.mixinKeys = [];
        this.propagationKeys = [];

        this.steppes = {};

        this.addStep = function (stepType, defined, typeCreateFunc) {
            this._createOrder.calculated = false;
            var key = defined.name + '_' + stepType;
            if (this.steppes[key])
                Guard.raise(new Exception("ERROR: '" + key + "' already defined!", "Type build error"));

            switch (stepType) {
                case TypeCreateStep.constructor:
                case TypeCreateStep.classConstructor:
                    this.constructorKeys.push(key);
                    break;
                case TypeCreateStep.mixin:
                    this.mixinKeys.push(key);
                    break;
                case TypeCreateStep.propagation:
                    this.propagationKeys.push(key);
                    break;
                default:
                    return;
            }

            this.steppes[key] = new TypeCreateStep(defined, typeCreateFunc);
        };
        this.keyCount = function(){
            return this.constructorKeys.length + this.mixinKeys.length + this.propagationKeys.length;
        };

        this.getOrderedSteppes = function () {
            if (this._createOrder.calculated == false) {
                var _this = this;
                //function _concatStep(key) {
                //    _this._createOrder.push(_this.steppes[key]);
                //}

                this._createOrder = [];
                for (var i = 0, l = mixinKeys.length; i < l; i++) {
                    _this._createOrder.push(_this.steppes[mixinKeys[i]]);
                }
                for (var i = 0, l = constructorKeys.length; i < l; i++) {
                    _this._createOrder.push(_this.steppes[constructorKeys[i]]);
                }
                for (var i = 0, l = propagationKeys.length; i < l; i++) {
                    _this._createOrder.push(_this.steppes[propagationKeys[i]]);
                }
                //this.mixinKeys.forEach(_concatStep);
                //this.constructorKeys.forEach(_concatStep);
                //this.propagationKeys.forEach(_concatStep);

                this._createOrder.calculated = true;
            }

            return this._createOrder;
        };
    }

    ClassEngineBase.prototype = {

    getClass: function(classReference) {

    },

    getProperties: function (classFunction) {
        return classFunction.propertyDefinitions;
    },



    define: function (className, baseClass, interfaces, instanceDefinition, classDefinition) {
        return this.defineEx(className, [{ type: baseClass }], interfaces, instanceDefinition, classDefinition);
    },
    defineEx: function (className, baseClasses, interfaces, instanceDefinition, classDefinition) {
        ///<param name="baseClasses" type="Array" elementType="Function" />

        //il("!defineClass was invoked:" + className);

        if (baseClasses.length == 0) {
            baseClasses.push({ type: $data.Base });
        } else if (baseClasses.length > 0 && !baseClasses[0].type){
            baseClasses[0].type = $data.Base;
        }

        var providedCtor = instanceDefinition.constructor;

        var classNameParts = className.split('.');
        var shortClassName = classNameParts.splice(classNameParts.length - 1, 1)[0];

        var root = window;
        classNameParts.forEach(function (part) {
            if (!root[part]) {
                //console.log("namespace missing:" + part + ", creating");
                var ns = {};
                ns.__namespace = true;
                root[part] = ns;
            }
            root = root[part];
        });

        var classFunction = null;
        classFunction = this.classFunctionBuilder(shortClassName, baseClasses, classDefinition, instanceDefinition);
        classFunction.fullName = className;
        classFunction.namespace = classNameParts.join('.'); //classname splitted

        this.buildType(classFunction, baseClasses, instanceDefinition, classDefinition);

        classFunction.name = shortClassName;
        Container.registerType(className, classFunction);

        if (typeof intellisense !== 'undefined') {
            if (instanceDefinition && instanceDefinition.constructor) {
                intellisense.annotate(classFunction, instanceDefinition.constructor);
            }
        }

        root[shortClassName] = this.classNames[className] = classFunction;

        //classFunction.prototype.constructor = instanceDefinition.constructor;
        //classFunction.constructor = instanceDefinition.constructor;
        //classFunction.toJSON = function () { return classFunction.memberDefinitions.filter( function(md) { return md; };
        return classFunction;
    },
    classFunctionBuilder: function (name, base, classDefinition, instanceDefinition) {
        return new Function('base', 'classDefinition', 'instanceDefinition', 'return function ' + name + ' (){ ' + 
            this.bodyBuilder(base, classDefinition, instanceDefinition) + ' \n}; ')(base, classDefinition, instanceDefinition);
    },
    bodyBuilder: function (bases, classDefinition, instanceDefinition) {
        var mixin = '';
        var body = '';
        var propagation = '';

        for (var i = 0, l = bases.length; i < l; i++) {
            var base = bases[i];
            var index = i;
            if (index == 0) { //ctor func
                if (base && base.type) {
                    body += '    var baseArguments = $data.typeSystem.createCtorParams(arguments, base[' + index + '].params, this); \n';
                    body += '    ' + base.type.fullName + '.apply(this, baseArguments); \n';
                }
            } else {
                if (base && base.type && base.propagateTo) {
                    //propagation
                    propagation += '    ' + (!propagation ? 'var ' : '' + '') + 'propagationArguments = $data.typeSystem.createCtorParams(arguments, base[' + index + '].params, this); \n';
                    propagation += '    this["' + base.propagateTo + '"] =  Object.create(' + base.type.fullName + '.prototype); \n' +
                                   '    ' + base.type.fullName + '.apply(this["' + base.propagateTo + '"], propagationArguments); \n';
                }
                else if (base && base.type && base.type.memberDefinitions && base.type.memberDefinitions.$constructor && !base.propagateTo) {
                    //mixin
                    mixin += '    ' + base.type.fullName + '.memberDefinitions.$constructor.method.apply(this); \n';
                }
            }
        }
        if (instanceDefinition && instanceDefinition.constructor != Object) 
            body += "    instanceDefinition.constructor.apply(this, arguments); \n";

        return '\n    //mixins \n' + mixin + '\n    //construction \n' + body + '\n    //propagations \n' + propagation;
    },

    buildType: function (classFunction, baseClasses, instanceDefinition, classDefinition) {
        var baseClass = baseClasses[0].type;
        classFunction.inheritsFrom = baseClass;

        if (baseClass) {
            classFunction.prototype = Object.create(baseClass.prototype);
            classFunction.memberDefinitions = Object.create(baseClass.memberDefinitions || new MemberDefinitionCollection());
			classFunction.memberDefinitions.clearCache();

			var staticDefs = baseClass.staticDefinitions;
			if (staticDefs){
				staticDefs = staticDefs.asArray();
				if (staticDefs) {
            		for(var i = 0; i < staticDefs.length; i++) {
						this.buildMember(classFunction, staticDefs[i], undefined, 'staticDefinitions');
            		}
				}
			}
            classFunction.baseTypes = (baseClass.baseTypes || []).concat(baseClasses.map(function (base) { return base.type; }));
            if (!classFunction.isAssignableTo) {
                Object.defineProperty(classFunction, "isAssignableTo", {
                    value: function (type) {
                        return this === type || this.baseTypes.indexOf(type) >= 0;
                    },
                    writable: false,
                    enumerable: false,
                    configurable: false
                });
            }
        }

        if (classDefinition) {
            this.buildStaticMembers(classFunction, classDefinition);

            if (classDefinition.constructor)
                classFunction.classConstructor = classDefinition.constructor;
        }

        if (instanceDefinition) {
            this.buildInstanceMembers(classFunction, instanceDefinition);
        }

        var mixins = [].concat(baseClasses);
        mixins.shift();
        if (Object.keys(mixins).length > 0)
            this.buildInstanceMixins(classFunction, mixins);

        classFunction.__class = true;

        classFunction.prototype.constructor = classFunction;

        Object.defineProperty(classFunction.prototype, "getType", {
            value: function () {
                return classFunction;
            },
            writable: false,
            enumerable: false,
            configurable: false
        });


        classFunction.extend = function (name, instanceDefinition, classDefinition) {
            return $data.Class.define(name, classFunction, null, instanceDefinition, classDefinition);
        };

        Object.defineProperty(classFunction, "getMemberDefinition", {
            value: function (name) {
                return classFunction.memberDefinitions.getMember(name);
            }
        });

    },

    addMethod: function (holder, name, method, propagation) {
        if (!propagation || (typeof intellisense !== 'undefined')) {
            holder[name] = method;
            } else {
                holder[name] = function () {
                    return method.apply(this[propagation], arguments);
                };
            }
    },

    addProperty: function (holder, name, propertyDescriptor, propagation) {
        
        //holder[name] = {};

        if (propagation)
        {
            propertyDescriptor.configurable = true;
            if (propertyDescriptor.get)
            {
                var origGet = propertyDescriptor.get;
                propertyDescriptor.get = function () {
                    if (!this[propagation])
                        Guard.raise(new Exception("not inicialized"));
                    return origGet.apply(this[propagation], arguments);
                };
            }
            if (propertyDescriptor.set) {
                var origSet = propertyDescriptor.set;
                propertyDescriptor.set = function () {
                    if (!this[propagation])
                        Guard.raise(new Exception("not inicialized"));
                    origSet.apply(this[propagation], arguments);
                };
            }
        }

        Object.defineProperty(holder, name, propertyDescriptor);
    },

    addField: function(holder, name, field) {
        Guard.raise("not implemented");
    },

    buildMethod: function (classFunction, memberDefinition, propagation) {
        ///<param name="classFunction" type="Function">The object that will receive member</param>
        ///<param name="memberDefinition" type="MemberDefinition">the newly added member</param>
        var holder = memberDefinition.classMember ? classFunction : classFunction.prototype;
        this.addMethod(holder, memberDefinition.name, memberDefinition.method, propagation);
    },

    buildProperty: function (classFunction, memberDefinition, propagation) {
        ///<param name="classFunction" type="Function">The object that will receive member</param>
        ///<param name="memberDefinition" type="MemberDefinition">the newly added member</param>
        var holder = memberDefinition.classMember ? classFunction : classFunction.prototype;
        var pd = memberDefinition.createPropertyDescriptor(classFunction);
        this.addProperty(holder, memberDefinition.name, pd, propagation);

        //if lazyload TODO
        if (!memberDefinition.classMember && classFunction.__setPropertyfunctions == true) {
            var pdGetMethod = memberDefinition.createGetMethod();
            this.addProperty(holder, 'get_' + memberDefinition.name, pdGetMethod, propagation);

            var pdSetMethod = memberDefinition.createSetMethod();
            this.addProperty(holder, 'set_' + memberDefinition.name, pdSetMethod, propagation);
        }
    },


    buildMember: function (classFunction, memberDefinition, propagation, memberCollectionName) {
        ///<param name="memberDefinition" type="MemberDefinition" />
        memberCollectionName = memberCollectionName || 'memberDefinitions';
        classFunction[memberCollectionName] = classFunction[memberCollectionName] || new MemberDefinitionCollection();

        classFunction[memberCollectionName].setMember(memberDefinition);

        switch (memberDefinition.kind) {
            case MemberTypes.method:
                this.buildMethod(classFunction, memberDefinition, propagation);
                break;
            case MemberTypes.navProperty:
            case MemberTypes.complexProperty:
            case MemberTypes.property:
                this.buildProperty(classFunction, memberDefinition, propagation);
                break;
            default: Guard.raise("Unknown member type: " + memberDefinition.kind + "," + memberDefinition.name);
        }
    },

    buildStaticMembers: function (classFunction, memberListDefinition) {
        ///<param name="classFunction" type="Object">The class constructor that will be extended</param>
        ///<param name="memberListDefinition" type="Object"></param>
        var t = this;
        for (var item in memberListDefinition)
        {
            if (memberListDefinition.hasOwnProperty(item)) {
                var memberDefinition = new MemberDefinition(memberListDefinition[item], classFunction);
                memberDefinition.name = item;
                memberDefinition.classMember = true;
                t.buildMember(classFunction, memberDefinition, undefined, 'staticDefinitions');
            }
        }
    },

    buildInstanceMembers: function (classFunction, memberListDefinition) {
        ///<param name="classFunction" type="Function">The class constructor whose prototype will be extended</param>
        ///<param name="memberListDefinition" type="Object"></param>
        ///pinning t outside of the closure seems actually faster then passing in the this  and referencing
        var t = this;
        for (var item in memberListDefinition) {
            if (memberListDefinition.hasOwnProperty(item)) {
                var memberDefinition = new MemberDefinition(memberListDefinition[item], classFunction);

                memberDefinition.name = item;
                t.buildMember(classFunction, memberDefinition);
            }
        }
    },

    copyMembers: function(sourceType, targetType) {
        ///<param name="sourceType" type="Function" />
        ///<param name="targetType" type="Function" />
        function il(msg) {
            if (typeof intellisense === 'undefined') {
                return;
            }
            intellisense.logMessage(msg);
        }

        Object.keys(sourceType.prototype).forEach(function (item, i, src) {
            if (item !== 'constructor' && item !== 'toString') {
                il("copying item:" + item);
                targetType.prototype[item] = sourceType[item];
            }
        });
    },

    buildInstanceMixins: function (classFunction, mixinList) {
        ///<param name="classFunction" type="Function">The class constructor whose prototype will be extended</param>
        ///<param name="mixinList" type="Array"></param>

        classFunction.mixins = classFunction.mixins || [];
        classFunction.propagations = classFunction.propagations || [];

        for(var i = 0; i < mixinList.length; i++) {
            var item = mixinList[i];
            //if (classFunction.memberDefinitions.getMember(item.type.name)) {
            if (item.propagateTo) {
                this.buildInstancePropagation(classFunction, item);
                classFunction.propagations.push(item);
                classFunction.propagations[item.type.name] = true;
            } else {
                this.buildInstanceMixin(classFunction, item);
                classFunction.mixins.push(item);
                classFunction.mixins[item.type.name] = true;
            }
        };
    },
    buildInstanceMixin: function (classFunction, typeObj) {
        ///<param name="classFunction" type="Function">The class constructor whose prototype will be extended</param>
        ///<param name="typeObj" type="Object"></param>

        var memberDefs = typeObj.type.memberDefinitions.asArray();
        for (var i = 0, l = memberDefs.length; i < l; i++) {
            var itemName = memberDefs[i].name;
            if (itemName !== 'constructor' && !classFunction.memberDefinitions.getMember(itemName)) {
                this.buildMember(classFunction, memberDefs[i]);
            }
            }
    },
    buildInstancePropagation: function (classFunction, typeObj) {
        ///<param name="classFunction" type="Function">The class constructor whose prototype will be extended</param>
        ///<param name="typeObj" type="Object"></param>

        var memberDefs = typeObj.type.memberDefinitions.asArray();
        for (var i = 0, l = memberDefs.length; i < l; i++) {
            var itemName = memberDefs[i].name;
            if (itemName !== 'constructor' && !classFunction.memberDefinitions.getMember(itemName)) {
                this.buildMember(classFunction, memberDefs[i], typeObj.propagateTo);
            }
            }
    }

};

    $data.Class = Class = new ClassEngineBase();


(function (global) {

    function ContainerCtor() {

        var classNames = {};
        var consolidatedClassNames = [];
        var classTypes = [];

        this.classNames = classNames;
        this.consolidatedClassNames = consolidatedClassNames;
        this.classTypes = classTypes;

        var mappedTo = [];
        this.mappedTo = mappedTo;

        var self = this;

        this["holder"] = null;

        var IoC = function (type, parameters) {
            var t = self.resolveType(type);
            var inst = Object.create(t.prototype);
            t.apply(inst, parameters);
            return inst;
        };

        this.mapType = function (aliasTypeOrName, realTypeOrName) {
            Guard.requireValue("aliasType", aliasTypeOrName);
            Guard.requireValue("realType", realTypeOrName);
            var aliasT = this.getType(aliasTypeOrName);
            var realT = this.getType(realTypeOrName);
            var aliasPos = classTypes.indexOf(aliasT);
            var realPos = classTypes.indexOf(realT);
            mappedTo[aliasPos] = realPos;
        },

        this.resolve = function (type, parameters) {
            var classFunction = this.resolveType(type, parameters);
            return new classFunction(parameters);
        };

        this.resolveName = function (type) {
            var t = this.resolveType(type);
            var tPos = classTypes.indexOf(t);
            return consolidatedClassNames[tPos];
        };

        this.isPrimitiveType = function(type) {
            var t = this.resolveType(type);
            return t === Number || t === String || t === Date || t === String || t === Boolean || t === Array || t === Object ||
                t === $data.Number || t === $data.String || t === $data.Date || t === $data.String || t === $data.Boolean || t === $data.Array || t === $data.Object;
        };

        this.resolveType = function (typeOrName) {
            var t = typeOrName;
            t = this.getType(t);
            var posT = classTypes.indexOf(t);
			return typeof mappedTo[posT] === 'undefined' ? t : classTypes[mappedTo[posT]];
        };

        this.getTypes = function () {
            return Object.keys(classNames).map(function (className, index) {
                return { name: className, type: classTypes[classNames[className]], toString: function () { return this.name; } };
            });
        };

        //this.getTypeName( in type);
        //this.resolveType()
        //this.inferTypeFromValue = function (value) {

        this.getTypeName = function (value) {
            switch (typeof value) {
                case 'object':
                    if (value == null) return '$data.Object';
                    if (value instanceof Array) return '$data.Array';
                    if (value.getType) return value.getType().fullName;
                    if (value instanceof Date) return '$data.Date';
                    //if(value instanceof "number") return
                default:
                    return typeof value;
            }
        };

        this.isTypeRegistered = function (typeOrName) {
            if (typeof typeOrName === 'function') {
                return classTypes.indexOf(typeOrName) > -1;
            } else {
                return typeOrName in classNames;
            }
        };

        this.unregisterType = function (type) {
            Guard.raise("Unimplemented");
        };

        this.getType = function (typeOrName) {
            Guard.requireValue("typeOrName", typeOrName);
            if (typeof typeOrName === 'function') {
                return typeOrName;
            };

            if (!(typeOrName in classNames)) {
                Guard.raise(new Exception("Unable to resolve type:" + typeOrName));
            };
            return classTypes[classNames[typeOrName]];
        };

        this.getName = function (typeOrName) {
            var t = this.getType(typeOrName);
            var tPos = classTypes.indexOf(t);
            if (tPos == -1)
                Guard.raise("unknown type to request name for: " + typeOrName);
            return consolidatedClassNames[tPos];
        };

		this.getDefault = function (typeOrName) {
			var t = this.resolveType(typeOrName);
			switch (t){
				case $data.Number: return 0.0;
				case $data.Integer: return 0;
				case $data.String: return '';
				case $data.Boolean: return false;
				default: return null;
			}
		};

        //name array ['', '', '']
        this.registerType = function(nameOrNamesArray, type, factoryFunc) {
            ///<signature>
            ///<summary>Registers a type and optionally a lifetimeManager with a name
            ///that can be used to later resolve the type or create new instances</summary>
            ///<param name="nameOrNamesArray" type="Array">The names of the type</param>
            ///<param name="type" type="Function">The type to register</param>
            ///<param name="instanceManager" type="Function"></param>
            ///</signature>
            ///<signature>
            ///<summary>Registers a new type that </summary>
            ///<param name="aliasType" type="Function">The name of the type</param>
            ///<param name="actualType" type="Function">The type to register</param>
            ///</signature>


            ///TODO remove
            /*if (typeof typeNameOrAlias === 'string') {
                if (classNames.indexOf(typeNameOrAlias) > -1) {
                    Guard.raise("Type already registered. Remove first");
                }
            }*/

            if (!nameOrNamesArray) {
                return;
            }

            //todo add ('number', 'number')
            if (typeof type === "string") {
                type = self.resolveType(type);
            }

            if (typeof nameOrNamesArray === 'string') {
                var tmp = [];
                tmp.push(nameOrNamesArray);
                nameOrNamesArray = tmp;
            }

            for (var i = 0; i < nameOrNamesArray.length; i++) {
                var parts = nameOrNamesArray[i].split('.');
                var item = {};
                item.shortName = parts[parts.length - 1];
                item.fullName = nameOrNamesArray[i];
                nameOrNamesArray[i] = item;
            }

            //if (type.


            var creatorFnc = function () { return IoC(type, arguments); };

            if (typeof intellisense !== 'undefined') {
                intellisense.annotate(creatorFnc, type);
            }

            for (var i = 0, l = nameOrNamesArray.length; i < l; i++) {
                var item = nameOrNamesArray[i];
                if (!(("create" + item.shortName) in self)) {
                    if (typeof factoryFunc === 'function') {
                        self["create" + item.shortName] = factoryFunc;
                    } else {
                        self["create" + item.shortName] = creatorFnc;
                    }
                } else {
                    if (console) { console.warn("warning: short names overlap:" + item.shortName + ", Container.create" + item.shortName + " has not been updated"); }
                };

                var typePos = classTypes.indexOf(type);
                if (typePos == -1) {
                    //new type
                    typePos = classTypes.push(type) - 1;
                    var fn = item.fullName;
                    consolidatedClassNames[typePos] = item.fullName;
                };

                if (item.fullName in classNames) {
                    console.warn("warning:!!! This typename has already been registered:" + item.fullName);
                };
                classNames[item.fullName] = typePos;
            }

			if (!type.name){
				type.name = nameOrNamesArray[0].shortName;
			}
        };
    }

    $data.Number = typeof Number !== 'undefined' ? Number : function JayNumber() { };
    $data.Integer = typeof Integer !== 'undefined' ? Integer : function JayInteger() {  };
    $data.Date = typeof Date !== 'undefined' ? Date : function JayDate() { };
    $data.String = typeof String !== 'undefined' ? String : function JayString() { };
    $data.Boolean = typeof Boolean !== 'undefined' ? Boolean : function JayBoolean() { };
    $data.Blob = /*typeof Blob !== 'undefined' ? Blob :*/ function JayBlob() { };
    $data.Array = typeof Array !== 'undefined' ? Array : function JayArray() { };
    $data.Object = typeof Object !== 'undefined' ? Object : function JayObject() { };
    $data.Function = Function;

    var c;
    global["Container"] = $data.Container = c = global["C$"] = new ContainerCtor();
    c.registerType(["$data.Number", "number", "float", "real", "decimal", "JayNumber"], $data.Number);
    c.registerType(["$data.Integer", "int", "integer", "int16", "int32", "int64", "JayInteger"], $data.Integer);
    c.registerType(["$data.String", "string", "text", "character", "JayString"], $data.String);
    c.registerType(["$data.Array", "array", "Array", "[]", "JayArray"], $data.Array, function () {
        return $data.Array.apply(undefined, arguments);
    });
    c.registerType(["$data.Date", "datetime", "date", "JayDate"], $data.Date);
    c.registerType(["$data.Boolean", "bool", "boolean", "JayBoolean"], $data.Boolean);
    c.registerType(["$data.Blob", "blob", "JayBlob"], $data.Blob);
    c.registerType(["$data.Object", "Object", "object", "{}", "JayObject"], $data.Object);
    c.registerType(["$data.Function", "Function", "function"], $data.Function);


})(window);

global["$C"] = function () { Class.define.apply(Class, arguments); };


$data.Class.ConstructorParameter = ConstructorParameter = $data.Class.define('ConstructorParameter', null, null, {
    constructor: function (paramIndex) {
        ///<param name="paramIndex" type="integer" />
        this.paramIndex = paramIndex;
    },
    paramIndex: {}
});
/*$data.Class.MixinParameter = MixinParameter = $data.Class.define('MixinParameter', null, null, {
    constructor: function (typeName) {
        ///<param name="paramIndex" type="integer">
        this.typeName = typeName;
    },
    typeName: {}
});*/

//var e = new Entity();


/*$data.Interface = Class.define("Interface", null, null, {
    constructor: function() { Guard.raise("Can not create an interface"); }
},
{
    define: function (name, definition) {
        var result = Class.define(name, $data.Interface, null, null, definition);
        delete result.__class;
        result.__interface = true;
        return result;
    }
});



$data.Observable = Observable = Class.define("Observable", null, null, {
    propertyChanged: { dataType: $data.Event }
}, { 
    createFromInstance: function(instance) {
        var propNames = instance.getClass().memberDefinitions.f
    }
});*/


})($data, window);

$data.defaultErrorCallback = function () {
    //console.log('DEFAULT ERROR CALLBACK:');
    /*if (console.dir)
        console.dir(arguments);
    else
        console.log(arguments);*/
    Guard.raise(new Exception("DEFAULT ERROR CALLBACK!", "DefaultError", arguments));
};
$data.defaultSuccessCallback = function () { console.log('DEFAULT SUCCES CALLBACK'); };
$data.defaultNotifyCallback = function () { console.log('DEFAULT NOTIFY CALLBACK'); };

$data.typeSystem = {
    __namespace: true,
    /*inherit: function (ctor, baseType) {
        var proto = new baseType();
        ctor.prototype = $.extend(proto, ctor.prototype);
        //console.dir(proto);
        ctor.prototype.base = new baseType();
        //console.dir(ctor.prototype.base);
        ctor.prototype.constructor = ctor;
        return ctor;
    },*/
    //mix: function (type, mixin) {
    //    type.prototype = $.extend(type.prototype || {}, mixin.prototype || {});
    //    type.mixins = type.mixins || [];
    //    type.mixins.push(mixin);
    //    return type;
    //},
    extend: function (target) {
        /// <summary>
        /// Extends an object with properties of additional parameters.
        /// </summary>
        /// <signature>
        /// <param name="target" type="Object">Object that will be extended.</param>
        /// <param name="object" type="Object">Object to extend target with.</param>
        /// <param name="objectN" optional="true" parameterArray="true" type="Object">Object to extend target with.</param>
        /// </signature>        
        /// <signature>
        /// <param name="target" type="Function">Function that will be extended.</param>
        /// <param name="object" type="Object">Object to extend target with.</param>
        /// <param name="objectN" optional="true" parameterArray="true" type="Object">Object to extend target with.</param>
        /// </signature>
    	/// <returns></returns>
        if (typeof target !== 'object' && typeof target !== 'function')
            Guard.raise('Target must be object or function');

        for (var i = 1; i < arguments.length; i++) {
            var obj = arguments[i];
            if (obj === null || typeof obj === 'undefined')
                continue;
            for (key in obj) {
                target[key] = obj[key];
            }
        }        
        return target;
    },
    createCallbackSetting: function (callBack, defaultSetting) {
        var setting = {
            success: $data.defaultSuccessCallback,
            error: $data.defaultErrorCallback,
            notify: $data.defaultNotifyCallback
        };
        if (defaultSetting != undefined && defaultSetting != null) {
            setting = defaultSetting;
        }
        if (callBack == null || callBack == undefined) {
            return setting;
        }
        if (typeof callBack == 'function') {
            return this.extend(setting, { success: callBack });
        }
        return this.extend(setting, callBack);
    },
    createCtorParams: function(source, indexes, thisObj) {
        ///<param name="source" type="Array" />Paramerter array
        ///<param name="indexes" type="Array" />
        ///<param name="thisObj" type="Object" />
        if (indexes) {
            var paramArray = [];
            for (var i = 0, l = indexes.length; i < l; i++) {
                var item = i;
                if (indexes[item] instanceof ConstructorParameter)
                    paramArray.push(source[indexes[item].paramIndex]);
                else if (typeof indexes[item] === "function")
                    paramArray.push(indexes[item].apply(thisObj));
                else
                    paramArray.push(indexes[item]);
            }
            return paramArray;
        }
        return source;
    },
    writePropertyValues: function (obj)
    {
        if (obj && obj.getType && obj.getType().memberDefinitions)
        {
            this.writeProperties(obj, obj.getType().memberDefinitions.asArray().filter(
                function (md) { return (md.kind == "property" || md.kind == "navProperty" || md.kind == "complexProperty") && !md.prototypeProperty; }
                ));
        }
    },
    writeProperties: function (obj, members)
    {
        var defines = {};
        for (var i = 0, l = members.length; i < l; i++) {
            var memDef = members[i];
            defines[memDef.name] = memDef.createPropertyDescriptor(null, memDef.value);
        }

        Object.defineProperties(obj, defines);

    },
    writeProperty: function (obj, member, value)
    {
        var memDef = typeof member === 'string' ? obj.getType().memberDefinitions.getMember(member) : member;
        if (memDef) {
            var propDef = memDef.createPropertyDescriptor(null, value);
            //////OPTIMIZATION
            Object.defineProperty(obj, memDef.name, propDef);
        }
    }
};
