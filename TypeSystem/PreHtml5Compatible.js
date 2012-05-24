(function ObjectMethodsForPreHTML5Browsers() {

	if (!Object.getOwnPropertyNames){
		Object.getOwnPropertyNames = function(o){
			var names = [];

			for (var i in o){
				if (o.hasOwnProperty(i)) names.push(i);
			}

			return names;
		};
	}

    if (!Object.create) {
        Object.create = function (o) {
            if (arguments.length > 1) {
                Guard.raise(new Error('Object.create implementation only accepts the first parameter.'));
            }
            function F() { }
            F.prototype = o;
            return new F();
        };
    }

    if (!Object.keys) {
        var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = ['toString',
                    'toLocaleString',
                    'valueOf',
                    'hasOwnProperty',
                    'isPrototypeOf',
                    'propertyIsEnumerable',
                    'constructor'],
        dontEnumsLength = dontEnums.length;

        Object.keys = function (obj) {

            ///Refactor to Assert.IsObjectOrFunction
            if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) Guard.raise(new TypeError('Object.keys called on non-object'));

            var result = [];

            for (var prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (var i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }

            return result;
        };
    }

    if (!Object.defineProperty) {
        Object.defineProperty = function (obj, propName, propDef) {
            obj[propName] = propDef.value || {};
        };
    }

    if (!Object.defineProperties) {
        Object.defineProperties = function (obj, defines) {
            for (var i in defines) {
                if(defines.hasOwnProperty(i))
                    obj[i] = defines[i].value || {};
            }
        };
    }

    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (handler, thisArg) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (thisArg) { handler.call(thisArg, this[i], i, this); }
                else { handler(this[i], i, this); };
            };
        };
    };

    if (!Array.prototype.filter) {
        Array.prototype.filter = function (handler, thisArg) {
            var result = [];
            for (var i = 0, l = this.length; i < l; i++) {
                var r = thisArg ?
                    handler.call(thisArg, this[i], i, this) :
                    handler(this[i], i, this);
                if (r === true) {
                    result.push(this[i]);
                }
            }
            return result;
        };
    }

    if (!Array.prototype.map) {
        Array.prototype.map = function (handler, thisArg) {
            var result = [];
            for (var i = 0, l = this.length; i < l; i++) {
                var r = thisArg ?
                    handler.call(thisArg, this[i], i, this) :
                    handler(this[i], i, this);
                result.push(r);
            }
            return result;
        };
    }

    if (!Array.prototype.some) {
        Array.prototype.some = function (handler, thisArg) {
            for (var i = 0, l = this.length; i < l; i++) {
                var r = thisArg ?
                    handler.call(thisArg, this[i], i, this) :
                    handler(this[i], i, this);
                if (r) { return true; }

            }
            return false;
        };
    }

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (item, from) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (this[i] === item) {
                    return i;
                };
            };
            return -1;
        };
    }



})();