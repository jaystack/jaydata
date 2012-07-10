$data.Class.define('$data.Access', null, null, {}, {
    isAuthorized: function(access, user, roles, callback){
        var error;
        
        if (!access) error = 'Access undefined';
        if (typeof access !== 'number') error = 'Invalid access type';
        if (!user) error = 'User undefined';
        if (!user.roles) error = 'User has no roles';
        if (!roles) error = 'Roles undefined';
        if (!(roles instanceof Array || roles instanceof Object)) error = 'Invald roles type';
        
        if (error) Guard.raise(error, 'Access authorization');
        
        if (user.roles instanceof Array){
            var r = {};
            for (var i = 0; i < user.roles.length; i++){
                if (typeof user.roles[i] === 'string') r[user.roles[i]] = true;
            }
            user.roles = r;
        }
        
        if (roles instanceof Array){
            var r = {};
            for (var i = 0; i < roles.length; i++){
                if (typeof roles[i] === 'string') r[roles[i]] = true;
            }
            roles = r;
        }
        
        var pHandler = new $data.PromiseHandler();
        var clbWrapper = pHandler.createCallback(callback);
        var pHandlerResult = pHandler.getPromise();
        
        var readyFn = function(result){
            clbWrapper[result ? 'success' : 'error'](result);
        };
        
        var rolesKeys = Object.getOwnPropertyNames(roles);
        var i = 0;
        
        var callbackFn = function(result){
            if (result) readyFn(result);
        
            if (typeof roles[rolesKeys[i]] === 'boolean' && roles[rolesKeys[i]]){
                if (user.roles[rolesKeys[i]]) readyFn(true);
                else{
                    i++;
                    if (i < rolesKeys.length) callbackFn();
                    else readyFn(false);
                }
            }else if (typeof roles[rolesKeys[i]] === 'function'){
                var r = roles[rolesKeys[i]].call(user);
                
                if (typeof r === 'function') r.call(user, (i < rolesKeys.length ? callbackFn : readyFn));
                else{
                    if (r) readyFn(true);
                    else{
                        i++;
                        if (i < rolesKeys.length) callbackFn();
                        else readyFn(false);
                    }
                }
            }else if (typeof roles[rolesKeys[i]] === 'number'){
                if (((typeof user.roles[rolesKeys[i]] === 'number' && (user.roles[rolesKeys[i]] & access)) ||
                    (typeof user.roles[rolesKeys[i]] !== 'number' && user.roles[rolesKeys[i]])) &&
                    (roles[rolesKeys[i]] & access)) user.roles[rolesKeys[i]] &&  readyFn(true);
                else{
                    i++;
                    if (i < rolesKeys.length) callbackFn();
                    else readyFn(false);
                }
            }
        };
        
        callbackFn();
        
        return pHandlerResult;
    },
    None: 0,
    Create: 1,
    Read: 2,
    Update: 4,
    Delete: 8,
    Execute: 16
});
