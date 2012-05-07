function ASTNode() {
    ///<field name="arity" type="string">represents the kind of the AST node</field>
    ///<field name="edge" type="Boolean" />
    ///<field name="identifier" type="Boolean" />
    ///<field name="first" type="ASTNode">Contains the first part of the expression</field>
    ///<field name="id" type="String" />
    ///<field name="type" type="String" />
}

function FunctionASTNode() {
    ///<field name="value" type="string">The name of the function</field>
    ///<field name="first" type="Array" elementType="ASTNode">Contains the function parameters</field>
    ///<field name="block" type="ASTNode">The function body</field>
}
FunctionASTNode.prototype = new ASTNode();

function ParameterASTNode() {
    ///<field name="value" type="string">The name of the parameter</field>
    ///<field name="type" type="string" />
    ///<field name="func" type="" />
}
function MemberAccessASTNode() {
    ///<field name="value" type="string">The name of the parameter</field>
    ///<field name="type" type="string" />
    ///<field name="first" type="ASTNode" />
    ///<field name="second" type="ParameterASTNode" />
}
MemberAccessASTNode.prototype = new ASTNode();

function ConstantASTNode() {
    ///<field name="type" type="string">The datatype of the constant value</field>
    ///<field name="value" type="Object">The constant value</field>
}


function ASTParserResult(result, tree, errors) {
    ///<field name="success" type="boolean"></field>
    this.success = (tree != '');
    this.result = result;
    this.tree = tree;
    this.errors = errors;
}

function ASTParser() {
}

ASTParser.parseCode = function (code) {
    var codeStr;

    if (!code || (codeStr = code.toString()) === '') {
        return new ASTParserResult(false, null, null);
    }

    if (typeof JAYLINT === 'undefined') {
        Guard.raise(new Exception('JAYLINT is required', 'Not Found!'));
    }

    var jsLint = JAYLINT(codeStr);
    var result = new ASTParserResult(jsLint, JAYLINT.tree, JAYLINT.errors);
    
    return result;
};