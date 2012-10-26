$data.ASTNode = function() {
    ///<field name="arity" type="string">represents the kind of the AST node</field>
    ///<field name="edge" type="Boolean" />
    ///<field name="identifier" type="Boolean" />
    ///<field name="first" type="ASTNode">Contains the first part of the expression</field>
    ///<field name="id" type="String" />
    ///<field name="type" type="String" />
}

$data.FunctionASTNode = function() {
    ///<field name="value" type="string">The name of the function</field>
    ///<field name="first" type="Array" elementType="ASTNode">Contains the function parameters</field>
    ///<field name="block" type="ASTNode">The function body</field>
}
$data.FunctionASTNode.prototype = new $data.ASTNode();

$data.ParameterASTNode = function() {
    ///<field name="value" type="string">The name of the parameter</field>
    ///<field name="type" type="string" />
    ///<field name="func" type="" />
}
$data.MemberAccessASTNode = function() {
    ///<field name="value" type="string">The name of the parameter</field>
    ///<field name="type" type="string" />
    ///<field name="first" type="ASTNode" />
    ///<field name="second" type="ParameterASTNode" />
}
$data.MemberAccessASTNode.prototype = new $data.ASTNode();

$data.ConstantASTNode = function() {
    ///<field name="type" type="string">The datatype of the constant value</field>
    ///<field name="value" type="Object">The constant value</field>
}


$data.ASTParserResult = function(result, tree, errors) {
    ///<field name="success" type="boolean"></field>
    this.success = (tree != '');
    this.result = result;
    this.tree = tree;
    this.errors = errors;
}

$data.ASTParser = function() {
}

$data.ASTParser.parseCode = function (code) {
    var codeStr;

    if (!code || (codeStr = code.toString()) === '') {
        return new $data.ASTParserResult(false, null, null);
    }

    if (typeof JAYLINT === 'undefined') {
        Guard.raise(new Exception('JAYLINT is required', 'Not Found!'));
    }

    var jsLint = JAYLINT(codeStr);
    var result = new $data.ASTParserResult(jsLint, JAYLINT.tree, JAYLINT.errors);
    
    return result;
};
