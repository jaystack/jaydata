$C('$data.oData.oDataOLModelBinderCompiler', $data.oData.oDataEFModelBinderCompiler, null, {
    compile: function (expression, context) {
        context.mappingObject = { from: "", includes:null };
        var buildType = { op: "buildType", context: null, logicalType: null, tempObjectName: "d", propertyMapping: [] };
        context.buildType = buildType;
        context.actionPack = [];
        context.actionPack.push(buildType);
        context.actionPack.push({ op: "copyToResult", tempObjectName: "d" });

        this.Visit(expression, context);
    },
    VisitObjectLiteralExpression: function (expression, context) {
        var objectLiteralPath = context.mappingObject.to;
        expression.members.forEach(function (objectField) {
            this.Visit(objectField, context);
            if (context.mappingObject.from) {
                context.buildType.propertyMapping.push(context.mappingObject);
            }
            context.mappingObject = { from: "", to: objectLiteralPath, includes:null };
        }, this);
    },
    VisitObjectFieldExpression: function (expression, context) {
        if (context.mappingObject.to) { context.mappingObject.to += '.' + expression.fieldName } else { context.mappingObject.to = expression.fieldName };
        this.Visit(expression.expression, context);
    },
    VisitComplexTypeExpression: function (expression, context) {
        this.Visit(expression.source, context);
        context.mappingObject.type = expression.selector.memberDefinition.storageModel.ComplexTypes[expression.selector.memberName].ToType;
        if (context.mappingObject.from) {
            context.mappingObject.from += ".";
        }
        context.mappingObject.from += expression.selector.memberName;
        context.mappingObject.includes = null;
    }
});