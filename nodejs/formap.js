(function(){
var connect = require('connect');
var app = require('connect')();

var buf = new ArrayBuffer(100000 * 4);
var initA = new Uint32Array(buf);
for(var i = 0; i < 100000; i++) {
    initA[i] = i;
}

Array.prototype.customMap = function(callback, thisArg) {  
  
    var T, A, k;  
  
    if (this == null) {  
      throw new TypeError(" this is null or not defined");  
    }  
  
    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.  
    var O = Object(this);  
  
    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".  
    // 3. Let len be ToUint32(lenValue).  
    var len = O.length >>> 0;  
  
    // 4. If IsCallable(callback) is false, throw a TypeError exception.  
    // See: http://es5.github.com/#x9.11  
    if ({}.toString.call(callback) != "[object Function]") {  
      throw new TypeError(callback + " is not a function");  
    }  
  
    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.  
    if (thisArg) {  
      T = thisArg;  
    }  
  
    // 6. Let A be a new array created as if by the expression new Array(len) where Array is  
    // the standard built-in constructor with that name and len is the value of len.  
    A = new Array(len);  
  
    // 7. Let k be 0  
    k = 0;  
  
    // 8. Repeat, while k < len  
    while(k < len) {  
  
      var kValue, mappedValue;  
  
      // a. Let Pk be ToString(k).  
      //   This is implicit for LHS operands of the in operator  
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.  
      //   This step can be combined with c  
      // c. If kPresent is true, then  
      if (k in O) {  
  
        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.  
        kValue = O[ k ];  
  
        // ii. Let mappedValue be the result of calling the Call internal method of callback  
        // with T as the this value and argument list containing kValue, k, and O.  
        mappedValue = callback.call(T, kValue, k, O);  
  
        // iii. Call the DefineOwnProperty internal method of A with arguments  
        // Pk, Property Descriptor {Value: mappedValue, Writable: true, Enumerable: true, Configurable: true},  
        // and false.  
  
        // In browsers that support Object.defineProperty, use the following:  
        // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });  
  
        // For best browser support, use the following:  
        A[ k ] = mappedValue;  
      }  
      // d. Increase k by 1.  
      k++;  
    }  
  
    // 9. return A  
    return A;  
  };     
  
var buf2 = new ArrayBuffer(100000 * 4);
var result = new Uint32Array(buf2);
var fn = (function(item) {
    result[item] = item;
});

app.use("/foreach", function(req, res) {
    result.length = 0;
    initA.forEach(fn);
    res.end(result.length.toString());
});

app.use("/map", function(req, res) {
    var result = initA.map(function(item) { return item;} );
    res.end(result.length.toString());
});

app.use("/custommap", function(req, res) {
    var result = initA.customMap(function(item) { return item;} );
    res.end(result.length.toString());
});

app.use("/for", function(req, res) {
    result.length = 0;
    /*function pusher(i) {
        result.push(i);
    };*/
    for(var i = 0, l = initA.length; i < l; i++) {
        result[i] = i;
        //pusher(i);
    }
    res.end(result.length.toString());
});

app.listen(3000);
})();
