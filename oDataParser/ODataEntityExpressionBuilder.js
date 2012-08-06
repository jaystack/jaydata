$data.Class.define('$data.oDataParser.ODataEntityExpressionBuilder', $data.oDataParser.EntityExpressionBuilder, null, {
    parse: function (queryParams) {
        ///<param name="queryParams" type="Object">{ filter: expression, orderby: [{}] }</param>

        var req = new $data.oDataParser.QueryRequest();
        req = $data.typeSystem.extend(req, queryParams);
        var parser = new $data.oDataParser.RequestParser();
        parser.parse(req);

        this.selectedFields = [];
        this.includes = [];

        return { expression: this.buildExpression(req), selectedFields: this.selectedFields, includes: this.includes };
    },
    selectConverter: function (exprObjArray, rootExpr) {
        var setElementType = this.scopeContext[this.entitySetName].elementType;

        //selectedFields
        for (var i = 0; i < exprObjArray.length; i++) {
            this.selectedFields.push(this._getMemberPath(exprObjArray[i]));
        }

        var expressionBuilder = new $data.oDataParser.RequestExpressionBuilder();
        var entityKeys = setElementType.memberDefinitions.getKeyProperties();
        for (var i = 0; i < entityKeys.length; i++) {
            if (this.selectedFields.indexOf(entityKeys[i].name) < 0) {
                exprObjArray.push(expressionBuilder.buildMemberPath([entityKeys[i].name]));
            }
        }

        return $data.oDataParser.EntityExpressionBuilder.prototype.selectConverter.apply(this, [exprObjArray, rootExpr]);
    },
    expandConverter: function (exprObjArray, rootExpr) {
        //includesFields
        for (var i = 0; i < exprObjArray.length; i++) {
            this.includes.push(this._getMemberPath(exprObjArray[i]));
        }

        return $data.oDataParser.EntityExpressionBuilder.prototype.expandConverter.apply(this, arguments);
    }
});