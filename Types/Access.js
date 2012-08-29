$data.Class.define('$data.Access', null, null, {}, {
    isAuthorized: function(access, user, sets, callback){
        var pHandler = new $data.PromiseHandler();
        var clbWrapper = pHandler.createCallback(callback);
        var pHandlerResult = pHandler.getPromise();
        
        //clbWrapper.error('Authorization failed', 'Access authorization');
        clbWrapper.success(true);
        
        return pHandlerResult;
        
        /*var error;
        
        if (!access) error = 'Access undefined';
        if (typeof access !== 'number') error = 'Invalid access type';
        if (!user) user = {}; //error = 'User undefined';
        if (!user.roles) user.roles = {}; //error = 'User has no roles';
        if (!roles) roles = {}; //error = 'Roles undefined';
        if (!(roles instanceof Array || typeof roles === 'object')) error = 'Invald roles type';
        
        var pHandler = new $data.PromiseHandler();
        var clbWrapper = pHandler.createCallback(callback);
        var pHandlerResult = pHandler.getPromise();
        
        if (error){
            clbWrapper.error(error, 'Access authorization');
            return pHandlerResult;
        }
        
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
        
        var args = arguments;
        var readyFn = function(result){
            if (result) clbWrapper.success(result);
            else clbWrapper.error('Authorization failed', args);
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
        
        return pHandlerResult;*/
    },
    getAccessBitmaskFromPermission: function(p){
        var access = $data.Access.None;

        if (p.Create) access |= $data.Access.Create;
        if (p.Read) access |= $data.Access.Read;
        if (p.Update) access |= $data.Access.Update;
        if (p.Delete) access |= $data.Access.Delete;
        if (p.DeleteBatch) access |= $data.Access.DeleteBatch;
        if (p.Execute) access |= $data.Access.Execute;
        
        return access;
    },
    None: { value: 0 },
    Create: { value: 1 },
    Read: { value: 2 },
    Update: { value: 4 },
    Delete: { value: 8 },
    DeleteBatch: { value: 16 },
    Execute: { value: 32 }
});
