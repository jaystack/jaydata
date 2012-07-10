Function.prototype.extend = function(extend){
    var fn = this;
    
    var ret = function(){
        return fn.apply(this, arguments);
    };
    
    for (var i in extend){
        ret[i] = extend[i];
    }
    
    return ret;
};

$data.ServiceOperation = function(){};

Function.prototype.returns = function(type, elementType){
    if (typeof type === 'string')
        type = Container.resolveType(type);
        
    if (typeof elementType === 'string')
        elementType = Container.resolveType(elementType);

    return this.extend({
        type: type,
        elementType: elementType
    });
};

Function.prototype.params = function(params){
    for (var p in params){
        if (typeof params[p] === 'string')
            params[p] = Container.resolveType(params[p]);
    }
    
    return this.extend({
        params: params
    });
};

Function.prototype.serviceName = function(serviceName){
    return this.extend({
        serviceName: serviceName
    });
};

Function.prototype.roles = function(roles){
    var r = {};
    if (roles instanceof Array){
        for (var i = 0; i < roles.length; i++){
            if (typeof roles[i] === 'string') r[roles[i]] = true;
        }
    }else r = roles;
    
    return this.extend({
        roles: r
    });
};
