$data.Class.define('$data.oDataServer.EntityTransform', null, null, {
    constructor: function (context, requesUrl) {
        ///	<signature>
        ///     <summary>Transform class for JSON verbose format</summary>
        ///     <description>Transform class for JSON verbose format</description>
        ///     <param name="context" type="$data.EntityContext">Context instance</param>
        ///     <param name="requesUrl" type="String">Service Url</param>
        /// </signature>

        this.context = context;
        this.requesUrl = requesUrl;
    },
    convertToResponse: function (results, collectionNameOrElementType, selectedFields, includes) {
        ///	<signature>
        ///     <summary>Transform entities for JSON verbose format</summary>
        ///     <description>Transform entities for JSON verbose format</description>
        ///     <param name="results" type="Array">Array of Entities from any EntitySet of context</param>
        ///     <param name="collectionNameOrElementType" type="function">elementType of input items</param>
        ///     <param name="selectedFields" type="Array">Fields for result</param>
        ///     <param name="includes" type="Array">Navigation property includes</param>
        ///     <return type="Object" />
        /// </signature>
        ///	<signature>
        ///     <summary>Transform entities for JSON verbose format</summary>
        ///     <description>Transform entities for JSON verbose format</description>
        ///     <param name="results" type="Array">Array of Entities from any EntitySet of context</param>
        ///     <param name="collectionNameOrElementType" type="string">EntitySet name</param>
        ///     <param name="selectedFields" type="Array">Fields for result</param>
        ///     <param name="includes" type="Array">Navigation property includes</param>
        ///     <return type="Object" />
        /// </signature>

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
        /*if (selectedFields && selectedFields.length > 0) {
            memDefs = memDefs.filter(function (memDef) {
                return selectedFields.indexOf(memDef.name) >= 0 || selectedFields.filter(function(it){ return it.split('.')[0] === memDef.name }).length;
            });
        }*/

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

        //console.log('selectedFields', selectedFields);
        this.addMemberConfigs(memDefs, binderConfig.$item, selectedFields, includes, undefined, '');
        //console.log('binderConfig', binderConfig.$item);
        var converter = new $data.ModelBinder({ storageProvider: { fieldConverter: this.converter } });
        //console.log('results', results[0].Author.Profile);
        var result = converter.call(results, binderConfig);
        //console.log('transform', result[0].Author);
        return result;
    },
    addMemberConfigs: function (memberDefinitions, config, selectedFields, includes, includeStep, path) {
        //console.log('includes', includes, includeStep);
        var self = this;
        var memDefs = memberDefinitions;
        if (selectedFields && selectedFields.length > 0) {
            memDefs = memDefs.filter(function (memDef) {
                var deepMemberName = includeStep ? (includeStep + '.' + memDef.name) : memDef.name;
                return selectedFields.indexOf(deepMemberName) >= 0 || selectedFields.filter(function (it) {
                    return it.indexOf(deepMemberName + '.') === 0 || deepMemberName.indexOf(it + '.') === 0;
                }).length;
            });
        }
        //console.log(memDefs.map(function(it){ return it.name; }));
        //memberDefinitions.forEach(function (memDef) {
        memDefs.forEach(function (memDef) {
            var step = includeStep ? (includeStep + '.' + memDef.name) : memDef.name;
            //console.log('step', step);

            var type = Container.resolveType(memDef.type);
            if (type === $data.Array) {
                //Collecion
                var elementType = Container.resolveType(memDef.elementType);
                var isEntity = elementType.isAssignableTo && elementType.isAssignableTo($data.Entity);
                var hasEntitySet = isEntity ? self._getEntitySetDefByType(elementType) : false;
                if (hasEntitySet || (memDef.lazyLoad !== true || selectedFields.indexOf(step) >= 0)) {
                    if (includes.indexOf(step) >= 0 || !hasEntitySet) {
                        if (isEntity) {
                            config[memDef.name] = {
                                $type: $data.Array,
                                $selector: ['json:' + memDef.name],
                                $item: {
                                    $type: $data.Object,
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
                                            } else {
                                                return {
                                                    type: data.getType().fullName
                                                };
                                            }
                                        }
                                    }
                                }
                            }
                            this.addMemberConfigs(elementType.memberDefinitions.getPublicMappedProperties(), config[memDef.name].$item, selectedFields, includes, step, path);
                        } else {
                            config[memDef.name] = {
                                $type: $data.Array,
                                $source: memDef.name
                            };
                        }
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
            } else if (type.isAssignableTo && type.isAssignableTo($data.Entity)) {
                //var step = includeStep ? (includeStep + '.' + memDef.name) : memDef.name;
                var setDef = this._getEntitySetDefByType(type);
                if (!setDef) {
                    //ComplexType
                    if (memDef.lazyLoad !== true || selectedFields.indexOf(step) >= 0) {
                        config[memDef.name] = {
                            $type: $data.Object,
                            $selector: ['json:' + memDef.name],
                            __metadata: {
                                $type: $data.Object,
                                $value: (function (meta, data) {
                                    return {
                                        type: this.fullName
                                    };
                                }).bind(type)
                            }
                        }
                        this.addMemberConfigs(type.memberDefinitions.getPublicMappedProperties(), config[memDef.name], selectedFields, includes, step, path);
                    }
                } else {
                    //single side
                    //console.log('includes2', step, includes.indexOf(step) >= 0);
                    if (includes.indexOf(step) >= 0) {
                        config[memDef.name] = {
                            $type: $data.Object,
                            $selector: ['json:' + memDef.name],
                            __metadata: {
                                $type: $data.Object,
                                $value: (function (meta, data) {
                                    //console.log(data);
                                    /*var setDef = self._getEntitySetDefByType(data.getType());
                                    if (setDef) {
                                        var uri = self.generateUri(data, setDef);
                                        var result = {
                                            id: uri,
                                            uri: uri,
                                            type: data.getType().fullName
                                        };
                                        data.uri = result.uri;
                                        return result;
                                    }*/
                                    var setDef = self._getEntitySetDefByType(this);
                                    if (setDef) {
                                        var uri = self.generateUri(data, setDef);
                                        var result = {
                                            id: uri,
                                            uri: uri,
                                            type: this.fullName
                                        };
                                        data.uri = result.uri;
                                        return result;
                                    }
                                }).bind(type)
                            }
                        };
                        var map = type.memberDefinitions.getPublicMappedProperties();
                        /*if (selectedFields && selectedFields.length > 0){
                            map = map.filter(function(it){
                                return selectedFields.indexOf(memDef.name + '.' + (path ? path + '.' : '') + it.name) >= 0;
                            });
                        }*/
                        this.addMemberConfigs(map, config[memDef.name], selectedFields, includes, step, memDef.name);
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
                        };
                    }
                }
            } else if (memDef.lazyLoad !== true || selectedFields.indexOf(step) >= 0) {
                config[memDef.name] = { $source: memDef.name, $type: memDef.type };
            }
        }, this)
    },
    _getEntitySetDefByType: function (type) {
        var defs = this.context.memberDefinitions.asArray();
        for (var i = 0, l = defs.length; i < l; i++) {
            var def = defs[i];
            if (def.elementType && type && def.elementType.fullName === type.fullName)
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
                    return o ? '/Date(' + o.valueOf() + ')/' : null;
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
                },
                '$data.GeographyPoint': function (o) {
                    if (o === undefined) {
                        return new $data.GeographyPoint();
                    }
                    return o;
                },
                '$data.GeometryPoint': function (o) {
                    if (o === undefined) {
                        return new $data.GeometryPoint();
                    }
                    return o;
                },
                '$data.Guid': function (o) {
                    /*if (o === undefined) {
                        return new $data.Guid();
                    }*/
                    return o;
                },
                '$data.GeographyLineString': function (o) { return o === undefined ? new $data.GeographyLineString() : o; },
                '$data.GeographyPolygon': function (o) { return o === undefined ? new $data.GeographyPolygon() : o; },
                '$data.GeographyMultiPoint': function (o) { return o === undefined ? new $data.GeographyMultiPoint() : o; },
                '$data.GeographyMultiLineString': function (o) { return o === undefined ? new $data.GeographyMultiLineString() : o; },
                '$data.GeographyMultiPolygon': function (o) { return o === undefined ? new $data.GeographyMultiPolygon() : o; },
                '$data.GeographyCollection': function (o) { return o === undefined ? new $data.GeographyCollection() : o; },
                '$data.GeometryLineString': function (o) { return o === undefined ? new $data.GeometryLineString() : o; },
                '$data.GeometryPolygon': function (o) { return o === undefined ? new $data.GeometryPolygon() : o; },
                '$data.GeometryMultiPoint': function (o) { return o === undefined ? new $data.GeometryMultiPoint() : o; },
                '$data.GeometryMultiLineString': function (o) { return o === undefined ? new $data.GeometryMultiLineString() : o; },
                '$data.GeometryMultiPolygon': function (o) { return o === undefined ? new $data.GeometryMultiPolygon() : o; },
                '$data.GeometryCollection': function (o) { return o === undefined ? new $data.GeometryCollection() : o; }
            },
            toDb: {
                '$data.ObjectID': function (id) {
                    return "'" + (id || '').toString() + "'";
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
                },
                '$data.GeographyPoint': function (g) {
                    return g;
                },
                '$data.GeometryPoint': function (g) {
                    return g;
                },
                '$data.Guid': function (g) {
                    return g ? "guid'" + g.toString() + "'" : g;
                },
                '$data.GeographyLineString': function (o) { return o; },
                '$data.GeographyPolygon': function (o) { return o; },
                '$data.GeographyMultiPoint': function (o) { return o; },
                '$data.GeographyMultiLineString': function (o) { return o; },
                '$data.GeographyMultiPolygon': function (o) { return o; },
                '$data.GeographyCollection': function (o) { return o; },
                '$data.GeometryLineString': function (o) { return o; },
                '$data.GeometryPolygon': function (o) { return o; },
                '$data.GeometryMultiPoint': function (o) { return o; },
                '$data.GeometryMultiLineString': function (o) { return o; },
                '$data.GeometryMultiPolygon': function (o) { return o; },
                '$data.GeometryCollection': function (o) { return o; }
            }
        }
    },
    //helpers
    generateUri: function (entity, entitySetDef) {
        var urlBase = this.requesUrl + '/' + entitySetDef.name;
        if (!entity)
            return urlBase;

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
