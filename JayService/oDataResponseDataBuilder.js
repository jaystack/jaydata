$data.Class.define('$data.oDataServer.oDataResponseDataBuilder', null, null, {
    constructor: function (cfg) {
        ///	<signature>
        ///     <summary>Transform class for standard OData JSON verbose format</summary>
        ///     <description>Transform class for standard OData JSON verbose format</description>
        ///     <param name="config" type="Object">
        ///         property            type                    required                description
        ///         -------------------------------------------------------------------------------
        ///         version             String                  true                    Response OData version
        ///         context             $data.EntityContext     true                    Context instance
        ///         baseUrl             String                  true                    Service Url
        ///         simpleResult        Boolean                 true                    true: skip transform
        ///     
        ///         collectionName      String                  if entitySet            EntitySet name
        ///         selectedFields      Array                   if entitySet            Fields for result
        ///         includes            Array                   if entitySet            Navigation property includes
        ///         singleResult        Boolean                 if entitySet            Single entity result
        ///     
        ///         ---- or ----
        ///     
        ///         methodConfig,       Object                  if Functionimport       Method config
        ///         {
        ///           serviceOpName     String                  if Functionimport       Service function name
        ///           returnType        function                if Functionimport       Method return type
        ///           elementType       function                and if Array result     Element type if return type is Collection
        ///         }
        ///         methodName          String                  if Functionimport       Method name
        ///     }
        ///     </param>
        /// </signature>

        this.config = $data.typeSystem.extend({
            version: 'V2'
        }, cfg);
        this.transform = new $data.oDataServer.EntityTransform(this.config.context, this.config.baseUrl);
    },
    convertToResponse: function (data) {
        ///	<signature>
        ///     <summary>Transform data for standard OData JSON verbose format</summary>
        ///     <description>Transform data for standard OData JSON verbose format</description>
        ///     <param name="data">Value for convert</param>
        ///     <return type="Object" />
        /// </signature>

        if (this.config.simpleResult)
            return data;

        if (this.config.methodConfig) {
            if (!this.config.methodConfig.returnType)
                return undefined;
            
            data = $data.Container.convertTo(data, Container.resolveType(this.config.methodConfig.returnType) === $data.Queryable ? $data.Array : this.config.methodConfig.returnType, this.config.methodConfig.elementType);
            
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
            var converter = this.transform.converter.fromDb[Container.resolveName(methodCfg.returnType)];
            var result = { d: {} };
            result.d[methodCfg.serviceOpName || this.config.methodName] = converter ? converter(data) : data;
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

            var converter = this.transform.converter.fromDb[Container.resolveName(rType)];
            var result = { d: {} };
            result.d[methodCfg.serviceOpName || this.config.methodName] = converter ? converter(data) : data;
            return result;
        }
    },
    _convertData: function (data, elementType, versionSelector, isSingleData) {
        //var transform = new $data.oDataServer.EntityTransform(this.config.context, this.config.baseUrl);
        if (isSingleData)
            data = [data];

        var result = this.transform.convertToResponse(
            data,
            elementType || this.config.collectionName,
            this.config.selectedFields,
            this.config.includes);

        if (isSingleData)
            result = result[0];

        if (versionSelector || versionSelector === undefined) {
            return this._buildVersionPath(result, data);
        } else {
            return result;
        }
    },
    _buildVersionPath: function (result, data) {
        if (this.config.version === 'V1'){
            return { d: result };
        }else{
            var ret = { d: { results: result } };
            if (data && typeof data.totalCount == 'number'){
                ret.d.__count = data.totalCount;
            }
            return ret;
            //return { d: { results: result, __count: result.totalCount || result.length } };
        }
    }
});
