var ujs = require("../../../temp/UglifyJS2/tools/node");
var dammit = require("./acorn_loose").parse_dammit;
var acorn = require("./acorn").parse;

var ast = dammit(require("fs").readFileSync(process.argv[2], "utf8"));
var to_ujs = ujs.AST_Node.from_mozilla_ast(ast);
console.log(to_ujs.print_to_string({
  indent_level: 2,
  beautify: true
}));
