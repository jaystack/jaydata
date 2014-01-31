(function() {
    
Object.defineProperty($data.Entity.prototype, "_isNew", {
    get: function () {
        return !this.storeToken;
    }
});
Object.defineProperty($data.Entity.prototype, "_isDirty", {
    get: function () {
        return !this._isNew && this.changedProperties && this.changedProperties.length > 0;
    }
});

var originalSave = $data.Entity.prototype.save;
var originalRemove = $data.Entity.prototype.remove;
var originalSaveChanges = $data.EntityContext.prototype.saveChanges;

var _getCacheKey = function (query) {
    var key = query.expression.getJSON();
    var hash = 0, i, charC;
    if (key.length == 0) return hash;
    for (i = 0; i < key.length; i++) {
        charC = key.charCodeAt(i);
        hash = ((hash << 5) - hash) + charC;
        hash = hash & hash;
    }
    return hash;
}

angular.module('jaydata', ['ng', ['$provide', function ($provide) {

    $provide.factory('$data', ['$rootScope', '$q', '$timeout', function ($rootScope, $q, $timeout) {
        var cache = {};

        $data.Entity.prototype.hasOwnProperty = function (propName) {
            var member;
            if (this.getType && this.getType().memberDefinitions) {
                if (member = this.getType().memberDefinitions['$' + propName]) {
                    return ("property" === member.kind) && member.enumerable;
                } else {
                    return false;
                }
            }
            return Object.prototype.hasOwnProperty.apply(this, arguments);
        }

        $data.Queryable.prototype.toLiveArray = function (cb) {
            var _this = this;

            var trace = this.toTraceString();
            var cacheKey = _getCacheKey(this); // trace.queryText || trace.sqlText + JSON.stringify(trace.params);

            if (cache[cacheKey]) {
                return cache[cacheKey];
            }

            var result = [];
            cache[cacheKey] = result;

            result.state = "inprogress";
            result.successHandlers = [];
            result.errorHandlers = [];

            
            if (cb && typeof cb === 'function') {
                chainOrFire(cb, "success");
            }

            function chainOrFire(cb, type) {
                if (!cb) return;
                var targetCbArr = type === "success" ? result.successHandlers : result.errorHandlers;
                if (result.state === "completed") {
                    $timeout(function(){
                        cb(result);
                    });
                } else {
                    targetCbArr.push(cb);
                }
                return result;
            }

            result.then = result.success = function (cb) {
                return chainOrFire(cb, "success");
            };

            result.error = function (cb) {
                return result;
            };

            result.refresh = function (cb) {
                //result = [];
                result.length = 0;
                result.state = "inprogress";
                chainOrFire(cb, "success");
                _this.toArray({ success: result.resolve, error: result.reject });
                return result;
            }

            result.resolve = function (items) {
                $timeout(function(){
                    result.state = "completed";
                    items.forEach(function (item) {
                        result.push(item);
                    });
                    result.successHandlers.forEach(function (handler) {
                        handler(result);
                    });
                });
            }

            result.reject = function (err) {
                $timeout(function(){
                    result.state = "failed";
                    result.errorHandlers.forEach(function (handler) {
                        handler(err);
                    });
                });
            }

            this.toArray({ success: result.resolve, error: result.reject });

            return result;
        };

        $data.Entity.prototype.save = function () {
            var _this = this;
            var d = $q.defer();
            originalSave.call(_this).then(function () {
                cache = {};
                d.resolve(_this);
                if (!$rootScope.$$phase) $rootScope.$apply();
            }).fail(function (err) {
                d.reject(err);
                if (!$rootScope.$$phase) $rootScope.$apply();
            });
            return d.promise;
        };

        $data.ItemStoreClass.prototype.EntityInstanceSave = function (storeAlias, hint) {
            var self = $data.ItemStore;
            var entity = this;
            return self._getStoreEntitySet(storeAlias, entity)
                .then(function (entitySet) {
                    return self._getSaveMode(entity, entitySet, hint, storeAlias)
                        .then(function (mode) {
                            mode = mode || 'add';
                            switch (mode) {
                                case 'add':
                                    entitySet.add(entity);
                                    break;
                                case 'attach':
                                    entitySet.attach(entity, true);
                                    entity.entityState = $data.EntityState.Modified;
                                    break;
                                default:
                                    var d = new $data.PromiseHandler();
                                    var callback = d.createCallback();
                                    callback.error('save mode not supported: ' + mode);
                                    return d.getPromise();
                            }

                            return originalSaveChanges.call(entitySet.entityContext)
                                .then(function () { self._setStoreAlias(entity, entitySet.entityContext.storeToken); return entity; });
                        });
                });
        };
        $data.ItemStoreClass.prototype.EntityInstanceRemove = function (storeAlias) {
            var self = $data.ItemStore;
            var entity = this;
            return self._getStoreEntitySet(storeAlias, entity)
                .then(function (entitySet) {
                    entitySet.remove(entity);

                    return originalSaveChanges.call(entitySet.entityContext)
                        .then(function () { return entity; });
                });
        };
        $data.ItemStoreClass.prototype.EntityTypeRemoveAll = function (type) {
            return function (storeAlias) {
                var self = $data.ItemStore;
                return self._getStoreEntitySet(storeAlias, type)
                    .then(function (entitySet) {
                        return entitySet.toArray().then(function (items) {
                            items.forEach(function (item) {
                                entitySet.remove(item);
                            });

                            return originalSaveChanges.call(entitySet.entityContext)
                                .then(function () { return items; });
                        });
                    });
            }
        };
        $data.ItemStoreClass.prototype.EntityTypeAddMany = function (type) {
            return function (initDatas, storeAlias) {
                var self = $data.ItemStore;
                return self._getStoreEntitySet(storeAlias, type)
                    .then(function (entitySet) {
                        var items = entitySet.addMany(initDatas);
                        return originalSaveChanges.call(entitySet.entityContext)
                            .then(function () {
                                return items;
                            });
                    });
            }
        };

        $data.Entity.prototype.remove = function () {
            var d = $q.defer();
            var _this = this;
            originalRemove.call(_this).then(function () {
                cache = {};
                d.resolve(_this);
                if (!$rootScope.$$phase) $rootScope.$apply();
            }).fail(function (err) {
                d.reject(err);
                if (!$rootScope.$$phase) $rootScope.$apply();
            });
            
            return d.promise;
        }

        $data.EntityContext.prototype.saveChanges = function () {
            var _this = this;
            var d = $q.defer();
            originalSaveChanges.call(_this).then(function (n) {
                cache = {};
                d.resolve(n);
                if (!$rootScope.$$phase) $rootScope.$apply();
            }).fail(function (err) {
                d.reject(err);
                if (!$rootScope.$$phase) $rootScope.$apply();
            });
            return d.promise;
        }
        
        // Use $q for promises
        $data.Class.define('$data.Deferred', $data.PromiseHandlerBase, null, {
            constructor: function () {
                var deferred = new $q.defer();
                
                // $q promises don't have the 'fail' alias for the 'catch' method, so we have to add it.
                deferred.promise.fail = deferred.promise.catch;
                
                // Although we added the 'fail' alias, it isn't included in the promise returned from 'then',
                // so we have to add it.
                deferred.promise._then = deferred.promise.then;
                deferred.promise.then = function(){
                    var promise = this._then.apply(this, arguments);
                    promise.fail = promise.catch;
                    return promise;
                }
                
                this.deferred = deferred; 
            },
            deferred: {},
            createCallback: function (callBack) {
                callBack = $data.typeSystem.createCallbackSetting(callBack);
                var self = this;

                return cbWrapper = {
                    success: function () {
                        callBack.success.apply(self.deferred, arguments);
                        self.deferred.resolve.apply(self.deferred, arguments);
                    },
                    error: function () {
                        Array.prototype.push.call(arguments, self.deferred);
                        callBack.error.apply(self.deferred, arguments);
                    }
                };
            },
            getPromise: function () {
                return this.deferred.promise;
            }
        }, null);

        $data.PromiseHandler = $data.Deferred;
            
        return $data;
    }]);
}]]);
})();
