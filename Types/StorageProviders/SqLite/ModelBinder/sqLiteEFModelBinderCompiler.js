$C('$data.sqLite.sqLiteEFModelBinderCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    compile: function (expression, context) {
        context.mappingObject = { from: "", includes: null };
        context.currentConverter = { keys: [SqlStatementBlocks.rowIdName], propertyType:'object', mapping: {} };
        context.converter.push(context.currentConverter);
        var buildType = { op: "buildType", context: null, logicalType: null, tempObjectName: "d", propertyMapping: [context.mappingObject] };
        context.buildType = buildType;
        context.actionPack = [];
        context.actionPack.push(buildType);
        context.actionPack.push({ op: "copyToResult", tempObjectName: "d" });

        this.Visit(expression, context);
    },
    VisitEntityFieldExpression: function (expression, context) {
        context.hasEntityField = true;
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
        context.mappingObject.type = undefined;
        context.mappingObject.includes = null;
        context.hasEntityField = false;
    },
    VisitMemberInfoExpression: function (expression, context) {
        if (context.mappingObject.from) {
            context.mappingObject.from += ".";

        }
        context.mappingObject.from += SqlStatementBlocks.scalarFieldName;//expression.memberName;
        context.currentConverter.mapping[SqlStatementBlocks.scalarFieldName] = SqlStatementBlocks.scalarFieldName;
        context.mappingObject.dataType = expression.memberDefinition.dataType;
    },
    VisitEntityExpression: function (expression, context) {
        if (!context.hasEntityField) {
            context.mappingObject.dataType = null;
            context.mappingObject.from = context.currentObjectFieldName ? context.currentObjectFieldName : 'd';
            var complexTypeNames = [];
            expression.storageModel.ComplexTypes.forEach(function (complexType) {
                var complexTypeConverter = { keys: context.currentConverter.keys, propertyType:'object', propertyName: complexType.FromPropertyName, mapping: {} };
                var cTypeName = complexType.From;
                complexType.ReferentialConstraint.forEach(function (refConst) {
                    complexTypeNames.push(refConst[cTypeName]);
                    complexTypeConverter.mapping[refConst[complexType.To]] = refConst[cTypeName];
                }, this);
                context.converter.push(complexTypeConverter);
            }, this);

            expression.storageModel.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
                if (complexTypeNames.indexOf(memDef.name) < 0) {
                    if (context.currentObjectFieldName) {
                        context.currentConverter.mapping[memDef.name] = context.currentObjectFieldName + "__" + memDef.name;
                    } else {
                        context.currentConverter.mapping[memDef.name] = memDef.name;
                    }
                }
            }, this);
        }
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