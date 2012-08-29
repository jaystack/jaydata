$data.Class.define('$data.JayService.OData.BatchProcessor', null, null, {
    constructor: function (context, baseUrl) {
        this.context = context;
        this.baseUrl = baseUrl;
        this.Q = require('q');
        this.queryHelper = require('qs');

        this.jsonReturnContentType = 'application/json;odata=verbose;charset=utf-8';
        this.jsonContentType = 'application/json';
        this.xmlContentType = 'application/atom+xml';
        this.multipartContentType = 'multipart/mixed';

        this.defaultResponseLimit = 100;
    },
    process: function (request, response) {
        //processRequest
        var self = this;
        var reqWrapper = {
            body: request.body,
            headers: request.headers
        }
        OData.batchServerHandler.read(reqWrapper, {});

        var idx = -1;
        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback();

        if (reqWrapper.data) {
            var batchRequests = reqWrapper.data.__batchRequests;
            var batchResult = [];

            var saveSuccess = function () {

                idx++;
                if (idx < batchRequests.length) {
                    if (batchRequests[idx].__changeRequests) {

                        self._processBatch(batchRequests[idx].__changeRequests, request, {
                            success: function (result) {
                                if (result) batchResult.push({ __changeRequests: result });
                                saveSuccess();
                            },
                            error: function () { cbWrapper.error(batchResult) }
                        });

                    } else {

                        self._processBatchRead(batchRequests, request, response, {
                            success: function (result) {
                                if (result) batchResult.push(result);
                                saveSuccess();
                            },
                            error: function () { cbWrapper.error(batchResult) }
                        });

                    }
                } else {
                    cbWrapper.success(batchResult);
                }
            }
            saveSuccess();

        } else {
            cbWrapper.error();
        }

        //processResponse
        return function () {
            var async = this;
            var responseData = {
                headers: {
                    'Content-Type': self.multipartContentType
                },
                data: {
                    __batchRequests: []
                }
            };

            self.Q.when(pHandler.getPromise()).then(function (batchRes) {
                //buildResponse
                for (var i = 0; i < batchRes.length; i++) {
                    var refData = batchRes[i];

                    if (refData.__changeRequests) {
                        responseData.data.__batchRequests.push({ __changeRequests: self._prepareBatch(refData.__changeRequests, request) });
                    } else {
                        for (var j = 0; j < refData.length; j++) {
                            responseData.data.__batchRequests.push(self._prepareBatchRead(refData[j], request));
                        }
                    }
                }

                OData.batchServerHandler.write(responseData, {});

                //writeheaders
                for (var name in responseData.headers) {
                    if (name.toLowerCase() !== 'content-type') {
                        response.setHeader(name, responseData.headers[name]);
                    }
                }
                response.statusCode = 202;
                var res = new $data.MultiPartMixedResult(responseData.body, responseData.batchBoundary);
                async.success(res);
            });
        }
    },

    _processBatch: function (changeRequests, request, callback) {
        var referenceData = {};

        for (var j = 0, l2 = changeRequests.length; j < l2; j++) {
            var changeRequest = changeRequests[j];

            //Refactor
            var setInfo = this.parseUrlPart(changeRequest.urlPart.replace(request.fullRoute, ''));
            var itemType = setInfo.set.elementType;

            var refId = changeRequest.headers['Content-Id'] || changeRequest.headers['content-id'] || changeRequest.headers['Content-ID'] || this.getRandom(itemType.name);
            referenceData[refId] = { requestObject: changeRequest };

            switch (changeRequest.method) {
                case 'POST':
                    var entity = new itemType(changeRequest.data);
                    referenceData[refId].resultObject = entity;
                    //discover navigations (__metadata.uri: "$n")
                    setInfo.set.add(entity);
                    break;
                case 'MERGE':
                    var entity = new itemType(changeRequest.data);
                    referenceData[refId].resultObject = entity;

                    //discover navigations (__metadata.uri: "$n")
                    setInfo.set.attach(entity);
                    entity.entityState = $data.EntityState.Modified;
                    break;
                case 'DELETE':
                    var entity = new itemType(setInfo.idObj);
                    referenceData[refId].resultObject = entity;
                    setInfo.set.remove(entity);
                    break;
                default:
                    break;
            }
        }

        return this.context.saveChanges({
            success: function () {
                callback.success(referenceData);
            },
            error: function () { callback.error(); }
        });
    },
    _processBatchRead: function (getBatchrequests, req, res, callback) {
        var getProcessor = new $data.JayService.OData.EntitySetProcessor('', this.context, { top: this.context.storageProvider.providerConfiguration.responseLimit || this.defaultResponseLimit });
        var reqPromises = [];

        getBatchrequests.forEach(function (getBatchrequest) {
            //for (var i = 0; i < getBatchrequests.length; i++) {
            //    var getBatchrequest = getBatchrequests[i];

            var batchUrl = getBatchrequest.urlPart.replace(req.fullRoute, '');
            var subReq = {
                url: batchUrl,
                method: 'GET',
                query: this._getQueryObject(batchUrl),
                headers: getBatchrequest.headers
            };

            var config = {
                version: 'V2',
                baseUrl: req.fullRoute,
                request: subReq,
                response: res,
                context: this.context.getType(),
                simpleResult: batchUrl.toLowerCase().indexOf('/$count') > 0
            };

            if (getProcessor.isSupported(subReq)) {
                var pHandler = new $data.PromiseHandler();
                var cbWrapper = pHandler.createCallback({ error: callback.error });

                getProcessor.ReadFromEntitySet(subReq, config, {
                    success: function (result) {
                        cbWrapper.success({
                            requestObject: getBatchrequest,
                            resultObject: result,
                            elementType: getProcessor.entitySet.elementType
                        });
                    },
                    error: cbWrapper.error
                });
                reqPromises.push(pHandler.getPromise());

            } else {
                callback.error();
            }
        }, this);


        if (reqPromises.length > 0) {
            this.Q.allResolved(reqPromises).then(function (data) {
                var promiseData = [];
                for (var i = 0; i < reqPromises.length; i++) {
                    promiseData.push(reqPromises[i].valueOf());
                }
                callback.success(promiseData);
            });
        } else {
            callback.success();
        }
    },
    _getQueryObject: function (url) {
        var paramIdx;
        if ((paramIdx = url.indexOf('?')) >= 0) {
            return this.queryHelper.parse(url.slice(paramIdx + 1));
        } else {
            return {};
        }
    },

    _prepareBatch: function (changedElements, request) {
        var responseData = [];
        var entityTransformer = new $data.oDataServer.EntityTransform(this.context.getType(), this.baseUrl);
        var entityXmlTransformer = new $data.oDataServer.EntityXmlTransform(this.context.getType(), this.baseUrl, { headers: request.headers });

        for (var contentId in changedElements) {
            var resItem = changedElements[contentId];

            var response = {
                headers: {
                    'Content-Id': contentId,
                    'X-Content-Type-Options': 'nosniff',
                    'Cache-Control': 'no-cache'
                }
            };

            switch (resItem.requestObject.method) {
                case "POST":
                    response.statusName = 'Created';
                    response.statusCode = 201;
                    var requestContentType = this._getHeaderValue(resItem.requestObject.headers, 'Accept') || this._getHeaderValue(resItem.requestObject.headers, 'Content-Type');
                    if (requestContentType.indexOf(this.xmlContentType) >= 0) {
                        this._transformItem(entityXmlTransformer, response, resItem, resItem.resultObject.getType());
                    } else {
                        this._transformItem(entityTransformer, response, resItem, resItem.resultObject.getType());
                    }
                    break;
                case "MERGE":
                case "DELETE":
                    response.statusName = 'No Content';
                    response.statusCode = 204;
                    break;
                default:
                    continue;
            }

            responseData.push(response);
        }
        return responseData;
    },
    _prepareBatchRead: function (data, request) {
        var entityTransformer = new $data.oDataServer.EntityTransform(this.context.getType(), this.baseUrl);
        var entityXmlTransformer = new $data.oDataServer.EntityXmlTransform(this.context.getType(), this.baseUrl, { headers: request.headers });


        var response = {
            headers: {
                'X-Content-Type-Options': 'nosniff',
                'Cache-Control': 'no-cache'
            },
            statusName: 'Ok',
            statusCode: 200
        }

        if (data.resultObject instanceof $data.ServiceResult) {
            response.headers['Content-Type'] = data.resultObject.contentType;
            response.data = data.resultObject.getData();
        } else {
            var requestContentType = this._getHeaderValue(data.requestObject.headers, 'Accept') || this._getHeaderValue(data.requestObject.headers, 'Content-Type');
            if (requestContentType.indexOf(this.jsonContentType) >= 0) {
                this._transformItem(entityTransformer, response, data, data.elementType);
            } else {
                this._transformItem(entityXmlTransformer, response, data, data.elementType);
            }
        }

        return response;
    },

    _transformItem: function (entityTransformer, responseObj, resItem, elementType) {
        var isSingle = !Array.isArray(resItem.resultObject);

        if (entityTransformer instanceof $data.oDataServer.EntityXmlTransform) {
            responseObj.data = entityTransformer.convertToResponse(resItem.resultObject, elementType);
            responseObj.headers['Content-Type'] = this.xmlContentType;
            if (isSingle)
                responseObj.headers['Location'] = entityTransformer.generateUri(resItem.resultObject, entityTransformer._getEntitySetDefByType(elementType));
        } else {
            if (isSingle) {
                responseObj.data = { d: entityTransformer.convertToResponse([resItem.resultObject], elementType)[0] };
                responseObj.headers['Location'] = responseObj.data.d.__metadata.url;
            } else {
                responseObj.data = { d: entityTransformer.convertToResponse(resItem.resultObject, elementType) };
            }
            responseObj.headers['Content-Type'] = this.jsonReturnContentType;
        }
    },

    _getContentType: function (headers) {
        return headers['Content-Type'] || headers['content-type'] || '';
    },
    _getHeaderValue: function (headers, name) {
        for (var key in headers) {
            if (key.toLowerCase() === name.toLowerCase())
                return headers[key];
        }
        return '';
    },
    getRandom: function (prefix) {
        return prefix + Math.random() + Math.random();
    },
    parseUrlPart: function (urlPart) {
        if (urlPart.indexOf('/') === 0)
            urlPart = urlPart.slice(1);

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
        return result = {
            set: eSet,
            idObj: this.paramMapping(ids, eSet)
        };
    },
    paramMapping: function (values, set) {
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
            result[memDef.name] = (resolvedType === $data.String || resolvedType === $data.ObjectID) ? value.slice(1, value.length - 1) : value;
        }

        return result;
    }
}, {
    connectBodyReader: function (req, res, next) {
        var contentType = req.headers['content-type'];
        if (contentType && contentType.indexOf('multipart/mixed') >= 0) {
            req.body = '';
            req.on('data', function (chunk) {
                req.body += chunk.toString();
            });
            req.on('end', function (chunk) {
                next();
            });
        } else {
            next();
        }
    }
});
