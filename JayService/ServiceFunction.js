//region ServiceFunction
/**
 * Provides a tool to annotate JavaScript functions to be exposed as serviceFunctions.
 */
function serviceFunctionPrototype() {

}

/**
 * Signifies the presence of a required input parameter
 * @param {string} name
 * @param {type=} [type='Object']
 * @return {serviceFunctionPrototype}
 */

serviceFunctionPrototype.prototype.param = function(name, type){

}

/**
 * Signifies the presence of an optional input parameter
 * @param {string} name
 * @param {type=} [type='Object']
 * @return {serviceFunctionPrototype}
 */

serviceFunctionPrototype.prototype.optionalParam = function(name, type){

}

/**
 * Indicates the data type of the function result
 * @param {type=} [type='Object']
 * @return {serviceFunctionPrototype}
 */

serviceFunctionPrototype.prototype.returns = function(type){

}

/**
 * Indicates the data type of the function result
 * @param {type=} [type='Object']
 * @return {serviceFunctionPrototype}
 */

serviceFunctionPrototype.prototype.returnsArrayOf = function(type){

}

/**
 * Indicates the data type of the function result
 * @param {type=} [type='Object']
 * @return {serviceFunctionPrototype}
 */

serviceFunctionPrototype.prototype.returnsCollectionOf = function(type){

}

/**
 *
 * @param {Function=} [fn]
 * @return {serviceFunctionPrototype}
 */

function serviceFunction(fn) {


    var f = fn || function(fn) {
        var keys = Object.keys(f);
        for(var i = 0; i < keys.length; i++) {
            fn[keys[i]] = f[keys[i]];
        }
        return fn;
    }

    f.param = function(name, type) {
        f.params = f.params || [];
        f.params.push({name: name, type: type});
        return f;
    }

    f.returns = function(type) {
        f.returnType = type;
        return f;
    }

    f.returnsArrayOf = function(type) {
        f.returnType = "Array";
        f.elementType= type;
        return f;
    }

    f.returnsCollectionOf = function(type) {
        f.returnType = "Collection";
        f.elementType = type;
        return f;
    }

    return f;
}
//endregion



exports.serviceFunctionPrototype = serviceFunctionPrototype();
exports.serviceFunction = serviceFunction;