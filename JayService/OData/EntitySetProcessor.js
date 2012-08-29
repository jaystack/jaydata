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
                        var bodyData = req.body;
                        var bodyContentType = $data.JayService.OData.Utils.getHeaderValue(req.headers, 'Content-Type');
                        if (bodyContentType.indexOf($data.JayService.OData.Defaults.jsonContentType) === -1) {
                            bodyData = this._readXmlBody(bodyData, req.headers);
                        }

                        config.collectionName = this.entitySet.name;
                        config.context = self.context.getType();
                        config.singleResult = true;

                        var entity = new this.entitySet.createNew(bodyData);
                        this.entitySet.add(entity);
                        this.context.saveChanges(function () {
                            res.statusCode = 201;
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
                        var bodyData = req.body;
                        var bodyContentType = $data.JayService.OData.Utils.getHeaderValue(req.headers, 'Content-Type');
                        if (bodyContentType.indexOf($data.JayService.OData.Defaults.jsonContentType) === -1) {
                            bodyData = this._readXmlBody(bodyData, req.headers);
                        }

                        var entity = new this.entitySet.createNew(bodyData);
                        this.entitySet.attach(entity);
                        entity.entityState = $data.EntityState.Modified;
                        this.context.saveChanges(function () {
                            res.statusCode = 204;
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
                                res.statusCode = 204;
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
                    callback.success(contextResult, config);
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
    _readXmlBody: function (body, headers) {
        var reqWrapper = { body: body, headers: headers }
        OData.atomHandler.read(reqWrapper);
        return reqWrapper.data;
    },

    BatchDeleteFromEntitySet: function (req, config, callback) {
        var builder = new $data.oDataParser.ODataEntityExpressionBuilder(this.context, this.entitySet.name);
        var result = builder.parse({
            frame: $data.Expressions.ExpressionType.BatchDelete,
            filter: req.query.$filter || '',
            //orderby: req.query.$orderby || '',
            //select: req.query.$select || '',
            //skip: req.query.$skip || '',
            //top: req.query.$top || '',
            //expand: req.query.$expand || ''
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
            var requestInfo = $data.JayService.OData.Utils.parseUrlPart(parts[0], this.context, req.method === 'GET');
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
            'POST': true,
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
            'DELETE': { _isAllowed: true, $batchDelete: true }

        }
    }
});