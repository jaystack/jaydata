$C('$data.oData.oDataEFModelBinderCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    compile: function (expression, context) {
        context.mappingObject = { from: "", includes:null };
        var buildType = { op: "buildType", context: null, logicalType: null, tempObjectName: "d", propertyMapping: [context.mappingObject] };
        context.buildType = buildType;
        context.actionPack = [];
        context.actionPack.push(buildType);
        context.actionPack.push({ op: "copyToResult", tempObjectName: "d" });

        this.Visit(expression, context);
    },
    VisitEntityFieldExpression: function (expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
        context.mappingObject.type = undefined;
        context.mappingObject.includes = null;
    },
    VisitMemberInfoExpression: function (expression, context) {
        if (context.mappingObject.from) {
            context.mappingObject.from += ".";
        }
        context.mappingObject.from += expression.memberName;
        context.mappingObject.dataType = expression.memberDefinition.dataType;
    },
    VisitEntityExpression: function (expression, context) {
        this.Visit(expression.source, context);
        context.mappingObject.type = expression.storageModel.LogicalType;
        if (expression.storageModel.ComplexTypes.length > 0) {
            context.mappingObject.includes = expression.storageModel.ComplexTypes.map(function (cType) { return { name: cType.FromPropertyName, type: cType.ToType } }, this);
        }
        this.Visit(expression.selector, context);
    },
    VisitEntitySetExpression: function (expression, context) {
        if (expression.selector instanceof $data.Expressions.AssociationInfoExpression) {
            this.Visit(expression.source, context);
            this.Visit(expression.selector, context);
        } else {
            context.buildType.context = expression.instance.entityContext;
        }
    },
    VisitAssociationInfoExpression: function (expression, context) {
        if (context.mappingObject.from) {
            context.mappingObject.from += ".";
        }
        context.mappingObject.from += expression.associationInfo.FromPropertyName;
    }
});