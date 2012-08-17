$data.Class.define('$data.JayService.OData.EntitySetProcessor', null, null, {
    constructor: function (req, context) {
        this.request = req;
        this.context = context;
    },
    process: function (memberName, entitySet, config) {
        var self = this;

        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback();


        switch (this.request.method) {
            case 'POST': //C
                cbWrapper.success(0);

                break;
            case 'GET': //R
                config.context = self.context.getType();
                config.countRequest = memberName.indexOf('/$Count') > 0;
                self.ReadFromEntitySet(entitySet, config, cbWrapper);
                break;
            case 'MERGE': //U
                cbWrapper.success(0);
                break;
            case 'DELETE': //D
                cbWrapper.success(0);
                break;
            default:
                cbWrapper.error(0);
                break;
        }

        return pHandler.getPromise();
    },
    ReadFromEntitySet: function (entitySet, config, callback) {
        var builder = new $data.oDataParser.ODataEntityExpressionBuilder(this.context, entitySet.name);
        var result = builder.parse({
            count: config.countRequest,
            filter: this.request.query.$filter || '',
            orderby: this.request.query.$orderby || '',
            select: this.request.query.$select || '',
            skip: this.request.query.$skip || '',
            top: this.request.query.$top || '',
            expand: this.request.query.$expand || ''
        });

        config.collectionName = entitySet.name;
        config.selectedFields = result.selectedFields;
        config.includes = result.includes;

        this.context.executeQuery(new $data.Queryable(entitySet, result.expression), callback);
    }
});