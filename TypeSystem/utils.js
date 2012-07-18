Guard = {};
Guard.requireValue = function (name, value) {
    if (typeof value === 'undefined' || value === null) {
        Guard.raise(name + " requires a value other than undefined or null");
    }
};

Guard.requireType = function (name, value, typeOrTypes) {
    var types = typeOrTypes instanceof Array ? typeOrTypes : [typeOrTypes];
    return types.some(function (item) {
        switch (typeof item) {
            case "string":
                return typeof value === item;
            case "function":
                return value instanceof item;
            default:
                Guard.raise("Unknown type format : " + typeof item + " for: "+ name);
        }
    });
};

Guard.raise = function(exception){
	if (typeof intellisense === 'undefined') {
		if (exception instanceof Exception){
			console.error(exception.name + ':', exception.message + '\n', exception);
		}else{
			console.error(exception);
		}
		throw exception;
	}
};

Object.isNullOrUndefined = function (value) {
    return value === undefined || value === null;
};
