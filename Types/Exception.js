Exception = function(message, name, data) {
    Error.call(this);
	if (Error.captureStackTrace)
	    Error.captureStackTrace(this, this.constructor);
    
    this.name = name || "Exception";
    this.message = message;
    this.data = data;

    //this.toString = function() { return JSON.stringify(this); };

}

Exception.prototype.__proto__ = Error.prototype;

Exception.prototype._getStackTrace = function () {
    var callstack = [];
    var isCallstackPopulated = false;
	// unreachable code
    //return;
    /*try {
        i.dont.exist += 0;
    }
    catch (e) {
        if (e.stack) { // Firefox, Chrome
            var lines = e.stack.split('\n');
            for (var i = 0, len = lines.length; i < len; i++) {
                //if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                if (lines[i].indexOf(" at ") >= 0)
                    callstack.push(lines[i]);
            }
            //Remove call to printStackTrace()
            callstack.shift();
            //TODO: Remove call to new Exception( chain
            //callstack.shift();
            isCallstackPopulated = true;
        }
        else if (window.opera && e.message) { //Opera
            var lines = e.message.split('\n');
            for (var i = 0, len = lines.length; i < len; i++) {
                if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                    var entry = lines[i];
                    //Append next line also since it has the file info
                    if (lines[i + 1]) {
                        entry += ' at ' + lines[i + 1];
                        i++;
                    }
                    callstack.push(entry);
                }
            }
            //Remove call to printStackTrace()
            callstack.shift();
            //TODO: Remove call to new Exception( chain
            //callstack.shift();
            isCallstackPopulated = true;
        }
    }

    //if (!isCallstackPopulated) { //IE and Safari
    //    var currentFunction = arguments.callee.caller;
    //    while (currentFunction) {
    //        var fn = currentFunction.toString();
    //        var fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf('(')) || 'anonymous';
    //        callstack.push(fname);
    //        if (currentFunction == currentFunction.caller) {
    //            Guard.raise("Infinite loop");
    //        }
    //        currentFunction = currentFunction.caller;
    //    }
    //}
    return callstack.join("\n\r");	 */
};
