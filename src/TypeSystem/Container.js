import $data from './initializeJayData.js';
import Exception from './Exception.js';
import { Guard } from './utils.js';
import { StringFunctions } from './Extensions.js'


var Container = new ContainerCtor()

export var ContainerInstance = Container

export function ContainerCtor(parentContainer) {
    var parent = parentContainer;
    if (parent) {
      parent.addChildContainer(this);
    }

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

    var IoC = function(type, parameters) {
      var t = self.resolveType(type);
      var inst = Object.create(t.prototype);
      t.apply(inst, parameters);
      return inst;
    };

    var pendingResolutions = {};
    this.pendingResolutions = pendingResolutions;

    function addPendingResolution(name, onResolved) {
      pendingResolutions[name] = pendingResolutions[name] || [];
      pendingResolutions[name].push(onResolved);
    }

    this.addChildContainer = function(container) {
      //children.push(container);
    }

    this.createInstance = function(type, parameters) {
      return IoC(type, parameters);
    };

    this.mapType = function(aliasTypeOrName, realTypeOrName) {
        Guard.requireValue("aliasType", aliasTypeOrName);
        Guard.requireValue("realType", realTypeOrName);
        var aliasT = this.getType(aliasTypeOrName);
        var realT = this.getType(realTypeOrName);
        var aliasPos = classTypes.indexOf(aliasT);
        var realPos = classTypes.indexOf(realT);
        mappedTo[aliasPos] = realPos;
      },

      //this.resolve = function (type, parameters) {
      //    var classFunction = this.resolveType(type, parameters);
      //    return new classFunction(parameters);
      //};



      this.isPrimitiveType = function(type) {
        var t = this.resolveType(type);

        switch (true) {
          case t === Number:
          case t === String:
          case t === Date:
          case t === Boolean:
          case t === Array:
          case t === Object:

          case t === $data.Number:
          case t === $data.Integer:
          case t === $data.Date:
          case t === $data.String:
          case t === $data.Boolean:
          case t === $data.Array:
          case t === $data.Object:
          case t === $data.Guid:

          case t === $data.Byte:
          case t === $data.SByte:
          case t === $data.Decimal:
          case t === $data.Float:
          case t === $data.Int16:
          case t === $data.Int32:
          case t === $data.Int64:
          case t === $data.DateTimeOffset:
          case t === $data.Time:
          case t === $data.Duration:

          case t === $data.SimpleBase:
          case t === $data.Geospatial:
          case t === $data.GeographyBase:
          case t === $data.GeographyPoint:
          case t === $data.GeographyLineString:
          case t === $data.GeographyPolygon:
          case t === $data.GeographyMultiPoint:
          case t === $data.GeographyMultiLineString:
          case t === $data.GeographyMultiPolygon:
          case t === $data.GeographyCollection:
          case t === $data.GeometryBase:
          case t === $data.GeometryPoint:
          case t === $data.GeometryLineString:
          case t === $data.GeometryPolygon:
          case t === $data.GeometryMultiPoint:
          case t === $data.GeometryMultiLineString:
          case t === $data.GeometryMultiPolygon:
          case t === $data.GeometryCollection:

            return true;
          default:
            return false;
        }
      };


    this.resolveName = function(type) {
      var t = this.resolveType(type);
      var tPos = classTypes.indexOf(t);
      return consolidatedClassNames[tPos];
    };

    this.resolveType = function(typeOrName, onResolved) {
      var t = typeOrName;
      t = this.getType(t, onResolved ? true : false, onResolved);
      var posT = classTypes.indexOf(t);
      return typeof mappedTo[posT] === 'undefined' ? t : classTypes[mappedTo[posT]];
    };



    this.getType = function(typeOrName, doNotThrow, onResolved) {
      Guard.requireValue("typeOrName", typeOrName);
      if (typeof typeOrName === 'function') {
        return typeOrName;
      };

      if (!(typeOrName in classNames)) {
        if (parent) {
          var tp = parent.getType(typeOrName, true);
          if (tp) return tp;
        }
        if (onResolved) {
          addPendingResolution(typeOrName, onResolved);
          return;
        } else if (doNotThrow) {
          return undefined;
        } else {
          Guard.raise(new Exception("Unable to resolve type:" + typeOrName));
        }
      };
      var result = classTypes[classNames[typeOrName]];
      if (onResolved) {
        onResolved(result);
      }
      return result;
    };

    this.getName = function(typeOrName) {
      var t = this.getType(typeOrName);
      var tPos = classTypes.indexOf(t);
      if (tPos == -1)
        Guard.raise("unknown type to request name for: " + typeOrName);
      return consolidatedClassNames[tPos];
    };

    this.getTypes = function() {
      var keys = Object.keys(classNames);
      var ret = [];
      for (var i = 0; i < keys.length; i++) {
        var className = keys[i];
        ret.push({
          name: className,
          type: classTypes[classNames[className]],
          toString: function() {
            return this.name;
          }
        });
      }
      return ret;
    };

    //this.getTypeName( in type);
    //this.resolveType()
    //this.inferTypeFromValue = function (value) {

    this.getTypeName = function(value) {
      //TODO refactor
      switch (typeof value) {
        case 'object':
          if (value == null) return '$data.Object';
          if (value instanceof Array) return '$data.Array';
          if (value.getType) return value.getType().fullName;
          if (value instanceof Date) return '$data.Date';
          if (value instanceof $data.Guid) return '$data.Guid';
          if (value instanceof $data.DateTimeOffset) return '$data.DateTimeOffset';
          if (value instanceof $data.GeographyPoint) return '$data.GeographyPoint';
          if (value instanceof $data.GeographyLineString) return '$data.GeographyLineString';
          if (value instanceof $data.GeographyPolygon) return '$data.GeographyPolygon';
          if (value instanceof $data.GeographyMultiPoint) return '$data.GeographyMultiPoint';
          if (value instanceof $data.GeographyMultiLineString) return '$data.GeographyMultiLineString';
          if (value instanceof $data.GeographyMultiPolygon) return '$data.GeographyMultiPolygon';
          if (value instanceof $data.GeographyCollection) return '$data.GeographyCollection';
          if (value instanceof $data.GeographyBase) return '$data.GeographyBase';
          if (value instanceof $data.GeometryPoint) return '$data.GeometryPoint';
          if (value instanceof $data.GeometryLineString) return '$data.GeometryLineString';
          if (value instanceof $data.GeometryPolygon) return '$data.GeometryPolygon';
          if (value instanceof $data.GeometryMultiPoint) return '$data.GeometryMultiPoint';
          if (value instanceof $data.GeometryMultiLineString) return '$data.GeometryMultiLineString';
          if (value instanceof $data.GeometryMultiPolygon) return '$data.GeometryMultiPolygon';
          if (value instanceof $data.GeometryCollection) return '$data.GeometryCollection';
          if (value instanceof $data.GeometryBase) return '$data.GeometryBase';
          if (value instanceof $data.Geospatial) return '$data.Geospatial';
          if (value instanceof $data.SimpleBase) return '$data.SimpleBase';
          if (typeof value.toHexString === 'function') return '$data.ObjectID';
          //if(value instanceof "number") return
        default:
          return typeof value;
      }
    };

    this.isTypeRegistered = function(typeOrName) {
      if (typeof typeOrName === 'function') {
        return classTypes.indexOf(typeOrName) > -1;
      } else {
        return typeOrName in classNames;
      }
    };

    this.unregisterType = function(type) {
      Guard.raise("Unimplemented");
    };



    this.getDefault = function(typeOrName) {
      var t = this.resolveType(typeOrName);
      switch (t) {
        case $data.Number:
          return 0.0;
        case $data.Float:
          return 0.0;
        case $data.Decimal:
          return '0.0';
        case $data.Integer:
          return 0;
        case $data.Int16:
          return 0;
        case $data.Int32:
          return 0;
        case $data.Int64:
          return '0';
        case $data.Byte:
          return 0;
        case $data.SByte:
          return 0;
        case $data.String:
          return null;
        case $data.Boolean:
          return false;
        default:
          return null;
      }
    };

    //name array ['', '', '']
    this.getIndex = function(typeOrName) {
      var t = this.resolveType(typeOrName);
      return classTypes.indexOf(t);
    }

    this.resolveByIndex = function(index) {
      return classTypes[index];
    }

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

      var namesArray = [];
      if (typeof nameOrNamesArray === 'string') {
        var tmp = [];
        tmp.push(nameOrNamesArray);
        namesArray = tmp;
      } else {
        namesArray = nameOrNamesArray;
      }

      for (var i = 0; i < namesArray.length; i++) {
        var parts = namesArray[i].split('.');
        var item = {};
        item.shortName = parts[parts.length - 1];
        item.fullName = namesArray[i];
        namesArray[i] = item;
      }

      //if (type.


      var creatorFnc = function() {
        return IoC(type, arguments);
      };

      if (typeof intellisense !== 'undefined') {
        intellisense.annotate(creatorFnc, type);
      }

      for (var i = 0, l = namesArray.length; i < l; i++) {
        var item = namesArray[i];
        if (!(("create" + item.shortName) in self)) {
          if (typeof factoryFunc === 'function') {
            self["create" + item.shortName] = factoryFunc;
          } else {
            self["create" + item.shortName] = creatorFnc;
          }
        }

        var typePos = classTypes.indexOf(type);
        if (typePos == -1) {
          //new type
          typePos = classTypes.push(type) - 1;
          var fn = item.fullName;
          consolidatedClassNames[typePos] = item.fullName;
        };

        classNames[item.fullName] = typePos;

        var pending = pendingResolutions[item.fullName] || [];
        if (pending.length > 0) {
          pending.forEach(function(t) {
            t(type);
          });
          pendingResolutions[item.fullName] = [];
        }
      }
      if (parent) {
        parent.registerType.apply(parent, arguments);
      }
      if (!type.name) {
        type.name = namesArray[0].shortName;
      }
    };


    var _converters = {
      from: {},
      to: {}
    };
    this.converters = _converters;

    this.convertTo = function(value, tType, eType /*if Array*/ , options) {
      Guard.requireValue("typeOrName", tType);

      if (Object.isNullOrUndefined(value))
        return value;

      var sourceTypeName = Container.getTypeName(value);
      var sourceType = Container.resolveType(sourceTypeName);
      var sourceTypeName = Container.resolveName(sourceType);
      var targetType = Container.resolveType(tType);
      var targetTypeName = Container.resolveName(targetType);

      var result;
      try {
        if (typeof targetType['from' + sourceTypeName] === 'function') {
          // target from
          result = targetType['from' + sourceTypeName].apply(targetType, arguments);

        } else if (typeof sourceType['to' + targetTypeName] === 'function') {
          // source to
          result = sourceType['to' + targetTypeName].apply(sourceType, arguments);

        } else if (_converters.to[targetTypeName] && _converters.to[targetTypeName][sourceTypeName]) {
          // target from source
          result = _converters.to[targetTypeName][sourceTypeName].apply(_converters, arguments);

        } else if (_converters.from[sourceTypeName] && _converters.from[sourceTypeName][targetTypeName]) {
          // source to target
          result = _converters.from[sourceTypeName][targetTypeName].apply(_converters, arguments);

        } else if (targetTypeName === sourceTypeName || value instanceof targetType) {
          result = value;

        } else if (_converters.to[targetTypeName] && _converters.to[targetTypeName]['default']) {
          // target from anything
          result = _converters.to[targetTypeName]['default'].apply(_converters, arguments);

        } else {
          throw "converter not found";
        }
      } catch (e) {
        Guard.raise(new Exception("Value '" + sourceTypeName + "' not convertable to '" + targetTypeName + "'", 'TypeError', value));
      }

      if (targetType === $data.Array && eType && Array.isArray(result)) {
        for (var i = 0; i < result.length; i++) {
          result[i] = this.convertTo.call(this, result[i], eType, undefined, options);
        }
      }

      return result;
    };
    this.registerConverter = function(target, sourceOrToConverters, toConverterOrFromConverters, fromConverter) {
      //registerConverter($data.Guid, { $data.String: fn, int: fn }, { string: fn, int:fn })
      //registerConverter($data.Guid, $data.String, fn, fn);

      var targetName = Container.resolveName(target);
      if (Container.isTypeRegistered(sourceOrToConverters)) {
        //isSource
        _converters.to[targetName] = _converters.to[targetName] || {};
        _converters.from[targetName] = _converters.from[targetName] || {};

        var sourceName = Container.resolveName(sourceOrToConverters);

        if (toConverterOrFromConverters)
          _converters.to[targetName][sourceName] = toConverterOrFromConverters;
        if (fromConverter)
          _converters.from[targetName][sourceName] = fromConverter;

      } else {
        // converterGroup

        //fromConverters
        if (_converters.to[targetName]) {
          _converters.to[targetName] = $data.typeSystem.extend(_converters.to[targetName], sourceOrToConverters);
        } else {
          _converters.to[targetName] = sourceOrToConverters;
        }

        //toConverters
        if (_converters.from[targetName]) {
          _converters.from[targetName] = $data.typeSystem.extend(_converters.from[targetName], toConverterOrFromConverters);
        } else {
          _converters.from[targetName] = toConverterOrFromConverters;
        }
      }
    };

    this.createOrGetNamespace = function(parts, root) {
      for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (!root[part]) {
          var ns = {};
          ns.__namespace = true;
          root[part] = ns;
        }
        root = root[part];
      }
      return root;
    };
  }
  
