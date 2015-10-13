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

    if (!String.prototype.trimLeft) {
        String.prototype.trimLeft = function () {
            return this.replace(/^\s+/, "");
        }
    }

    if (!String.prototype.trimRight) {
        String.prototype.trimRight = function () {
            return this.replace(/\s+$/, "");
        }
    }

    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            if (typeof this !== "function") {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () { },
                fBound = function () {
                    return fToBind.apply(this instanceof fNOP && oThis
                                           ? this
                                           : oThis,
                                         aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }
    
    if (typeof Uint8Array == 'undefined'){
        Uint8Array = function(v){
            if (v instanceof Uint8Array) return v;
            var self = this;
            var buffer = Array.isArray(v) ? v : new Array(v);
            this.length = buffer.length;
            this.byteLength = this.length;
            this.byteOffset = 0;
            this.buffer = { byteLength: self.length };
            var getter = function(index){
                return buffer[index];
            };
            var setter = function(index, value){
                buffer[index] = (value | 0) & 0xff;
            };
            var makeAccessor = function(i){
                buffer[i] = buffer[i] || 0;
                Object.defineProperty(self, i, {
                    enumerable: true,
                    configurable: false,
                    get: function(){
                        if (isNaN(+i) || ((i | 0) < 0 || (i | 0) >= self.length)){
                            try{
                                if (typeof document != 'undefined') document.createTextNode("").splitText(1);
                                return new RangeError("INDEX_SIZE_ERR");
                            }catch(e){
                                return e;
                            }
                        }
                        return getter(i);
                    },
                    set: function(v){
                        if (isNaN(+i) || ((i | 0) < 0 || (i | 0) >= self.length)){
                            try{
                                if (typeof document != 'undefined') document.createTextNode("").splitText(1);
                                return new RangeError("INDEX_SIZE_ERR");
                            }catch(e){
                                return e;
                            }
                        }
                        setter(i | 0, v);
                    }
                });
            };
            for (var i = 0; i < self.length; i++){
                makeAccessor(i);
            }
        };
    }

})();
