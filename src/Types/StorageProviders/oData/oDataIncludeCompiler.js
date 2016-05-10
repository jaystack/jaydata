import $data, { $C, Guard, Container, Exception, MemberDefinition } from 'jaydata/core';

export class ODataIncludeFragment {
    constructor (name) {
        this.name = name;
        this.$expand = [];
        this.$operators = [];
    }
    
    toString(){
        let data = '';
        if(this.$expand.length){
            if(this.name){
                data += this.name + '($expand=';
            }
            for(let i = 0; i < this.$expand.length; i++){
                if(i !== 0) data += ',';
                data += this[this.$expand[i]].toString();
            }
            if(this.name) {
                data += ')';
            }
        }
        
        if(this.name){
            for (let i = 0; i < this.$operators.length; i++) {
                let operator = this.$operators[i];
                let values = this[operator];
                for(let j = 0; j < values.length; j++){
                    if(data) data += ','
                    data += this.name + '(' + operator + '='
                    data += values[j];
                    data += ')';
                }
            }    
        }
        
        if(this.name && !data) {
            data = this.name;
        }
        
        return data;
    }
    
    addInclude(path, map){
        this._createIncludePath(path);
    }
    
    addImplicitMap(path, map){
        var includedFragment = this._createIncludePath(path);
        this._setImplicitMap(includedFragment, map);
    }
    
    _createIncludePath(path) {
        if(!path) return this;
        var inc = path.split('.');
        
        var current = this;
        for(var i = 0; i < inc.length; i++){
            var it = inc[i];
            var included = true;
            if(current.$expand.indexOf(it) < 0){
                included = false;
                current.$expand.push(it);
                current[it] = new ODataIncludeFragment(it);
                current[it].__implicit = true;
            }
            
            current = current[it];
            if(i < inc.length - 1 && current.__implicit){
                this._setImplicitMap(current, inc[i+1]);
            }
        }
        
        return current;
    }
    _setImplicitMap(includeFragment, map){
        if(map){
            if (includeFragment.$operators.indexOf('$select') < 0) {
                if(includeFragment.__implicit) {
                    includeFragment.$operators.push('$select');
                    includeFragment.$select = [map];
                }
            } else if(includeFragment.$expand.indexOf(map) < 0) {
                includeFragment.$select[0] += ',' + map;
            }
        }
    }
}

$data.storageProviders.oData.ODataIncludeFragment = ODataIncludeFragment;

$C('$data.storageProviders.oData.oDataIncludeCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (provider) {
        this.provider = provider;
    },

    compile: function (expression, context) {
        context.data = context.data || new ODataIncludeFragment();
        context.current = context.data;
        this.Visit(expression, context);
        
    },
    VisitParametricQueryExpression: function (expression, context) {
        this.Visit(expression.expression, context);
    },
    
    VisitEntitySetExpression: function (expression, context) {
        this.Visit(expression.source, context);
        if (expression.selector instanceof $data.Expressions.AssociationInfoExpression) {
            this.Visit(expression.selector, context);
        }
    },
    
    VisitAssociationInfoExpression: function (expression, context) {
        var propName = expression.associationInfo.FromPropertyName;
        
        this.includePath = this.includePath ? (this.includePath + '.') : "";
        this.includePath += propName;

        var currentPath = this.includePath;
        if (!context.includes.some(function (include) { return include.name == currentPath }, this)) {
            context.includes.push({ name: currentPath, type: expression.associationInfo.ToType });
        }
        
        if(context.current.$expand.indexOf(propName) < 0)
        {
            context.current.$expand.push(propName);
            context.current[propName] = new ODataIncludeFragment(propName);
        }
        context.current = context.current[propName]; 
    },
    
    VisitFrameOperationExpression: function (expression, context) {
        this.Visit(expression.source, context);
        
        var opDef = expression.operation.memberDefinition;
        if(opDef && opDef.includeFrameName){
            var opName = opDef.includeFrameName;
            var paramCounter = 0;
            var params = opDef.parameters || [{ name: "@expression" }];

            var args = params.map(function (item, index) {
                if (item.name === "@expression") {
                    return expression.source;
                } else {
                    return expression.parameters[paramCounter++]
                };
            });
            
            if(opDef.includeCompiler){
                for (var i = 0; i < args.length; i++) {
                    var arg = args[i];
                    var compilerType = Container.resolveType(opDef.includeCompiler);
                    var compiler = new compilerType(this.provider);
                    var frameContext = { data: "", $expand: context.current };
                                        
                    if (arg && arg.value instanceof $data.Queryable) {
                        var preparator = Container.createQueryExpressionCreator(arg.value.entityContext);
                        var prep_expression = preparator.Visit(arg.value.expression);
                        arg = prep_expression;
                    }
                    
                    var compiled = compiler.compile(arg, frameContext);
                    
                    if(context.current['$operators'].indexOf(opName) < 0){
                        context.current[opName] = [];
                        context.current['$operators'].push(opName);    
                    }
                    context.current[opName].push(frameContext[opName] || frameContext.data);

                }
            } else if(opDef.implementation) {
                if(context.current['$operators'].indexOf(opName) < 0){
                    context.current[opName] = [];
                    context.current['$operators'].push(opName);    
                }
                context.current[opName].push(opDef.implementation());
            }
        }
    }
});
