import $data from './initializeJayData.js';
import Exception from './Exception.js';
import { Guard } from './utils.js';
import { StringFunctions } from './Extensions.js'
import {ContainerInstance, ContainerCtor} from './Container.js'


$data.StringFunctions = StringFunctions

var _modelHolder = null;
$data.setModelContainer = function(modelHolder){
  _modelHolder = modelHolder;
};

$data.defaults = $data.defaults || {}
$data.defaults.openTypeDefaultPropertyName = "dynamicProperties";
$data.defaults.openTypeDefaultType = '$data.Object';
$data.defaults.openTypeDefaultValue = function() { return {}; };

$data.__global = process.browser ? window : global
$data.setGlobal = function(obj){
  $data.__global = obj;
};

(function init($data) {

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
    Object.defineProperty(this, 'definedBy', {
      value: definedClass,
      enumerable: false,
      configurable: false,
      writable: false
    });
    if (memberDefinitionData) {
      if (typeof memberDefinitionData === 'function' || typeof memberDefinitionData.asFunction === 'function') {
        this.method = memberDefinitionData;
        this.kind = MemberTypes.method;
      } else {
        this.enumerable = true;
        this.configurable = true;
        if (typeof memberDefinitionData === "number") {
          this.value = memberDefinitionData;
          this.type = $data.Number;
          this.dataType = $data.Number;
        } else if (typeof memberDefinitionData === "string") {
          this.value = memberDefinitionData;
          this.dataType = $data.String;
          this.type = $data.String;
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

      this.originalType = this.type;
      if (this.elementType !== undefined) {
        this.originalElementType = this.elementType;
      }
    }
  }
  MemberDefinition.prototype.createPropertyDescriptor = function(classFunction, value) {
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
    } else {
      result.set = function(value) {
        this.storeProperty(pd, value);
      };
      result.get = function() {
        return this.retrieveProperty(pd);
      };
    }
    return result;
  };
  MemberDefinition.prototype.createStorePropertyDescriptor = function(value) {
    var pd = this;
    return {
      enumerable: false,
      writable: true,
      configurable: pd.configurable,
      value: value
    };
  };
  MemberDefinition.prototype.createGetMethod = function() {
    var pd = this;
    return {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function(callback, tran) {
        return this.getProperty(pd, callback, tran);
      }
    };
  };
  MemberDefinition.prototype.createSetMethod = function() {
    var pd = this;
    return {
      enumerable: false,
      writable: false,
      configurable: false,
      value: function(value, callback, tran) {
        return this.setProperty(pd, value, callback, tran);
      }
    };
  };
  MemberDefinition.translateDefinition = function(memDef, name, classFunction) {
    var holder = classFunction;
    var memberDefinition;

    if (memDef.type && Container.isTypeRegistered(memDef.type)) {
      holder = Container.resolveType(memDef.type);
      if (typeof holder.translateDefinition === 'function') {
        memberDefinition = holder.translateDefinition.apply(holder, arguments);
        memberDefinition.name = memberDefinition.name || name;
      } else {
        holder = classFunction;
      }
    }


    if (!(memberDefinition instanceof MemberDefinition)) {
      memberDefinition = new MemberDefinition(memberDefinition || memDef, holder);
      memberDefinition.name = name;
    }
    classFunction.resolverThunks = classFunction.resolverThunks || [];
    classFunction.childResolverThunks = classFunction.childResolverThunks || [];


    var t = memberDefinition.type;
    var et = memberDefinition.elementType;

    function addChildThunk(referencedType) {
      if (referencedType && referencedType.isAssignableTo && $data.Entity && referencedType.isAssignableTo($data.Entity)) {
        classFunction.childResolverThunks.push(function() {
          if (referencedType.resolveForwardDeclarations) {
            referencedType.resolveForwardDeclarations();
          }
        });
      }
    }

    addChildThunk(t);
    addChildThunk(et);

    if ("string" === typeof t) {
      if ("@" === t[0]) {
        memberDefinition.type = t.substr(1);
        memberDefinition.dataType = t.substr(1);
      } else {
        //forward declared types get this callback when type is registered
        classFunction.resolverThunks.push(function() {
          var rt = classFunction.container.resolveType(t);
          addChildThunk(rt);
          memberDefinition.type = rt;
          memberDefinition.dataType = rt;
        });
      }
    }

    if (et) {
      if ("string" === typeof et) {
        if ("@" === et[0]) {
          memberDefinition.elementType = et.substr(1);
        } else {
          //forward declared types get this callback when type is registered
          classFunction.resolverThunks.push(function() {
            var rt = classFunction.container.resolveType(et);
            addChildThunk(rt);
            memberDefinition.elementType = rt;
          });

        }
      }
    }


    //if (!classFunction)

    classFunction.resolveForwardDeclarations = function() {
      classFunction.resolveForwardDeclarations = function() {};
      $data.Trace.log("resolving: " + classFunction.fullName);
      this.resolverThunks.forEach(function(thunk) {
        thunk();
      });
      //this.resolverThunks = [];
      this.childResolverThunks.forEach(function(thunk) {
        thunk();
      });
      //this.childResolverThunks = [];
    }

    return memberDefinition;
  };

  MemberDefinition.prototype.toJSON = function() {
    var property = {};
    for (var name in this) {
      if (name !== 'defineBy' && name !== 'storageModel') {
        if ((name === 'type' || name === 'dataType') && (this[name] && typeof this[name] === 'function')) {
          try {
            property[name] = Container.resolveName(this[name]);
          } catch (e) {
            property[name] = this[name];
          }
        } else {
          property[name] = this[name];
        }
      }
    }
    return property;
  }

  $data.MemberDefinition = MemberDefinition;

  var memberDefinitionPrefix = '$';

  function MemberDefinitionCollection() {};
  MemberDefinitionCollection.prototype = {
    clearCache: function() {
      this.arrayCache = undefined;
      this.pubMapPropsCache = undefined;
      this.keyPropsCache = undefined;
      this.propByTypeCache = undefined;
      this.pubMapMethodsCache = undefined;
      this.pubMapPropNamesCache = undefined;
    },
    asArray: function() {
      if (!this.arrayCache) {
        this.arrayCache = [];
        for (var i in this) {
          if (i.indexOf(memberDefinitionPrefix) === 0)
            this.arrayCache.push(this[i]);
        }
      }
      return this.arrayCache;
    },
    getPublicMappedProperties: function() {
      if (!this.pubMapPropsCache) {
        this.pubMapPropsCache = [];
        for (var i in this) {
          if (i.indexOf(memberDefinitionPrefix) === 0 && this[i].kind == 'property' && !this[i].notMapped && this[i].enumerable)
            this.pubMapPropsCache.push(this[i]);
        }
      }
      return this.pubMapPropsCache; // || (this.pubMapPropsCache = this.asArray().filter(function (m) { return m.kind == 'property' && !m.notMapped && m.enumerable; }));
    },
    getPublicMappedPropertyNames: function() {
      if (!this.pubMapPropNamesCache) {
        this.pubMapPropNamesCache = [];
        for (var i in this) {
          if (i.indexOf(memberDefinitionPrefix) === 0 && this[i].kind == 'property' && !this[i].notMapped && this[i].enumerable)
            this.pubMapPropNamesCache.push(this[i].name);
        }
      }
      return this.pubMapPropNamesCache;
    },
    getKeyProperties: function() {
      if (!this.keyPropsCache) {
        this.keyPropsCache = [];
        for (var i in this) {
          if (i.indexOf(memberDefinitionPrefix) === 0 && this[i].kind == 'property' && this[i].key)
            this.keyPropsCache.push(this[i]);
        }
      }
      return this.keyPropsCache;
      //return this.keyPropsCache || (this.keyPropsCache = this.asArray().filter(function (m) { return m.kind == 'property' && m.key; }));
    },
    getPublicMappedMethods: function() {
      if (!this.pubMapMethodsCache) {
        this.pubMapMethodsCache = [];
        for (var i in this) {
          if (i.indexOf(memberDefinitionPrefix) === 0 && this[i].kind == 'method' && this[i].method /* && this.hasOwnProperty(i)*/ )
            this.pubMapMethodsCache.push(this[i]);
        }
      }
      return this.pubMapMethodsCache;
    },
    getPropertyByType: function(type) {
      if (!this.propByTypeCache) {
        this.propByTypeCache = [];
        for (var i in this) {
          if (i.indexOf(memberDefinitionPrefix) === 0 && this[i].dataType == type)
            this.propByTypeCache.push(this[i]);
        }
      }
      return this.propByTypeCache;
      //return this.propByTypeCache || (this.propByTypeCache = this.asArray().filter(function (m) { return m.dataType == type; }));
    },
    getMember: function(name) {
      return this[memberDefinitionPrefix + name];
    },
    setMember: function(value) {
      this[memberDefinitionPrefix + value.name] = value;
    }
  };
  MemberDefinitionCollection.prototype.constructor = MemberDefinitionCollection;
  $data.MemberDefinitionCollection = MemberDefinitionCollection;

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

  //function classToJSON() {
  //    var ret = {};
  //    for (var i in this) {
  //        if (this.hasOwnProperty(i)) {
  //            ret[i] = this[i];
  //        }
  //    }
  //    return ret;
  //}
  //$data.Base.toJSON = classToJSON;

  ClassEngineBase.prototype = {

    //getClass: function (classReference) {
    //},

    //getProperties: function (classFunction) {
    //    return classFunction.propertyDefinitions;
    //},

    define: function(className, baseClass, container, instanceDefinition, classDefinition) {
      /// <signature>
      ///     <summary>Creates a Jaydata type</summary>
      ///     <param name="className" type="String">Name of the class</param>
      ///     <param name="baseClass" type="Function">Basetype of the class</param>
      ///     <param name="interfaces" type="Object" elementType="Function" />
      ///     <param name="instanceDefinition" type="Object">Class definition (properties, methods, etc)</param>
      ///     <param name="classDefinition" type="Object">Class static definition</param>
      ///     <example>
      ///
      ///         var t = new $data.Class.define('Types.A', $data.Base, null, {
      ///             constructor: function(){ },
      ///             func1: function(){ },
      ///             member1: { type: 'string' }
      ///         }, {
      ///             staticFunc1: function() {}
      ///         })
      ///
      ///     </example>
      /// </signature>

      return this.defineEx(className, [{
        type: baseClass
      }], container, instanceDefinition, classDefinition);
    },
    defineEx: function(className, baseClasses, container, instanceDefinition, classDefinition) {
      /// <signature>
      ///     <summary>Creates a Jaydata type</summary>
      ///     <param name="className" type="String">Name of the class</param>
      ///     <param name="baseClasses" type="Array" elementType="Functions">Basetypes of the class. First is a real base, others are mixins</param>
      ///     <param name="interfaces" type="Object" elementType="Function" />
      ///     <param name="instanceDefinition" type="Object">Class definition (properties, methods, etc)</param>
      ///     <param name="classDefinition" type="Object">Class static definition</param>
      ///     <example>
      ///
      ///         var t = new $data.Class.define('Types.A', [$data.Base, $data.Mixin1, $data.Mixin2], null, {
      ///             constructor: function(){ },
      ///             func1: function(){ },
      ///             member1: { type: 'string' }
      ///         }, {
      ///             staticFunc1: function() {}
      ///         })
      ///
      ///     </example>
      /// </signature>
      /// <signature>
      ///     <summary>Creates a Jaydata type</summary>
      ///     <param name="className" type="String">Name of the class</param>
      ///     <param name="baseClasses" type="Array" elementType="Object">Basetypes of the class. First is a real base, others are mixins or propagations</param>
      ///     <param name="interfaces" type="Object" elementType="Function" />
      ///     <param name="instanceDefinition" type="Object">Class definition (properties, methods, etc)</param>
      ///     <param name="classDefinition" type="Object">Class static definition</param>
      ///     <example>
      ///
      ///         var t = new $data.Class.define('Types.A', [
      ///                         { type: $data.Base, params: [1, 'secondParameterValue', new $data.Class.ConstructorParameter(0)] },
      ///                         { type: $data.Mixin1, },
      ///                         { type: $data.Mixin2, },
      ///                         { type: $data.Propagation1, params: [new $data.Class.ConstructorParameter(1)], propagateTo:'Propagation1' },
      ///                         { type: $data.Propagation2, params: ['firstParameterValue'], propagateTo:'Propagation2' }
      ///                     ], null, {
      ///             constructor: function(){ },
      ///             func1: function(){ },
      ///             member1: { type: 'string' }
      ///         }, {
      ///             staticFunc1: function() {}
      ///         })
      ///
      ///     </example>
      /// </signature>

      container = container || $data.Container;

      if (baseClasses.length == 0) {
        baseClasses.push({
          type: $data.Base
        });
      } else if (baseClasses.length > 0 && !baseClasses[0].type) {
        baseClasses[0].type = $data.Base;
      }
      for (var i = 0, l = baseClasses.length; i < l; i++) {
        if (typeof baseClasses[i] === 'function')
          baseClasses[i] = {
            type: baseClasses[i]
          };
      }

      var providedCtor = instanceDefinition ? instanceDefinition.constructor : undefined;

      var classNameParts = className.split('.');
      var shortClassName = classNameParts.splice(classNameParts.length - 1, 1)[0];

      $data.models = $data.models || {}
      var root = container === $data.Container ? $data.models : container;
      root = $data.Container.createOrGetNamespace(classNameParts, root)

      var classFunction = null;
      classFunction = this.classFunctionBuilder(shortClassName, baseClasses, classDefinition, instanceDefinition);
      classFunction.fullName = className;
      classFunction.namespace = classNameParts.join('.'); //classname splitted
      //classFunction.name = shortClassName;
      classFunction.container = container;
      classFunction.container.registerType(className, classFunction);

      this.buildType(classFunction, baseClasses, instanceDefinition, classDefinition);



      if (typeof intellisense !== 'undefined') {
        if (instanceDefinition && instanceDefinition.constructor) {
          intellisense.annotate(classFunction, instanceDefinition.constructor);
        }
      }

      root[shortClassName] = this.classNames[className] = classFunction;

      if(classNameParts[0] == '$data') {
        var _classNameParts = [].concat(classNameParts)
        _classNameParts.shift()
        var _root = $data.Container.createOrGetNamespace(_classNameParts, $data)
        _root[shortClassName] = classFunction
      }
      if(_modelHolder && container == $data.Container){
        var innerNS = $data.Container.createOrGetNamespace(classNameParts, _modelHolder)
        innerNS[shortClassName] = classFunction
      }

      //classFunction.toJSON = classToJSON;
      var baseCount = classFunction.baseTypes.length;
      for (var i = 0; i < baseCount; i++) {
        var b = classFunction.baseTypes[i];
        if ("inheritedTypeProcessor" in b) {
          b.inheritedTypeProcessor(classFunction);
        }
      }
      //classFunction.prototype.constructor = instanceDefinition.constructor;
      //classFunction.constructor = instanceDefinition.constructor;
      //classFunction.toJSON = function () { return classFunction.memberDefinitions.filter( function(md) { return md; };
      return classFunction;
    },
    classFunctionBuilder: function(name, base, classDefinition, instanceDefinition) {
      var body = this.bodyBuilder(base, classDefinition, instanceDefinition);
      return new Function('base', 'classDefinition', 'instanceDefinition', 'name', '$data', 'return function ' + name + ' (){ ' +
        body + ' \n}; ')(base, classDefinition, instanceDefinition, name, $data);
    },
    bodyBuilder: function(bases, classDefinition, instanceDefinition) {
      var mixin = '';
      var body = '';
      var propagation = '';

      for (var i = 0, l = bases.length; i < l; i++) {
        var base = bases[i];
        var index = i;
        if (index == 0) { //ctor func
          if (base && base.type && base.type !== $data.Base && base.type.fullName) {
            body += '    var baseArguments = $data.typeSystem.createCtorParams(arguments, base[' + index + '].params, this); \n';
            body += '    $data.models.' + base.type.fullName + '.apply(this, baseArguments); \n';
          }
        } else {
          if (base && base.type && base.propagateTo) {
            //propagation
            propagation += '    ' + (!propagation ? 'var ' : '' + '') + 'propagationArguments = $data.typeSystem.createCtorParams(arguments, base[' +
              index + '].params, this); \n';
            propagation += '    this["' + base.propagateTo + '"] =  Object.create($data.models.' + base.type.fullName + '.prototype); \n' +
              '    $data.models.' + base.type.fullName + '.apply(this["' + base.propagateTo + '"], propagationArguments); \n';
          } else if (base && base.type && base.type.memberDefinitions && base.type.memberDefinitions.$constructor && !base.propagateTo) {
            //mixin
            mixin += '    $data.models.' + base.type.fullName + '.memberDefinitions.$constructor.method.apply(this); \n';
          }
        }
      }
      if (instanceDefinition && instanceDefinition.constructor != Object)
        body += "    instanceDefinition.constructor.apply(this, arguments); \n";

      return '\n    //mixins \n' + mixin + '\n    //construction \n' + body + '\n    //propagations \n' + propagation;
    },

    buildType: function(classFunction, baseClasses, instanceDefinition, classDefinition) {
      var baseClass = baseClasses[0].type;
      classFunction.inheritsFrom = baseClass;

      if (baseClass) {
        classFunction.prototype = Object.create(baseClass.prototype);
        classFunction.memberDefinitions = Object.create(baseClass.memberDefinitions || new MemberDefinitionCollection());
        classFunction.memberDefinitions.clearCache();

        var staticDefs = baseClass.staticDefinitions;
        if (staticDefs) {
          staticDefs = staticDefs.asArray();
          if (staticDefs) {
            for (var i = 0; i < staticDefs.length; i++) {
              this.buildMember(classFunction, staticDefs[i], undefined, 'staticDefinitions');
            }
          }
        }
        classFunction.baseTypes = baseClass.baseTypes ? [].concat(baseClass.baseTypes) : [];
        for (var i = 0; i < baseClasses.length; i++) {
          classFunction.baseTypes.push(baseClasses[i].type);
        }
        //classFunction.baseTypes = (baseClass.baseTypes || []).concat(baseClasses.map(function (base) { return base.type; }));
        if (!classFunction.isAssignableTo) {
          Object.defineProperty(classFunction, "isAssignableTo", {
            value: function(type) {
              return this === type || this.baseTypes.indexOf(type) >= 0;
            },
            writable: false,
            enumerable: false,
            configurable: false
          });
        }
      }

      var openTypeDefinition = classFunction.staticDefinitions && classFunction.staticDefinitions.getMember('openType');
      if (classDefinition) {
        if(openTypeDefinition) delete classDefinition.openType;
        this.buildStaticMembers(classFunction, classDefinition);

        if (classDefinition.constructor)
          classFunction.classConstructor = classDefinition.constructor;
      }

      if (instanceDefinition) {

        //build open type member
        if (!openTypeDefinition && classDefinition && (typeof classFunction.openType === "string" || classFunction.openType === true) && classFunction.isAssignableTo($data.Entity)) {
          var openTypePropertyName = $data.defaults.openTypeDefaultPropertyName;
          var openTypeDefaultType = Container.resolveType($data.defaults.openTypeDefaultType);
          var openTypeDefaultValue = $data.defaults.openTypeDefaultValue;
          if (typeof classFunction.openType == "string") {
            openTypePropertyName = classFunction.openType;
          }

          var definedOpenTypeMember = classFunction.getMemberDefinition(openTypePropertyName);
          if(definedOpenTypeMember && Container.resolveType(definedOpenTypeMember.type || definedOpenTypeMember.dataType) !== openTypeDefaultType) {
            Guard.raise(new Exception("Type Error", "OpenType default type missmatch"));
          }
          if (!definedOpenTypeMember && instanceDefinition[openTypePropertyName]) {
            var memberType = Container.resolveType(instanceDefinition[openTypePropertyName].type || instanceDefinition[openTypePropertyName].dataType);
            if(memberType !== openTypeDefaultType){
              Guard.raise(new Exception("Type Error", "OpenType default type missmatch"));
            }
          }
          if(!definedOpenTypeMember && !instanceDefinition[openTypePropertyName]){
            var defaultValue = typeof openTypeDefaultValue !== "undefined" ? openTypeDefaultValue : (function() { return {}; });
            instanceDefinition[openTypePropertyName] = { type: openTypeDefaultType, defaultValue:  defaultValue };
          }
        }

        this.buildInstanceMembers(classFunction, instanceDefinition);
      }

      var mixins = [].concat(baseClasses);
      mixins.shift();
      if (Object.keys(mixins).length > 0)
        this.buildInstanceMixins(classFunction, mixins);

      classFunction.__class = true;

      classFunction.prototype.constructor = classFunction;

      Object.defineProperty(classFunction.prototype, "getType", {
        value: function() {
          return classFunction;
        },
        writable: false,
        enumerable: false,
        configurable: false
      });
    },

    addMethod: function(holder, name, method, propagation) {
      if (!propagation || (typeof intellisense !== 'undefined')) {
        holder[name] = method;
      } else {
        holder[name] = function() {
          return method.apply(this[propagation], arguments);
        };
      }
    },

    addProperty: function(holder, name, propertyDescriptor, propagation) {

      //holder[name] = {};

      if (propagation) {
        propertyDescriptor.configurable = true;
        if (propertyDescriptor.get) {
          var origGet = propertyDescriptor.get;
          propertyDescriptor.get = function() {
            if (!this[propagation])
              Guard.raise(new Exception("not inicialized"));
            return origGet.apply(this[propagation], arguments);
          };
        }
        if (propertyDescriptor.set) {
          var origSet = propertyDescriptor.set;
          propertyDescriptor.set = function() {
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

    buildMethod: function(classFunction, memberDefinition, propagation) {
      ///<param name="classFunction" type="Function">The object that will receive member</param>
      ///<param name="memberDefinition" type="MemberDefinition">the newly added member</param>
      var holder = memberDefinition.classMember ? classFunction : classFunction.prototype;
      this.addMethod(holder, memberDefinition.name, memberDefinition.method, propagation);
    },

    buildProperty: function(classFunction, memberDefinition, propagation) {
      ///<param name="classFunction" type="Function">The object that will receive member</param>
      ///<param name="memberDefinition" type="MemberDefinition">the newly added member</param>
      var holder = memberDefinition.classMember ? classFunction : classFunction.prototype;
      var pd = memberDefinition.createPropertyDescriptor(classFunction);
      this.addProperty(holder, memberDefinition.name, pd, propagation);

      //if lazyload TODO
      if (!memberDefinition.classMember && classFunction.__setPropertyfunctions == true && memberDefinition.withoutGetSetMethod !== true &&
        !('get_' + memberDefinition.name in holder || 'set_' + memberDefinition.name in holder)) {
        var pdGetMethod = memberDefinition.createGetMethod();
        this.addProperty(holder, 'get_' + memberDefinition.name, pdGetMethod, propagation);

        var pdSetMethod = memberDefinition.createSetMethod();
        this.addProperty(holder, 'set_' + memberDefinition.name, pdSetMethod, propagation);
      }
    },


    buildMember: function(classFunction, memberDefinition, propagation, memberCollectionName) {
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
        default:
          Guard.raise("Unknown member type: " + memberDefinition.kind + "," + memberDefinition.name);
      }
    },

    buildStaticMembers: function(classFunction, memberListDefinition) {
      ///<param name="classFunction" type="Object">The class constructor that will be extended</param>
      ///<param name="memberListDefinition" type="Object"></param>
      var t = this;
      for (var item in memberListDefinition) {
        if (memberListDefinition.hasOwnProperty(item)) {
          var memberDefinition = MemberDefinition.translateDefinition(memberListDefinition[item], item, classFunction);
          memberDefinition.classMember = true;
          t.buildMember(classFunction, memberDefinition, undefined, 'staticDefinitions');
        }
      }
    },

    buildInstanceMembers: function(classFunction, memberListDefinition) {
      ///<param name="classFunction" type="Function">The class constructor whose prototype will be extended</param>
      ///<param name="memberListDefinition" type="Object"></param>
      ///pinning t outside of the closure seems actually faster then passing in the this  and referencing
      var t = this;
      for (var item in memberListDefinition) {
        if (memberListDefinition.hasOwnProperty(item)) {
          var memberDefinition = MemberDefinition.translateDefinition(memberListDefinition[item], item, classFunction);
          t.buildMember(classFunction, memberDefinition, undefined, 'memberDefinitions');
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

      Object.keys(sourceType.prototype).forEach(function(item, i, src) {
        if (item !== 'constructor' && item !== 'toString') {
          il("copying item:" + item);
          targetType.prototype[item] = sourceType[item];
        }
      });
    },

    buildInstanceMixins: function(classFunction, mixinList) {
      ///<param name="classFunction" type="Function">The class constructor whose prototype will be extended</param>
      ///<param name="mixinList" type="Array"></param>

      classFunction.mixins = classFunction.mixins || [];
      classFunction.propagations = classFunction.propagations || [];

      for (var i = 0; i < mixinList.length; i++) {
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
    buildInstanceMixin: function(classFunction, typeObj) {
      ///<param name="classFunction" type="Function">The class constructor whose prototype will be extended</param>
      ///<param name="typeObj" type="Object"></param>

      var memberDefs = typeObj.type.memberDefinitions.asArray();
      for (var i = 0, l = memberDefs.length; i < l; i++) {
        var itemName = memberDefs[i].name;
        if (itemName !== 'constructor' && !classFunction.memberDefinitions.getMember(itemName)) {
          this.buildMember(classFunction, memberDefs[i]);
        }
      }

      if (typeObj.type.staticDefinitions) {
        var staticDefs = typeObj.type.staticDefinitions.asArray();
        for (var i = 0, l = staticDefs.length; i < l; i++) {
          var itemName = staticDefs[i].name;
          if (itemName !== 'constructor' && !classFunction.memberDefinitions.getMember(itemName)) {
            this.buildMember(classFunction, staticDefs[i], undefined, 'staticDefinitions');
          }
        }
      }
    },
    buildInstancePropagation: function(classFunction, typeObj) {
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
  var Class
  $data.Class = Class = new ClassEngineBase();


  $data.ContainerClass = ContainerCtor;

  var c;
  $data.Container = c = ContainerInstance

  $data.createContainer = function() {
    return new ContainerCtor($data.Container);
  }

  var storeProperty = function(memberDefinition, value) {
    var backingFieldName = "_" + memberDefinition.name;
    if (!this[backingFieldName]) {
      Object.defineProperty(this, backingFieldName, memberDefinition.createStorePropertyDescriptor(value));
    } else {
      this[backingFieldName] = value;
    }
  };
  var retrieveProperty = function(memberDefinition) {
    var backingFieldName = "_" + memberDefinition.name;
    return this[backingFieldName];
  };


  $data.Class.define('$data.Base', function Base() {}, null, {
    storeProperty: storeProperty,
    retrieveProperty: retrieveProperty,
    setProperty: function(memberDefinition, value, callback) {
      this[memberDefinition.name] = value;
      callback();
    },
    getProperty: function(memberDefinition, callback) {
      callback.apply(this, [this[memberDefinition.name]]);
    }
  }, {
    create: function() {
      return Container.createInstance(this, arguments);
    },
    extend: function(name, container, instanceDefinition, classDefinition) {
      if (container && !(container instanceof ContainerCtor)) {
        classDefinition = instanceDefinition;
        instanceDefinition = container;
        container = undefined;
      }
      return $data.Class.define(name, this, container, instanceDefinition, classDefinition);
    },
    getMemberDefinition: function(name) {
      return this.memberDefinitions.getMember(name);
    },
    addProperty: function(name, getterOrType, setterOrGetter, setter) {
      var _getter = getterOrType;
      var _setter = setterOrGetter;
      var _type;
      if (typeof _getter === 'string') {
        _type = getterOrType;
        _getter = setterOrGetter;
        _setter = setter;
      }

      var propDef = {
        notMapped: true,
        storeOnObject: true,
        get: typeof _getter === 'function' ? _getter : function() {},
        set: typeof _setter === 'function' ? _setter : function() {},
        type: _type
      };

      var memberDefinition = MemberDefinition.translateDefinition(propDef, name, this);
      $data.Class.buildMember(this, memberDefinition);

      this.memberDefinitions.clearCache();

      return this;
    },
    addMember: function(name, definition, isClassMember) {
      var memberDefinition = MemberDefinition.translateDefinition(definition, name, this);

      if (isClassMember) {
        memberDefinition.classMember = true;
        $data.Class.buildMember(this, memberDefinition, undefined, 'staticDefinitions');
        this.staticDefinitions.clearCache();
      } else {
        $data.Class.buildMember(this, memberDefinition);
        this.memberDefinitions.clearCache();
      }
      return this;
    },
    describeField: function(name, definition) {
      var memDef = this.memberDefinitions.getMember(name);
      if (!memDef) {
        this.addMember(name, definition);
      } else {
        Guard.raise(new Exception("Field '" + name + "' already defined!", "Invalid operation"));
      }
      return this;
    },
    storeProperty: storeProperty,
    retrieveProperty: retrieveProperty,
    'from$data.Object': function(value) {
      return value;
    }
  });


  //override after typeSystem initialized


  $data.Class.ConstructorParameter = $data.Class.define('ConstructorParameter', null, null, {
    constructor: function(paramIndex) {
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



})($data);

$data.defaultErrorCallback = function() {
  //console.log('DEFAULT ERROR CALLBACK:');
  /*if (console.dir)
      console.dir(arguments);
  else
      console.log(arguments);*/
  if (arguments.length > 0 && arguments[arguments.length - 1] && typeof arguments[arguments.length - 1].reject === 'function') {
    (console.error || console.log).call(console, arguments[0]);
    arguments[arguments.length - 1].reject.apply(arguments[arguments.length - 1], arguments);
  } else {
    if (arguments[0] instanceof Error) {
      Guard.raise(arguments[0]);
    } else {
      Guard.raise(new Exception("DEFAULT ERROR CALLBACK!", "DefaultError", arguments));
    }
  }
};
$data.defaultSuccessCallback = function() { /*console.log('DEFAULT SUCCES CALLBACK');*/ };
$data.defaultNotifyCallback = function() { /*console.log('DEFAULT NOTIFY CALLBACK');*/ };

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
  extend: function(target) {
    /// <summary>
    /// Extends an object with properties of additional parameters.
    /// </summary>
    /// <signature>
    /// <param name="target" type="Object">Object that will be extended.</param>
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
      for (var key in obj) {
        target[key] = obj[key];
      }
    }
    return target;
  },
  createCallbackSetting: function(callBack, defaultSetting) {
    var setting = {
      success: $data.defaultSuccessCallback,
      error: $data.defaultErrorCallback,
      notify: $data.defaultNotifyCallback
    };

    if (defaultSetting != undefined && defaultSetting != null) {
      setting = defaultSetting;
    }

    var result;
    if (callBack == null || callBack == undefined) {
      result = setting;

    } else if (typeof callBack == 'function') {
      result = this.extend(setting, {
        success: callBack
      });

    } else {
      result = this.extend(setting, callBack);
    }

    function wrapCode(fn) {
      var t = this;

      function r() {
        fn.apply(t, arguments);
        fn = function() {}
      }
      return r;
    }

    if (typeof result.error === 'function')
      result.error = wrapCode(result.error);

    return result;
  },
  createCtorParams: function(source, indexes, thisObj) {
    ///<param name="source" type="Array" />Paramerter array
    ///<param name="indexes" type="Array" />
    ///<param name="thisObj" type="Object" />
    if (indexes) {
      var paramArray = [];
      for (var i = 0, l = indexes.length; i < l; i++) {
        var item = i;
        if (indexes[item] instanceof $data.Class.ConstructorParameter)
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
  writePropertyValues: function(obj) {
    if (obj && obj.getType && obj.getType().memberDefinitions) {
      this.writeProperties(obj, obj.getType().memberDefinitions.asArray().filter(
        function(md) {
          return (md.kind == "property" || md.kind == "navProperty" || md.kind == "complexProperty") && !md.prototypeProperty;
        }
      ));
    }
  },
  writeProperties: function(obj, members) {
    var defines = {};
    for (var i = 0, l = members.length; i < l; i++) {
      var memDef = members[i];
      defines[memDef.name] = memDef.createPropertyDescriptor(null, memDef.value);
    }

    Object.defineProperties(obj, defines);

  },
  writeProperty: function(obj, member, value) {
    var memDef = typeof member === 'string' ? obj.getType().memberDefinitions.getMember(member) : member;
    if (memDef) {
      var propDef = memDef.createPropertyDescriptor(null, value);
      //////OPTIMIZATION
      Object.defineProperty(obj, memDef.name, propDef);
    }
  }
};

$data.debug = function() {
  (console.debug || console.log).apply(console, arguments);
};

$data.debugWith = function() {
  var cArgs = arguments;
  return function(r) {
    (console.debug || console.log).apply(console, cArgs);
    if ((typeof Error !== 'undefined' && r instanceof Error) ||
      (typeof Exception !== 'undefined' && r instanceof Exception)) {
      (console.error || console.log).apply(console, arguments);
    } else {
      (console.debug || console.log).apply(console, arguments);
    }
  }
};

$data.fdebug = {
  success: $data.debugWith('success'),
  error: $data.debugWith('error')
};


export var $C = function() {
  $data.Class.define.apply($data.Class, arguments);
}
export var Container = $data.Container
export var MemberDefinition = $data.MemberDefinition
export default $data
