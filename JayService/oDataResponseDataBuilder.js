$data.Class.define('$data.oDataServer.oDataResponseDataBuilder', null, null, {
    constructor: function (cfg) {
        this.config = $data.typeSystem.extend({
            version: 'V2'
            //context
            //baseUrl
            //simpleResult

            //collectionName
            //selectedFields
            //includes
            //singleResult

            //or

            //methodConfig,
            //{ 
            //  returnType
            //  serviceOpName
            //  elementType
            //}
            //methodName

        }, cfg);
    },
    convertToResponse: function (data) {
        if (this.config.simpleResult)
            return data;

        if (this.config.methodConfig) {
            if (!this.config.methodConfig.returnType)
                return undefined;

            if (typeof this.config.context.isAssignableTo === 'function' && this.config.context.isAssignableTo($data.Base)) {
                return this._convertJayDataFunction(data);
            } else {
                return this._convertFunction(data);
            }
        } else if (this.config.collectionName) {
            if (this.config.singleResult) {
                return { d: this._convertData(data, undefined, false, true) };
            } else {
                return this._convertData(data);
            }
        }
    },
    _convertFunction: function (data) {
        var methodCfg = this.config.methodConfig;
        if (Container.resolveType(methodCfg.returnType) === $data.Array && methodCfg.elementType) {
            return this._buildVersionPath(data);
        } else {
            var result = { d: {} };
            result.d[methodCfg.serviceOpName || this.config.methodName] = data;
            return result;
        }
    },
    _convertJayDataFunction: function (data) {
        var methodCfg = this.config.methodConfig;
        if (!methodCfg.returnType)
            return undefined;

        var rType = Container.resolveType(methodCfg.returnType);
        if (rType === $data.Array || (typeof rType.isAssignableTo === 'function' && rType.isAssignableTo($data.Queryable))) {
            var elementType = Container.resolveType(methodCfg.elementType);
            var entitySets = this.config.context.memberDefinitions.getPublicMappedProperties();
            for (var i = 0; i < entitySets.length; i++) {
                var memDef = entitySets[i];
                var memDefType = Container.resolveType(memDef.type);
                if (typeof memDefType.isAssignableTo === 'function' && memDefType.isAssignableTo($data.EntitySet) && Container.resolveType(memDef.elementType) === elementType) {
                    //entitySet type
                    return this._convertData(data, elementType);
                }
            }

            if (typeof elementType.isAssignableTo === 'function' && elementType.isAssignableTo($data.Entity)) {
                //complexType
                return this._convertData(data, elementType);
            } else {
                //primitiveType
                return this._buildVersionPath(data);
            }
        } else {
            if (typeof rType.isAssignableTo === 'function' && rType.isAssignableTo($data.Entity))
                data = this._convertData(data, rType, false, true);

            var result = { d: {} };
            result.d[methodCfg.serviceOpName || this.config.methodName] = data;
            return result;
        }
    },
    _convertData: function (data, elementType, versionSelector, isSingleData) {
        var transform = new $data.oDataServer.EntityTransform(this.config.context, this.config.baseUrl);
        if (isSingleData)
            data = [data];

        var result = transform.convertToResponse(
            data,
            elementType || this.config.collectionName,
            this.config.selectedFields,
            this.config.includes);

        if (isSingleData)
            result = result[0];

        if (versionSelector || versionSelector === undefined) {
            return this._buildVersionPath(result);
        } else {
            return result;
        }
    },
    _buildVersionPath: function (result) {
        if (this.config.version === 'V1')
            return { d: result };
        else
            return { d: { results: result, __count: result.length } };
    }
});