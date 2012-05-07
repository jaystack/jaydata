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
                    Object.keys(memberDefinitionData).forEach(function (item) {
                        this[item] = memberDefinitionData[item];
                    }, this);
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

    //TODO global/window
    $data.MemberDefinition = window["MemberDefinition"] = MemberDefinition;
    
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

        var aliases = [
                { aliases: ["int", "integer", "int16"], type: Number },
                { aliases: ["text", "string"], type: String },
                { aliases: ["date", "time"], type: Date },
                { aliases: ["bool", "yesno", "igazhamis", "avansn"], type: Boolean }
        ];
        aliases.forEach(function (aliasList) {
            aliasList.aliases.forEach(function (alias) {
                this.classNames[alias] = aliasList.type;
            }, this);
        }, this);
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
    //MemberTypes.propagation = "propagation";

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
                function _concatStep(key) {
                    _this._createOrder.push(_this.steppes[key]);
                }

                this._createOrder = [];
                this.mixinKeys.forEach(_concatStep);
                this.constructorKeys.forEach(_concatStep);
                this.propagationKeys.forEach(_concatStep);

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
        ///

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
        //var docComment = test.toString().replace("function test() {", "").replace("}","");
        var docComment = '';

        /*var ctorFunctionDefinition = "classFunction = function " + shortClassName + " (a,b,c) { " + docComment + "\n }";
        if (simpleCtorFunc == false)
            ctorFunctionDefinition = "classFunction = function " + shortClassName + " () { " + docComment + "\n initObjectInstance2(this, arguments, initObject); \n}";
        
        if (typeof intellisense === 'undefined') {
            eval(ctorFunctionDefinition);
        } else {
            eval(ctorFunctionDefinition);
            //var ctor = instanceDefinition.constructor|| eval(ctorFunctionDefinition);
            //classFunction = ctor;
        }*/
        classFunction = this.classFunctionBuilder(shortClassName, baseClasses, classDefinition, instanceDefinition);
        classFunction.fullName = className;
        this.buildType(classFunction, baseClasses, instanceDefinition, classDefinition);
        //if (!("name" in classFunction)) {
        classFunction.name = shortClassName;
        //};
        if (typeof intellisense !== 'undefined') {
            if (instanceDefinition && instanceDefinition.constructor) {
                intellisense.annotate(classFunction, instanceDefinition.constructor);
            }
        }
        /*discover new type*/
        //this.discoverType(classFunction, baseClasses[0].params, initObject, false);


        Container.registerType(className, classFunction);
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

        bases.forEach(function (base, index) {
            if (index == 0) { //ctor func
                if (base && base.type) {
                    body += '    var baseArguments = $data.typeSystem.createCtorParams(arguments, base[' + index + '].params, this); \n';
                    body += '    ' + base.type.fullName + '.apply(this, baseArguments); \n';
                }
            } else {
                if (base && base.type && base.type.name in instanceDefinition) {
                    //propagation
                    propagation += '    ' + (!propagation ? 'var ' : '' + '') + 'propagationArguments = $data.typeSystem.createCtorParams(arguments, base[' + index + '].params, this); \n';
                    propagation += '    this["' + base.type.name + '"] =  Object.create(' + base.type.fullName + '.prototype); \n' +
                                   '    ' + base.type.fullName + '.apply(this["' + base.type.name + '"], propagationArguments); \n';
                }
                else if (base && base.type && !(base.type.name in instanceDefinition)) {
                    //mixin
                    mixin += '    ' + base.type.fullName + '.apply(this); \n';
                }
            }
        });

        if (instanceDefinition && instanceDefinition.constructor != Object) 
            body += "    instanceDefinition.constructor.apply(this, arguments); \n";

        return '\n    //mixins \n' + mixin + '\n    //construction \n' + body + '\n    //propagations \n' + propagation;
    },

    buildType: function (classFunction, baseClasses, instanceDefinition, classDefinition) {
        var baseClass = baseClasses[0].type;
        classFunction.inheritsFrom = baseClass;

        if (baseClass) {
            classFunction.prototype = Object.create(baseClass.prototype);
            classFunction.memberDefinitions = this.buildMemberDefinitionsArray(baseClass.memberDefinitions);
            if(baseClass.staticDefinitions){
                baseClass.staticDefinitions.forEach(function (staticDef) {
                    this.buildMember(classFunction, staticDef, undefined, 'staticDefinitions');
                }, this);
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
                return classFunction.memberDefinitions.filter(function (md) {
                    return md.name == name;
                })[0];
            }
        });

    },
    buildMemberDefinitionsArray: function (inheritedMemberDefinitions) {
        var memDefs = inheritedMemberDefinitions ? [].concat(inheritedMemberDefinitions) : [];

        var memDefExtensions = [
            { name: 'getPublicMappedProperties', method: function () { return this.filter(function (m) { return m.kind == 'property' && !m.notMapped && m.enumerable; }); } },
            { name: 'getKeyProperties', method: function () { return this.filter(function (m) { return m.kind == 'property' && m.key; }); } },
            { name: 'getPropertyByType', method: function (type) { return this.filter(function (m) { return m.dataType == type; }); } }
        ];

        memDefExtensions.forEach(function (extension) {
            Object.defineProperty(memDefs, extension.name, {
                enumerable: false,
                configurable: false,
                writable: false,
                value: extension.method
            });
        });

        return memDefs;
    },

    addMethod: function (holder, name, method, propagation) {
        if (!propagation)
            holder[name] = method;
        else
            if (typeof intellisense !== 'undefined') {
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
        classFunction[memberCollectionName] = classFunction[memberCollectionName] || [];

        //override property //TODO refactor
        var exists = classFunction[memberCollectionName].some(function (m, idx) {
            if (m.name == memberDefinition.name)
            {
                classFunction[memberCollectionName][idx] = memberDefinition;
                return true;
            }
            return false;
        });

        if (!exists)
            classFunction[memberCollectionName].push(memberDefinition);
        //classFunction.memberDefinitions[memberDefinition.name] = memberDefinition;
            
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
        var keys = Object.keys(memberListDefinition);
        var t = this;
        keys.forEach(function (item, index) {
            var memberDefinition = new MemberDefinition(memberListDefinition[item], classFunction);
            memberDefinition.name = item;
            memberDefinition.classMember = true;
            t.buildMember(classFunction, memberDefinition, undefined, 'staticDefinitions');
        }, this);
    },

    buildInstanceMembers: function (classFunction, memberListDefinition) {
        ///<param name="classFunction" type="Function">The class constructor whose prototype will be extended</param>
        ///<param name="memberListDefinition" type="Object"></param>
        var keys = Object.keys(memberListDefinition);
        ///pinning t outside of the closure seems actually faster then passing in the this  and referencing
        var t = this;
        keys.forEach(function (item, index) {
            var memberDefinition = new MemberDefinition(memberListDefinition[item], classFunction);

            memberDefinition.name = item;
            t.buildMember(classFunction, memberDefinition);
        }, this);
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
        var keys = Object.keys(mixinList);
        var classFunctionMemberNames = classFunction.memberDefinitions ? classFunction.memberDefinitions.map(function (m) { return m.name; }) : [];
        //classFunction.mixins2 = mixinList;
        classFunction.mixins = classFunction.mixins || [];
        classFunction.propagations = classFunction.propagations || [];
        ///pinning t outside of the closure seems actually faster then passing in the this  and referencing
        var t = this;
        keys.forEach(function (item, index) {
            //if (classFunctionMemberNames.indexOf(mixinList[item].type.name) > 0) {
            if (classFunctionMemberNames.some(function (m) { return m == mixinList[item].type.name; })) {
                t.buildInstancePropagation(classFunction, mixinList[item], classFunctionMemberNames);
                classFunction.propagations.push(mixinList[item]);
                classFunction.propagations[mixinList[item].type.name] = true;
            } else {
                t.buildInstanceMixin(classFunction, mixinList[item], classFunctionMemberNames);
                classFunction.mixins.push(mixinList[item]);
                classFunction.mixins[mixinList[item].type.name] = true;
            }
        }, this);
    },
    buildInstanceMixin: function (classFunction, typeObj, classFunctionMemberNames) {
        ///<param name="classFunction" type="Function">The class constructor whose prototype will be extended</param>
        ///<param name="typeObj" type="Object"></param>
        var t = this;
        var memberKeys = Object.keys(typeObj.type.memberDefinitions);
        memberKeys.forEach(function (mItem, mIndex) {
            var itemName = typeObj.type.memberDefinitions[mItem].name;
            if (itemName !== 'constructor' && !classFunctionMemberNames.some(function (m) { return m == itemName; })) {
                t.buildMember(classFunction, typeObj.type.memberDefinitions[mItem]);
            }
        });
    },
    buildInstancePropagation: function (classFunction, typeObj, classFunctionMemberNames) {
        ///<param name="classFunction" type="Function">The class constructor whose prototype will be extended</param>
        ///<param name="typeObj" type="Object"></param>
        ///<param name="classFunctionMemberNames" type="Array"></param>
        var t = this;

        var memberKeys = Object.keys(typeObj.type.memberDefinitions);
        memberKeys.forEach(function (mItem, mIndex) {
            var itemName = typeObj.type.memberDefinitions[mItem].name;
            if (itemName !== 'constructor' && !classFunctionMemberNames.some(function (m) { return m == itemName; })) {
                t.buildMember(classFunction, typeObj.type.memberDefinitions[mItem], typeObj.type.name);
            }
        });

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
            if (typeof mappedTo[posT] === 'undefined') {
                return t;
            } else {
                ///Multi level map
                return classTypes[mappedTo[posT]];
            };
            //return t; // unreachable code
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
        //name array ['', '', '']
        this.registerType = function(nameOrNamesArray, type) {
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

            //todo add ('number', 'number')
            if (typeof type === "string") {
                type = self.resolveType(type);
            }

            if (!(nameOrNamesArray instanceof Array))
                nameOrNamesArray = [nameOrNamesArray];

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

            nameOrNamesArray.forEach(function(item) {
                //console.log("create" + item.name);

                if (! (("create" + item.shortName) in self)) {
                    self["create" + item.shortName] = creatorFnc;
                } else {
                    if (console) { console.log("warning: short names overlap:" + item.shortName + ", Container.create" + item.shortName + " has not been updated"); }
                };
                
                var typePos = classTypes.indexOf(type);
                if (typePos == -1) {
                    //new type
                    typePos = classTypes.push(type) - 1;
                    var fn = item.fullName;
                    consolidatedClassNames[typePos] = item.fullName;
                };
                
                if (item.fullName in classNames) {
                    console.log("warning:!!! This typename has already been registered:" + item.fullName);
                };
                classNames[item.fullName] = typePos;
            });
        };
    }

    $data.Number = typeof Number !== 'undefined' ? Number : function Number() { };
    $data.Integer = typeof Integer !== 'undefined' ? Integer : function Integer() {  };
    $data.Date = typeof Date !== 'undefined' ? Date : function Date() { };
    $data.String = typeof String !== 'undefined' ? String : function String() { };
    $data.Boolean = typeof Boolean !== 'undefined' ? Boolean : function Boolean() { };
    $data.Blob = /*typeof Blob !== 'undefined' ? Blob :*/ function Blob() { };
    $data.Array = typeof Array !== 'undefined' ? Array : function Array() { };
    $data.Object = typeof Object !== 'undefined' ? Object : function Object() { };
    $data.Function = Function;

    var c;
    global["Container"] = $data.Container = c = global["C$"] = new ContainerCtor();
    c.registerType(["$data.Number", "number", "float", "real", "decimal"], $data.Number);
    c.registerType(["$data.Integer", "int", "integer", "int16", "int32", "int64"], $data.Integer);
    c.registerType(["$data.String", "string", "text", "character"], $data.String);
    c.registerType(["$data.Array", "array", "Array", "[]"], $data.Array);
    c.registerType(["$data.Date", "datetime", "date"], $data.Date);
    c.registerType(["$data.Boolean", "bool", "boolean"], $data.Boolean);
    c.registerType(["$data.Blob", "blob"], $data.Blob);
    c.registerType(["$data.Object", "Object", "object"], $data.Object);
    c.registerType(["$data.Function", "Function", "function"], $data.Function);


})(window);

