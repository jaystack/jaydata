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

$data.ServiceOperation = function(){
    var fn = arguments.callee;
    
    var virtualEntitySet = fn.elementType ? this.getEntitySetFromElementType(Container.resolveType(fn.elementType)) : null;
    
    var paramConstExpression = null;
    if (fn.params) {
        paramConstExpression = [];
        for (var i = 0; i < fn.params.length; i++) {
            //TODO: check params type
            for (var name in fn.params[i]) {
                paramConstExpression.push(Container.createConstantExpression(arguments[i], Container.resolveType(fn.params[i][name]), name));
            }
        }
    }

    var ec = Container.createEntityContextExpression(this);
    var memberdef = this.getType().getMemberDefinition(fn.serviceName);
    var es = Container.createServiceOperationExpression(ec,
            Container.createMemberInfoExpression(memberdef),
            paramConstExpression,
            fn);

    //Get callback function
    var clb = arguments[arguments.length - 1];
    if (typeof clb !== 'function') {
        clb = undefined;
    }

    if (virtualEntitySet) {
        var q = Container.createQueryable(virtualEntitySet, es);
        if (clb) {
            es.isTerminated = true;
            return q._runQuery(clb);
        }
        return q;
    }
    else {
        var returnType = Container.resolveType(fn.returnType);

        var q = Container.createQueryable(this, es);
        q.defaultType = returnType;

        if (returnType === $data.Queryable) {
            q.defaultType = Container.resolveType(fn.elementType);
            if (clb) {
                es.isTerminated = true;
                return q._runQuery(clb);
            }
            return q;
        }
        es.isTerminated = true;
        return q._runQuery(clb);
    }
};

Function.prototype.before = function(on){
    var fn = this;
    
    var ret = function(){
        var args = arguments.length ? arguments : [];
        var readyFn = function(result){
            args[args.length++] = result;
            fn.apply(this, args);
        };
        
        var r = on.apply(this, args);
        if (typeof r === 'function'){
            args[args.length++] = readyFn;
            r.apply(this, args);
        }else{
            args[args.length++] = r;
            return fn.apply(this, args);
        }
    };
    
    if (!ret.beforeFn) ret.beforeFn = [];
    ret.beforeFn.push(on);
    
    return ret;
};

Function.prototype.after = function(on){
    var fn = this;
    
    var ret = function(){
        var r = fn.apply(this, arguments);
        var args = arguments.length ? arguments : [];
        args[args.length++] = r;
        return on.apply(this, args);
    };
    
    if (!ret.afterFn) ret.afterFn = [];
    ret.afterFn.push(on);
    
    return ret;
};

Function.prototype.returns = function(type, elementType){
    if (typeof type === 'string')
        type = Container.resolveType(type);
        
    if (typeof elementType === 'string')
        elementType = Container.resolveType(elementType);

    return this.extend({
        returnType: type,
        elementType: elementType
    });
};

Function.prototype.params = function(params){
    /*for (var p in params){
        if (typeof params[p] === 'string')
            params[p] = Container.resolveType(params[p]);
    }*/
    
    return this.extend({
        params: params
    });
};

Function.prototype.serviceName = function(serviceName){
    return this.extend({
        serviceName: serviceName
    });
};

Function.prototype.method = function(method){
    return this.extend({
        method: method
    });
};

Function.prototype.authorize = function(roles, callback){
    var r = {};
    if (roles instanceof Array){
        for (var i = 0; i < roles.length; i++){
            if (typeof roles[i] === 'string') r[roles[i]] = true;
        }
    }else r = roles;
    
    this.roles = r;

    var fn = this;
    
    ret = function(){
        var pHandler = new $data.PromiseHandler();
        var clbWrapper = pHandler.createCallback(callback);
        var pHandlerResult = pHandler.getPromise();
        var args = arguments;
        
        clbWrapper.success = clbWrapper.success.after(function(){
            fn.apply(this, args);
        });
        
        $data.Access.isAuthorized($data.Access.Execute, this.user, fn.roles, clbWrapper);
        
        return pHandlerResult;
    };
    
    return ret;
};

Function.prototype.promise = function(callback){
    var fn = this;
    
    var ret = function(){
        var pHandler = new $data.PromiseHandler();
        var clbWrapper = pHandler.createCallback(callback);
        var pHandlerResult = pHandler.getPromise();
        
        arguments[arguments.length++] = clbWrapper;
        fn.apply(this, arguments);
        
        return pHandlerResult;
    };
    
    return ret;
};
