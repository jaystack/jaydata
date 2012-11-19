$data.Class.define('$data.ItemStoreClass', null, null, {
    constructor: function () {
        var self = this;
        self.itemStoreConfig = {
            aliases: {
            }
        }

        self.addItemStoreAlias('default', this._getDefaultItemStoreFactory, true);
        $data.addStore = function () {
            return self.addItemStoreAlias.apply(self, arguments);
        };
        $data.implementation = self.implementation();
    },
    itemStoreConfig: {},

    addItemStoreAlias: function (name, ctxFactory, isDefault) {
        if ('string' === typeof name && 'function' === typeof ctxFactory) {
            this.itemStoreConfig.aliases[name] = ctxFactory;
            if (isDefault) {
                this.itemStoreConfig['default'] = name;
            }
        }

        return $data;
    },
    _setStoreAlias: function (entity, storeAliasOrFactory) {
        if ('function' === typeof storeAliasOrFactory)
            entity.storeFactory = storeAliasOrFactory
        else if (storeAliasOrFactory)
            entity.storeFactory = this.itemStoreConfig.aliases[storeAliasOrFactory]
        else
            entity.storeFactory = this.itemStoreConfig.aliases[this.itemStoreConfig['default']]
        return entity;
    },
    _getStoreAlias: function (entity, storeAlias) {
        return storeAlias || entity.storeFactory;
    },
    _getStoreEntitySet: function (aliasOrFactory, instanceOrType) {
        var contextPromise;
        var type = ("function" === typeof instanceOrType) ? instanceOrType : instanceOrType.getType();;

        if ('function' === typeof aliasOrFactory)
            contextPromise = aliasOrFactory(type);
        else if (aliasOrFactory && this.itemStoreConfig.aliases[aliasOrFactory])
            contextPromise = this.itemStoreConfig.aliases[aliasOrFactory](type);
        else
            contextPromise = this.itemStoreConfig.aliases[this.itemStoreConfig['default']](type);


        if (contextPromise instanceof $data.EntityContext) {
            var promise = new $data.PromiseHandler();
            promise.deferred.resolve(contextPromise);
            contextPromise = promise.getPromise();
        }

        return contextPromise.then(function (context) {
            return context.onReady()
                .then(function (ctx) {
                    var entitySet = ctx.getEntitySetFromElementType(type);
                    if (!entitySet) {
                        var d = new $data.PromiseHandler();
                        d.deferred.reject("EntitySet not exist for " + type.fullName);
                        return d.getPromise();
                    }
                    return entitySet;
                });
        });
    },
    _getDefaultItemStoreFactory: function (instanceOrType) {
        if (instanceOrType) {
            var type = ("function" === typeof instanceOrType) ? instanceOrType : instanceOrType.getType();
            var typeName = $data.Container.resolveName(type) + "_items";
            var typeName = typeName.replace(".", "_");

            var provider = 'local';

            var inMemoryType = $data.EntityContext.extend(typeName, {
                'Items': { type: $data.EntitySet, elementType: type }
            });

            return new inMemoryType({ name: provider, databaseName: typeName });
        }
        return undefined;
    },
    implementation: function () {
        var self = this;
        return function (contextOrName, name) {
            var result;

            if ('string' === typeof contextOrName) {
                result = Container.resolveType(contextOrName);
                //todo try to find on default context

            } else {
                if (contextOrName && (contextOrName instanceof $data.EntityContext || (contextOrName.isAssignableTo && contextOrName.isAssignableTo($data.EntityContext)))) {
                    var contextType = typeof contextOrName !== 'function' ? contextOrName.getType() : contextOrName;
                    var memDefs = contextType.memberDefinitions.getPublicMappedProperties();
                    for (var i = 0; i < memDefs.length; i++) {
                        var memDef = memDefs[i];
                        var memDefType = Container.resolveType(memDef.type);
                        if (memDefType.isAssignableTo && memDefType.isAssignableTo($data.EntitySet)) {
                            var elementType = Container.resolveType(memDef.elementType);
                            if (elementType.name === name) {
                                result = elementType;
                                break;
                            }
                        }
                    }

                    if (contextOrName instanceof $data.EntityContext) {
                        self.addItemStoreAlias('default', contextOrName._contextFactory, true);
                    }
                }
            }

            if (!result)
                throw 'type not found exception';

            return result;
        };
    },


    //Entity Instance
    EntityInstanceSave: {
        get: function () {
            var self = this;

            return function (hint, storeAlias) {
                var entity = this;
                storeAlias = self._getStoreAlias(entity, storeAlias);
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
                                        d.deferred.reject('save mode not supported: ' + mode);
                                        return d.getPromise();
                                }

                                return entitySet.entityContext.saveChanges()
                                    .then(function () { return entity; });
                            });
                    });
            };
        },
        set: function (hint, storeAlias) { }
    },
    EntityInstanceRemove: {
        get: function () {
            var self = this;

            return function (storeAlias) {
                var entity = this;
                storeAlias = self._getStoreAlias(entity, storeAlias);
                return self._getStoreEntitySet(storeAlias, entity)
                    .then(function (entitySet) {
                        entitySet.remove(entity);

                        return entitySet.entityContext.saveChanges()
                            .then(function () { return entity; });
                    });
            };
        },
        set: function () { }
    },
    EntityInstanceRefresh: {
        get: function () {
            var self = this;

            return function (storeAlias) {
                var entity = this;
                var entityType = entity.getType();

                var key = self._getKeyObjectFromEntity(entity, entityType);

                return entityType.read(key, storeAlias)
                    .then(function (loadedEntity) {
                        //??
                        entityType.memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
                            entity[memDef.name] = loadedEntity[memDef.name];
                        });

                        entity.changedProperties = undefined;
                        return entity;
                    });
            };
        },
        set: function () { }
    },

    //Entity Type
    EntityInheritedTypeProcessor: {
        get: function () {
            var self = this;

            return function (type) {
                type.readAll = self.EntityTypeReadAll(type);
                type.read = self.EntityTypeRead(type);
                type.removeAll = self.EntityTypeRemoveAll(type);
                type.remove = self.EntityTypeRemove(type);
                type.get = self.EntityTypeGet(type);
                type.save = self.EntityTypeSave(type);
                type.itemCount = self.EntityTypeItemCount(type);
                type.filter = self.EntityTypeFilter(type);
                type.first = self.EntityTypeFirst(type);
            }
        },
        set: function () { }
    },
    EntityTypeReadAll: function (type) {
        var self = this;

        return function (storeAlias) {
            return self._getStoreEntitySet(storeAlias, type)
                .then(function (entitySet) {
                    return entitySet.forEach(function (item) { self._setStoreAlias(item, storeAlias); });
                });
        }
    },
    EntityTypeRemoveAll: function (type) {
        var self = this;

        return function (storeAlias) {
            return self._getStoreEntitySet(storeAlias, type)
                .then(function (entitySet) {
                    return entitySet.toArray().then(function (items) {
                        items.forEach(function (item) {
                            entitySet.remove(item);
                        });

                        return entitySet.entityContext.saveChanges()
                            .then(function () { return items; });
                    });
                });
        }
    },
    EntityTypeRead: function (type) {
        var self = this;

        return function (key, storeAlias) {
            return self._getStoreEntitySet(storeAlias, type)
                .then(function (entitySet) {
                    try {
                        var singleParam = self._findByIdQueryable(entitySet, key);
                        return entitySet.single(singleParam.predicate, singleParam.thisArgs)
                            .then(function (item) { return self._setStoreAlias(item, storeAlias); });
                    } catch (e) {
                        var d = new $data.PromiseHandler();
                        d.deferred.reject(e);
                        return d.getPromise();
                    }
                });
        };
    },
    EntityTypeGet: function (type) {
        var self = this;

        return function (key, storeAlias) {
            var item = new type(self._getKeyObjectFromEntity(key));
            return item.refresh(storeAlias);
        };
    },
    EntityTypeSave: function (type) {
        var self = this;

        return function (initData, hint, storeAlias) {
            var instance = new type(initData);
            return instance.save(hint, storeAlias);
        }
    },
    EntityTypeRemove: function (type) {
        var self = this;

        return function (key, storeAlias) {
            var entityPk = type.memberDefinitions.getKeyProperties();
            var entity;
            if (entityPk.length === 1) {
                var obj = {};
                obj[entityPk[0].name] = key;
                entity = new type(obj);
            } else {
                entity = new type(key);
            }
            return entity.remove(storeAlias);
        }
    },
    EntityTypeItemCount: function (type) {
        var self = this;

        return function (storeAlias) {
            return self._getStoreEntitySet(storeAlias, type)
                .then(function (entitySet) {
                    return entitySet.length();
                });
        }
    },
    EntityTypeFilter: function (type) {
        var self = this;

        return function (predicate, thisArg, storeAlias) {
            return self._getStoreEntitySet(storeAlias, type)
                .then(function (entitySet) {
                    return entitySet.filter(predicate, thisArg).forEach(function (item) { self._setStoreAlias(item, storeAlias); });
                });
        }
    },
    EntityTypeFirst: function (type) {
        var self = this;

        return function (predicate, thisArg, storeAlias) {
            return self._getStoreEntitySet(storeAlias, type)
                .then(function (entitySet) {
                    return entitySet.first(predicate, thisArg)
                        .then(function (item) { return self._setStoreAlias(item, storeAlias); });
                });
        }
    },

    _findByIdQueryable: function (set, keys) {
        var keysProps = set.defaultType.memberDefinitions.getKeyProperties();
        if (keysProps.length > 1 && keys && 'object' === typeof keys) {
            var predicate = "", thisArgs = {};
            for (var i = 0; i < keysProps.length; i++) {
                if (i > 0) predicate += " && ";

                var key = keysProps[i];
                predicate += "it." + key.name + " == this." + key.name;
                thisArgs[key.name] = keys[key.name];
            }

            return {
                predicate: predicate,
                thisArgs: thisArgs
            };
        } else if (keysProps.length === 1) {
            return {
                predicate: "it." + keysProps[0].name + " == this.value",
                thisArgs: { value: keys }
            };
        } else {
            throw 'invalid keys';
        }
    },
    _getKeyObjectFromEntity: function (obj, entityType) {
        var key;
        var keyDefs = entityType.memberDefinitions.getKeyProperties();
        if (keyDefs.length === 1)
            key = obj && typeof obj === 'object' ? obj[keyDefs[0].name] : obj;
        else {
            key = {};

            for (var i = 0; i < keyDefs.length; i++) {
                key[keyDefs[0].name] = obj ? obj[keyDefs[0].name] : obj;
            }
        }

        return key;
    },
    _getSaveMode: function (entity, entitySet, hint, storeAlias) {
        var self = this;
        var promise = new $data.PromiseHandler();
        var deferred = promise.deferred;
        var entityType = entity.getType();

        switch (true) {
            case hint === 'update':
                deferred.resolve('attach'); break;
            case hint === 'new':
                deferred.resolve('add'); break;
            case false === entityType.memberDefinitions.getKeyProperties().every(function (keyDef) { return entity[keyDef.name]; }):
                deferred.resolve('add'); break;
            default:
                entityType.read(self._getKeyObjectFromEntity(entity, entityType), storeAlias)
                    .then(function () { deferred.resolve('attach'); })
                    .fail(function () { deferred.resolve('add'); });
                break;
        }

        return promise.getPromise();
    },

    //EntityContext
    QueryResultModifier: {
        get: function () {
            var self = this;

            return function (query) {
                var context = this;
                var type = query.modelBinderConfig.$type;
                if ('string' === typeof type) {
                    type = Container.resolveType(type);
                }

                if (type === $data.Array && query.modelBinderConfig.$item && query.modelBinderConfig.$item.$type) {
                        type = query.modelBinderConfig.$item.$type;
                }

                if ((type && type.isAssignableTo && type.isAssignableTo($data.Entity)) || (typeof type === 'undefined' && query.result && query.result[0] instanceof $data.Entity)) {
                    for (var i = 0; i < query.result.length; i++) {
                        query.result[i].storeFactory = context._contextFactory;
                    }
                }
            }
        },
        set: function () { }
    }
});

$data.ItemStore = new $data.ItemStoreClass();
