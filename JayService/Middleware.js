exports = module.exports = {
    appId: function(config){
        return function(req, res, next){
            var appId = req.headers['X-AppId'];
            delete req.headers['X-AppId'];
            
            Object.defineProperty(req, 'getAppId', {
                value: function(){
                    return appId;
                }
            });
            
            next();
        };
    }
};
