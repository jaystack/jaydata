Function.prototype.extend = function(extend){
    for (var i in extend){
        this[i] = extend[i];
    }
    
    return this;
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
