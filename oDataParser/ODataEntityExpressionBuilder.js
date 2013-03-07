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
            var path = this._getMemberPath(exprObjArray[i]);
            if (!exprObjArray[i].omitSelectedField && this.selectedFields.indexOf(path) < 0){
                this.selectedFields.push(path);
            }
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
    expandConverter: function (exprObjArray, rootExpr, req) {
        //includesFields
        for (var i = 0; i < exprObjArray.length; i++) {
            var path = this._getMemberPath(exprObjArray[i]);
            this.includes.push(path);
            if (req['select'] && Array.isArray(req['select'])){
                var parts = path.split('.');
                var expressionBuilder = new $data.oDataParser.RequestExpressionBuilder();
                var expression = expressionBuilder.buildMemberPath([parts[0]]);
                expression.omitSelectedField = true;
                req['select'].push(expression);
                var type = this.scopeContext[this.entitySetName].elementType;
                for (var j = 0; j < parts.length; j++){
                    var member = type.memberDefinitions.getMember(parts[j]);
                    if (member){
                        type = Container.resolveType(member.elementType || member.type);
                    }else{
                        type = null;
                        break;
                    }
                }
                if (type && type.memberDefinitions){
                    var entityKeys = type.memberDefinitions.getKeyProperties();
                    for (var j = 0; j < entityKeys.length; j++) {
                        if (this.selectedFields.indexOf(path + '.' + entityKeys[j].name) < 0) {
                            var expression = expressionBuilder.buildMemberPath(parts.concat(entityKeys[j].name));
                            expression.omitSelectedField = true;
                            req['select'].push(expression);
                        }
                    }
                }
            }
        }

        return $data.oDataParser.EntityExpressionBuilder.prototype.expandConverter.apply(this, arguments);
    }
});
