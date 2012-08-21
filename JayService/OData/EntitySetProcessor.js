$data.Class.define('$data.JayService.OData.EntitySetProcessor', null, null, {
    constructor: function (memberName, context, restrictions) {
        this.memberName = memberName;
        this.context = context;
        this.restrictions = restrictions;

        this.member = {
            validated: false
        };
    },
    invoke: function (config, req, res) {
        var self = this;

        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback();

        if (this.member.validated) {
            var baseurl = req.url.split('?')[0];
            switch (req.method) {
                case 'POST': //C
                    if (req.body) {
                        config.collectionName = this.entitySet.name;
                        config.context = self.context.getType();
                        config.singleResult = true;

                        var entity = new this.entitySet.createNew(req.body);
                        this.entitySet.add(entity);
                        this.context.saveChanges(function () {
                            cbWrapper.success(entity);
                        });
                    } else {
                        cbWrapper.error(0);
                    }

                    break;
                case 'GET': //R
                    config.context = self.context.getType();
                    config.simpleResult = baseurl.toLowerCase().indexOf('/$count') > 0;
                    self.ReadFromEntitySet(req, config, cbWrapper);
                    break;
                case 'MERGE': //U
                    if (req.body) {
                        var entity = new this.entitySet.createNew(req.body);
                        this.entitySet.attach(entity);
                        entity.entityState = $data.EntityState.Modified;
                        this.context.saveChanges(function () {
                            cbWrapper.success(new $data.EmptyServiceResult());
                        });
                    } else {
                        cbWrapper.error(0);
                    }
                    break;
                case 'DELETE': //D
                    if (baseurl.toLowerCase().indexOf('/$batchdelete') > 0) {
                        config.simpleResult = true;
                        self.BatchDeleteFromEntitySet(req, config, cbWrapper);
                    } else {
                        if (this.member.idObject) {
                            this.entitySet.remove(this.member.idObject);
                            this.context.saveChanges(function () {
                                //return with no content
                                cbWrapper.success(new $data.EmptyServiceResult());
                            });
                        } else {
                            cbWrapper.error(0);
                        }
                    }
                    break;
                default:
                    cbWrapper.error(0);
                    break;
            }
        } else {
            cbWrapper.reject(this.member.validated);
        }

        return pHandler.getPromise();
    },

    ReadFromEntitySet: function (req, config, callback) {
        var builder = new $data.oDataParser.ODataEntityExpressionBuilder(this.context, this.entitySet.name);
        var frameType = $data.Expressions.ExpressionType.ToArray;

        var idFilter = [];
        if (this.member.idObject) {
            var filter = [];
            for (var name in this.member.idObject) {
                idFilter.push(name + ' eq ' + this.member.idObject[name]);
            }
            frameType = $data.Expressions.ExpressionType.Single;
            config.singleResult = true;
        }

        if (config.simpleResult === true)
            frameType = $data.Expressions.ExpressionType.Count;

        var result = builder.parse(this._applyRestrictions({
            frame: frameType,
            filter: idFilter.length > 0 ? idFilter.join(' and ') : (req.query.$filter || ''),
            orderby: req.query.$orderby || '',
            select: this.member.selectedField || req.query.$select || '',
            skip: req.query.$skip || '',
            top: req.query.$top || '',
            expand: this.member.selectedField || req.query.$expand || ''
        }));

        config.collectionName = this.entitySet.name;
        config.selectedFields = result.selectedFields;
        config.includes = result.includes;
        this.context.executeQuery(new $data.Queryable(this.entitySet, result.expression), {
            success: function (contextResult) {
                if (config.simpleResult) {
                    callback.success(new $data.ServiceResult(contextResult));
                } else {
                    callback.success(contextResult);
                }
            },
            error: function (err) {
                callback.error(err);
            }
        });
    },
    _applyRestrictions: function (data) {
        if (this.restrictions) {
            if (data.frame === $data.Expressions.ExpressionType.ToArray && this.restrictions.top && this.restrictions.top > 0 && (!data.top || data.top > this.restrictions.top)) {
                data.top = this.restrictions.top.toString();
            }
        }
        return data;
    },

    BatchDeleteFromEntitySet: function (req, config, callback) {
        var builder = new $data.oDataParser.ODataEntityExpressionBuilder(this.context, this.entitySet.name);
        var result = builder.parse({
            frame: $data.Expressions.ExpressionType.BatchDelete,
            filter: req.query.$filter || '',
            orderby: req.query.$orderby || '',
            //select: req.query.$select || '',
            skip: req.query.$skip || '',
            top: req.query.$top || '',
            expand: req.query.$expand || ''
        });

        //config.collectionName = this.entitySet.name;
        //config.selectedFields = result.selectedFields;
        //config.includes = result.includes;
        this.context.executeQuery(new $data.Queryable(this.entitySet, result.expression), {
            success: function (contextResult) {
                callback.success(new $data.ServiceResult(contextResult));
            },
            error: function (err) {
                callback.error(err);
            }
        });
    },

    isSupported: function (req) {
        var urlParts = req.url.split('?')[0].split('/');
        var parts = [];
        for (var i = 0; i < urlParts.length; i++) {
            if (urlParts[i] !== '')
                parts.push(urlParts[i]);
        }
        var resolvedMethod = this._supportedMethods[req.method];
        if (resolvedMethod) {
            var requestInfo = this.parseUrlPart(parts[0], req.method === 'GET');
            if (requestInfo) {
                this.entitySet = requestInfo.set;
                this.member.idObject = requestInfo.idObj;

                parts.shift()
                var isSupported = this._supportedPath(parts, resolvedMethod);
                if (!isSupported && (typeof resolvedMethod._onNotSupported === 'function')) {
                    isSupported = resolvedMethod._onNotSupported.call(this, parts, resolvedMethod);
                }
                this.member.validated = !!(this.entitySet && isSupported);
            }
        }
        return this.member.validated;
    },
    _supportedPath: function (parts, resolvedMethod) {
        if (resolvedMethod && parts && parts.length === 0) {
            if (typeof resolvedMethod === 'object')
                return typeof resolvedMethod._isAllowed === 'function' ? resolvedMethod._isAllowed.apply(this, resolvedMethod) : resolvedMethod._isAllowed;
            else
                return !!resolvedMethod;
        } else if (resolvedMethod && parts && parts.length > 0) {
            if (parts.length === 1) {
                return resolvedMethod[parts[0]];
            } else {
                parts.shift()
                return this._supportedPath(parts, resolvedMethod[parts[0]]);
            }
        } else {
            //check entityProperties
            return false;
        }
    },
    _supportedMethods: {
        value: {
            'POST': { _isAllowed: true, $batchdelete: true },
            'GET': {
                _isAllowed: true, $count: true,
                _onNotSupported: function (parts) {
                    var entityType = this.entitySet.elementType;
                    if (parts.length === 1) {
                        var memDef = entityType.getMemberDefinition(parts[0]);
                        this.member.selectedField = memDef.name;
                        return !!memDef;
                    }
                    return false;
                }
            },
            'MERGE': true,
            'DELETE': true

        }
    },

    //helper
    parseUrlPart: function (urlPart, withoutConvert) {

        var p = urlPart.split('(');
        var ids;
        if (p.length > 1) {
            var p2 = p[1].split(')');
            p.splice(1, 1, p2[0], p2[1]);

            var pIds = p2[0].split(',');
            if (pIds.length > 1) {
                ids = {};
                for (var i = 0; i < pIds.length; i++) {
                    var idPart = pIds[i].split('=');
                    ids[idPart[0]] = idPart[1];
                }

            } else {
                ids = pIds[0];
            }
        }

        var eSet = this.context[p[0]];
        if (!eSet) return null;
        return result = {
            set: eSet,
            idObj: ids ? this.paramMapping(ids, eSet, withoutConvert) : undefined
        };
    },
    paramMapping: function (values, set, withoutConvert) {
        if (!values)
            return;

        var keyProps = set.elementType.memberDefinitions.getKeyProperties();
        result = {};

        for (var i = 0; i < keyProps.length; i++) {
            var memDef = keyProps[i];

            if (keyProps.length === 1) {
                var value = values;
            } else {
                var value = values[memDef.name];
            }

            //TODO converter
            var resolvedType = Container.resolveType(memDef.type);
            if (withoutConvert)
                result[memDef.name] = value;
            else
                result[memDef.name] = (resolvedType === $data.String || resolvedType === $data.ObjectID) ? value.slice(1, value.length - 1) : value;
        }

        return result;
    }
});