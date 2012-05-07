(function ObjectMethodsForPreHTML5Browsers() {

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

    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (handler) {
            for (var i = 0; i < this.length; i++) {
                handler(this[i], i);
            }
        };
    }
})();