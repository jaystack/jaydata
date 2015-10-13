$C('$data.storageProviders.oData.oDataProjectionCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (entityContext) {
        this.entityContext = entityContext;
        this.hasObjectLiteral = false;
        this.ObjectLiteralPath = "";
        this.modelBinderMapping = [];
    },

    compile: function (expression, context) {
        this.Visit(expression, context);
    },
    VisitProjectionExpression: function (expression, context) {
        ///<summary></summary>
        ///<param name="expression" type="$data.Expressions.ProjectionExpression" mayBeNull="false"></param>
        ///<param name="context" mayBeNull="false"></param>
        context.data = "";
        this.mapping = "";

        this.Visit(expression.selector, context);
        if (context['$select']) { context['$select'] += ','; } else { context['$select'] = ''; }
        context["$select"] += context.data;
        context.data = "";
    },
    VisitParametricQueryExpression: function (expression, context) {
        this.Visit(expression.expression, context);
        if (expression.expression instanceof $data.Expressions.EntityExpression || expression.expression instanceof $data.Expressions.EntitySetExpression) {
            if (context['$expand']) { context['$expand'] += ','; } else { context['$expand'] = ''; }
            context['$expand'] += this.mapping.replace(/\./g, '/')
        } if (expression.expression instanceof $data.Expressions.ComplexTypeExpression) {
            var m = this.mapping.split('.');
            m.pop();
            if (m.length > 0) {
                if (context['$expand']) { context['$expand'] += ','; } else { context['$expand'] = ''; }
                context['$expand'] += m.join('/');
            }
        } else {
            var m = this.mapping.split('.');
            m.pop();
            if (m.length > 0) {
                if (context['$expand']) { context['$expand'] += ','; } else { context['$expand'] = ''; }
                context['$expand'] += m.join('/');
            }
        }
    },
    VisitObjectLiteralExpression: function (expression, context) {
        ///<summary></summary>
        ///<param name="expression" type="$data.Expressions.ObjectLiteralExpression" mayBeNull="false"></param>
        ///<param name="context" mayBeNull="false"></param>
        var tempObjectLiteralPath = this.ObjectLiteralPath;
        this.hasObjectLiteral = true;
        expression.members.forEach(function (member, index) {
            this.Visit(member, context);
            if (index < expression.members.length - 1) { context.data += ','; }
            this.mapping = '';
        }, this);
        this.ObjectLiteralPath = tempObjectLiteralPath;
    },
    VisitObjectFieldExpression: function (expression, context) {


        if (this.ObjectLiteralPath) { this.ObjectLiteralPath += '.' + expression.fieldName; } else { this.ObjectLiteralPath = expression.fieldName; }
        this.Visit(expression.expression, context);

        if (expression.expression instanceof $data.Expressions.EntityExpression || expression.expression instanceof $data.Expressions.EntitySetExpression) {
            if (context['$expand']) { context['$expand'] += ','; } else { context['$expand'] = ''; }
            context['$expand'] += this.mapping.replace(/\./g, '/')
        } else {
            var m = this.mapping.split('.');
            m.pop();
            if (m.length > 0) {
                if (context['$expand']) { context['$expand'] += ','; } else { context['$expand'] = ''; }
                context['$expand'] += m.join('/');
            }
        }
    },

    VisitComplexTypeExpression: function (expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
    },
    
    VisitEntityFieldExpression: function (expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
    },
    VisitEntityExpression: function (expression, context) {
        ///<summary></summary>
        ///<param name="expression" type="$data.Expressions.EntityExpression" mayBeNull="false"></param>
        ///<param name="context" mayBeNull="false"></param>
        this.Visit(expression.source, context);
    },
    VisitEntitySetExpression: function (expression, context) {
        ///<summary></summary>
        ///<param name="expression" type="$data.Expressions.EntitySetExpression" mayBeNull="false"></param>
        ///<param name="context" mayBeNull="false"></param>
        if (expression.source instanceof $data.Expressions.EntityExpression) {
            this.Visit(expression.source, context);
        }
        if (expression.selector instanceof $data.Expressions.AssociationInfoExpression) {
            this.Visit(expression.selector, context);
        }
    },
    VisitAssociationInfoExpression: function (expression, context) {
        if (context.data && context.data.length > 0 && context.data[context.data.length - 1] != ',') { context.data += '/'; }
        context.data += expression.associationInfo.FromPropertyName;
        if (this.mapping && this.mapping.length > 0) { this.mapping += '.'; }
        this.mapping += expression.associationInfo.FromPropertyName;
    },
    VisitMemberInfoExpression: function (expression, context) {
        if (context.data && context.data.length > 0 && context.data[context.data.length - 1] != ',') { context.data += '/'; }
        context.data += expression.memberName;
        if (this.mapping && this.mapping.length > 0) { this.mapping += '.'; }
        this.mapping += expression.memberName;
    },
    VisitConstantExpression: function (expression, context) {
        //Guard.raise(new Exception('Constant value is not supported in Projection.', 'Not supported!'));
        //context.data += expression.value;
		context.data = context.data.slice(0, context.data.length - 1);
    }
});