global["$C"] = function () { Class.define.apply(Class, arguments); };


$data.Class.ConstructorParameter = ConstructorParameter = $data.Class.define('ConstructorParameter', null, null, {
    constructor: function (paramIndex) {
        ///<param name="paramIndex" type="integer">
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
    mix: function (type, mixin) {
        type.prototype = $.extend(type.prototype || {}, mixin.prototype || {});
        type.mixins = type.mixins || [];
        type.mixins.push(mixin);
        return type;
    },
    extend: function (target, obj1) {
        return $.extend(target, obj1);
    },
    createCallbackSetting: function (callBack, defaultSetting) {
        var setting = {
            success: function () {
                console.log('DEFAULT SUCCES CALLBACK');
            },
            error: function () {
                console.log('DEFAULT ERROR CALLBACK:');
                if (console.dir)
                    console.dir(arguments);
                else
                    console.log(arguments);
            },
            notify: function () {
                console.log('DEFAULT NOTIFY CALLBACK');
            }
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
            var keys = Object.keys(indexes);
            keys.forEach(function (item) {
                if (indexes[item] instanceof ConstructorParameter)
                    paramArray.push(source[indexes[item].paramIndex]);
                else if (typeof indexes[item] === "function")
                    paramArray.push(indexes[item].apply(thisObj));
                else
                    paramArray.push(indexes[item]);
            });
            return paramArray;
        }
        return source;
    },
    writePropertyValues: function (obj)
    {
        if (obj && obj.getType && obj.getType().memberDefinitions)
        {
            this.writeProperties(obj, obj.getType().memberDefinitions.filter(
                function (md) { return (md.kind == "property" || md.kind == "navProperty" || md.kind == "complexProperty") && !md.prototypeProperty; }
                ));
        }
    },
    writeProperties: function (obj, members)
    {
        var defines = {};
        members.forEach(function (memDef) {
            defines[memDef.name] = memDef.createPropertyDescriptor(null, memDef.value);
        });

        Object.defineProperties(obj, defines);

    },
    writeProperty: function (obj, member, value)
    {
        var memDef = typeof member === 'string' ?
                $data.typeSystem.lookupMemberDefinition(obj.constructor.memberDefinitions, member) : member;
        if (memDef) {
            var propDef = memDef.createPropertyDescriptor(null, value);
            //////OPTIMIZATION
            Object.defineProperty(obj, memDef.name, propDef);
        }
    },
    lookupMemberDefinition: function lookupMemberDefinition(list, name) {
        ///<param name="list" type="Array" elementType="$data.MemberDefinition" />
        ///TODO optimal member definition table with sorted memberNames list 
        console.log("Lookup:" + name);
        var member = list.filter(function (md) {
            ///<param name="md" type="$data.MemberDefinition" />
            return md.name === name && md.kind === $data.MemberTypes.property;
        });
        return member[0];
    }
};
