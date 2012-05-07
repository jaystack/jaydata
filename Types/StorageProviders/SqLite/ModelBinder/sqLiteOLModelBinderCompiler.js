$C('$data.sqLite.sqLiteOLModelBinderCompiler', $data.sqLite.sqLiteEFModelBinderCompiler, null, {
    compile: function (expression, context) {
        context.mappingObject = { from: "", includes: null };
        //context.currentConverter = { keys: [SqlStatementBlocks.rowIdName], mapping: {} };
        //context.converter.push(context.currentConverter);
        var buildType = { op: "buildType", context: null, logicalType: null, tempObjectName: "d", propertyMapping: [] };
        context.buildType = buildType;
        context.actionPack = [];
        context.actionPack.push(buildType);
        context.actionPack.push({ op: "copyToResult", tempObjectName: "d" });

        this.Visit(expression, context);
    },
    VisitObjectLiteralExpression: function (expression, context) {
        var objectLiteralPath = context.mappingObject.to;

        //if (context.currentObjectFieldName) {
        //    delete context.currentConverter.mapping[context.currentObjectFieldName]
        //}
        var keyName = (context.currentObjectFieldName ? context.currentObjectFieldName + '__' : '') + SqlStatementBlocks.rowIdName;
        context.currentConverter = { keys: [keyName], propertyType:'object', mapping: {} };
        context.converter.push(context.currentConverter);


        expression.members.forEach(function (objectField) {
            this.Visit(objectField, context);
            if (context.mappingObject.from) {
                context.buildType.propertyMapping.push(context.mappingObject);
            }
            context.mappingObject = { from: "", to: objectLiteralPath, includes: null };
        }, this);

    },
    VisitObjectFieldExpression: function (expression, context) {
        context.hasEntityField = false;
        context.previousObjectFieldName = context.currentObjectFieldName;
        context.currentObjectFieldName = expression.fieldName;

        if (context.mappingObject.to) {
            context.currentConverter.propertyName = context.mappingObject.to;
        }
        if (context.mappingObject.to) { context.mappingObject.to += '.' + expression.fieldName } else { context.mappingObject.to = expression.fieldName };

        if (!(expression.expression instanceof $data.Expressions.ObjectLiteralExpression) && !(expression.expression instanceof $data.Expressions.EntityExpression)) {
            if (context.previousObjectFieldName) {
                context.currentConverter.mapping[expression.fieldName] = context.previousObjectFieldName + "__" + expression.fieldName;
            } else {
                context.currentConverter.mapping[expression.fieldName] = expression.fieldName;
            }
        }
        if (expression.expression instanceof $data.Expressions.EntityExpression) {
            var tempConverter = context.currentConverter;
            context.currentConverter = { keys: tempConverter.keys, propertyType:'object', propertyName: expression.fieldName, mapping: {} };
            context.converter.push(context.currentConverter);
            this.Visit(expression.expression, context);
            context.currentConverter = tempConverter;
        } else {
            this.Visit(expression.expression, context);
        }
        context.currentObjectFieldName = context.previousObjectFieldName;
    },
    VisitMemberInfoExpression: function (expression, context) {
        if (context.mappingObject.from) {
            context.mappingObject.from += ".";
        }
        context.mappingObject.from += context.mappingObject.to;//expression.memberName;
        context.mappingObject.dataType = expression.memberDefinition.dataType;
    },
    VisitComplexTypeExpression: function (expression, context) {
        this.Visit(expression.source, context);
        context.mappingObject.type = expression.selector.memberDefinition.storageModel.ComplexTypes[expression.selector.memberName].ToType;
        if (context.mappingObject.from) {
            context.mappingObject.from += ".";
        }
        context.mappingObject.from += expression.selector.memberName;
        context.mappingObject.includes = null;
    },
    VisitSimpleBinaryExpression: function (expression, context) {
        var t = context.mappingObject.to;
        this.Visit(expression.left, context);
        this.Visit(expression.right, context);
        context.mappingObject.from = t;
        context.mappingObject.dataType = null;
    }
});