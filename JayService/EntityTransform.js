$data.Class.define('$data.oDataServer.EntityTransform', null, null, {
    constructor: function (context, requesUrl) {
        this.context = context;
        this.requesUrl = requesUrl;
    },
    convertToResponse: function (results, collectionNameOrElementType, selectedFields, includes) {
        if (!(results instanceof $data.Array) || !collectionNameOrElementType)
            return results;

        if (!selectedFields) selectedFields = [];
        if (!includes) includes = [];

        var entitySetDef;
        var defaultType = collectionNameOrElementType;
        if (typeof collectionNameOrElementType === 'string') {
            entitySetDef = this.context.memberDefinitions.getMember(collectionNameOrElementType);
            defaultType = entitySetDef.elementType;
        } else {
            entitySetDef = this._getEntitySetDefByType(defaultType);
        }

        var memDefs = defaultType.memberDefinitions.getPublicMappedProperties();
        if (selectedFields && selectedFields.length > 0) {
            memDefs = memDefs.filter(function (memDef) {
                return selectedFields.indexOf(memDef.name) >= 0
            });
        }

        self = this;
        var binderConfig = {
            $type: $data.Array,
            $item: {
                $type: $data.Object,
                __metadata: {
                    $type: $data.Object,
                    $value: function (meta, data) {
                        var result = {
                            type: defaultType.fullName
                        };
                        if (entitySetDef) {
                            var uri = self.generateUri(data, entitySetDef);
                            result.id = uri;
                            result.uri = uri;

                            data.uri = result.uri;
                        }

                        return result;
                    }
                }
            }
        };
        this.addMemberConfigs(memDefs, binderConfig.$item, includes, undefined);

        var converter = new $data.ModelBinder({ storageProvider: { fieldConverter: this.converter } });

        var result = converter.call(results, binderConfig);
        return result;
    },
    addMemberConfigs: function (memberDefinitions, config, includes, includeStep) {
        var self = this;
        memberDefinitions.forEach(function (memDef) {
            var step = includeStep ? (includeStep + '.' + memDef.name) : memDef.name;

            var type = Container.resolveType(memDef.type);
            if (type === $data.Array) {
                //Collecion
                var elementType = Container.resolveType(memDef.elementType);
                if (includes.indexOf(step) >= 0) {
                    config[memDef.name] = {
                        $type: $data.Array,
                        $selector: ['json:' + memDef.name],
                        $item: {
                            $type: $data.Object,
                            __metadata: {
                                $type: $data.Object,
                                $value: function (meta, data) {
                                    var setDef = self._getEntitySetDefByType(data.getType());
                                    var uri = self.generateUri(data, setDef);
                                    if (setDef) {
                                        var result = {
                                            id: uri,
                                            uri: uri,
                                            type: data.getType().fullName

                                        };
                                        data.uri = result.uri;
                                        return result;
                                    }
                                }
                            }
                        }
                    }
                    this.addMemberConfigs(elementType.memberDefinitions.getPublicMappedProperties(), config[memDef.name].$item, includes, step);
                } else {
                    config[memDef.name] = {
                        $type: $data.Object,
                        $value: function (meta, data) {
                            return {
                                __deferred: {
                                    uri: data.uri + '/' + memDef.name
                                }
                            };
                        }
                    }
                }
            } else if (type.isAssignableTo && type.isAssignableTo($data.Entity)) {
                var setDef = this._getEntitySetDefByType(type);
                if (!setDef) {
                    //ComplexType
                    config[memDef.name] = {
                        $type: $data.Object,
                        $selector: ['json:' + memDef.name],
                        __metadata: {
                            $type: $data.Object,
                            $value: function (meta, data) {
                                return {
                                    type: data.getType().fullName
                                };
                            }
                        }
                    }
                    this.addMemberConfigs(type.memberDefinitions.getPublicMappedProperties(), config[memDef.name], includes, step);
                } else {
                    //single side
                    if (includes.indexOf(step) >= 0) {
                        config[memDef.name] = {
                            $type: $data.Object,
                            $selector: ['json:' + memDef.name],
                            __metadata: {
                                $type: $data.Object,
                                $value: function (meta, data) {
                                    var setDef = self._getEntitySetDefByType(data.getType());
                                    if (setDef) {
                                        var uri = self.generateUri(data, setDef);
                                        var result = {
                                            id: uri,
                                            uri: uri,
                                            type: data.getType().fullName
                                        };
                                        data.uri = result.uri;
                                        return result;
                                    }
                                }
                            }
                        }
                        this.addMemberConfigs(type.memberDefinitions.getPublicMappedProperties(), config[memDef.name], includes, step);
                    } else {
                        config[memDef.name] = {
                            $type: $data.Object,
                            $value: function (meta, data) {
                                return {
                                    __deferred: {
                                        uri: data.uri + '/' + memDef.name
                                    }
                                };
                            }
                        }
                    }
                }
            } else {
                config[memDef.name] = { $source: memDef.name, $type: memDef.type };
            }
        }, this)
    },
    _getEntitySetDefByType: function (type) {
        var defs = this.context.memberDefinitions.asArray();
        for (var i = 0, l = defs.length; i < l; i++) {
            var def = defs[i];
            if (def.elementType === type)
                return def;
        }
        return null;
    },
    converter: {
        value: {
            fromDb: {
                '$data.ObjectID': function (o) {
                    //if (o === undefined) {
                    //    return new $data.ObjectID();
                    //}
                    return o;
                },
                '$data.Integer': function (o) {
                    //if (o === undefined) {
                    //    return new $data.Integer();
                    //}
                    return o;
                },
                '$data.Number': function (o) {
                    //if (o === undefined) {
                    //    return new $data.Number();
                    //}
                    return o;
                },
                '$data.Date': function (o) {
                    if (o === undefined) {
                        return o;
                    }
                    return '/Date(' + o.valueOf() + ')/';
                },
                '$data.String': function (o) {
                    //if (o === undefined) {
                    //    return new $data.String();
                    //}
                    return o;
                },
                '$data.Boolean': function (o) {
                    //if (o === undefined) {
                    //    return new $data.Boolean();
                    //}
                    return o;
                },
                '$data.Blob': function (o) {
                    //if (o === undefined) {
                    //    return new $data.Blob();
                    //}
                    return o;
                },
                '$data.Object': function (o) {
                    if (o === undefined) {
                        return new $data.Object();
                    }
                    return o;
                },
                '$data.Array': function (o) {
                    if (o === undefined) {
                        return new $data.Array();
                    }
                    return o;
                }
            },
            toDb: {
                '$data.ObjectID': function (id) {
                    return id;
                },
                '$data.Integer': function (number) {
                    return number;
                },
                '$data.Number': function (number) {
                    return number % 1 == 0 ? number : number + 'm';
                },
                '$data.Date': function (date) {
                    return date ? "datetime'" + date.toISOString() + "'" : null;
                },
                '$data.String': function (text) {
                    return Object.isNullOrUndefined(text) ? text : "'" + text.replace(/'/g, "''") + "'";
                },
                '$data.Boolean': function (bool) {
                    return bool ? 'true' : 'false';
                },
                '$data.Blob': function (blob) {
                    return blob;
                },
                '$data.Object': function (o) {
                    return JSON.stringify(o);
                },
                '$data.Array': function (o) {
                    return JSON.stringify(o);
                }
            }
        }
    },
    //helpers
    generateUri: function (entity, entitySetDef) {
        var urlBase = this.requesUrl + '/' + entitySetDef.name;

        var type = Container.resolveType(entitySetDef.elementType);
        var keys = type.memberDefinitions.getKeyProperties();
        var keyData = [];
        for (var i = 0, l = keys.length; i < l; i++) {
            var memDef = keys[i];
            var typeName = Container.resolveName(Container.resolveType(memDef.type));
            if (l === 1) {
                keyData.push(this.converter.toDb[typeName](entity[memDef.name]));
            } else {
                keyData.push(memDef.name + '=' + this.converter.toDb[typeName](entity[memDef.name]));
            }
        }

        return urlBase + '(' + keyData.join(',') + ')';

    }
});
