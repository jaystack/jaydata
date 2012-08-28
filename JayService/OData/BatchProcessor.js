$data.Class.define('$data.JayService.OData.BatchProcessor', null, null, {
    constructor: function (context, baseUrl) {
        this.context = context;
        this.baseUrl = baseUrl;
        this.Q = require('q');

        this.jsonContentType = 'application/json;odata=verbose;charset=utf-8';
        this.xmlContentType = 'application/atom+xml';
        this.multipartContentType = 'multipart/mixed';
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

            var saveSuccess = function (result) {
                if (result) batchResult.push(result);

                idx++;
                if (idx < batchRequests.length) {
                    self._processBatch(batchRequests[idx].__changeRequests, request, { success: saveSuccess, error: function () { cbWrapper.error(batchResult) } });
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

                    var changeRequests = self._prepareBatch(refData, request);
                    responseData.data.__batchRequests.push({
                        __changeRequests: changeRequests
                    });
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
                    //response.data = { d: entityTransformer.convertToResponse([resItem.resultObject], resItem.resultObject.getType())[0] };
                    //response.headers['Content-Type'] = this.jsonContentType;
                    //response.headers['Location'] = response.data.d.__metadata.url;
                    var requestContentType = this._getContentType(resItem.requestObject.headers);
                    if (requestContentType.indexOf(this.xmlContentType) >= 0) {
                        this._transformItem(entityXmlTransformer, response, resItem);
                    } else {
                        this._transformItem(entityTransformer, response, resItem);
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
    _transformItem: function (entityTransformer, responseObj, resItem) {
        if (entityTransformer instanceof $data.oDataServer.EntityXmlTransform) {
            responseObj.data = entityTransformer.convertToResponse(resItem.resultObject, resItem.resultObject.getType());
            responseObj.headers['Content-Type'] = this.xmlContentType;
            responseObj.headers['Location'] = entityTransformer.generateUri(resItem.resultObject, entityTransformer._getEntitySetDefByType(resItem.resultObject.getType()));
        } else {
            responseObj.data = { d: entityTransformer.convertToResponse([resItem.resultObject], resItem.resultObject.getType())[0] };
            responseObj.headers['Content-Type'] = this.jsonContentType;
            responseObj.headers['Location'] = responseObj.data.d.__metadata.url;
        }
    },

    _getContentType: function (headers) {
        return headers['Content-Type'] || headers['content-type'] || '';
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
