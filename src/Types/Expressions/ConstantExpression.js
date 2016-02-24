import $data, { $C, Guard, Container, Exception } from '../../TypeSystem/index.js';

$C('$data.Expressions.ConstantExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (value, type, name, elementType) {
        this.value = value;
        //TODO
        //this.type = Container.getTypeName(value);

        this.type = type;
        this.name = name;
        this.elementType = elementType;
        if (!Guard.isNullOrUndefined(this.value)) {
            this.type = Container.resolveType(this.type)
            if ((this.type === $data.Array && this.elementType) || Container.resolveType(Container.getTypeName(this.value)) !== this.type)
                this.value = Container.convertTo(value, this.type, this.elementType);
        }
    },
    nodeType: { value: $data.Expressions.ExpressionType.Constant, enumerable: true },
    type: { value: Object, writable: true },
    elementType: { value: Object, writable: true },
    value: { value: undefined, writable: true },
    toString: function (debug) {
        //return "[constant: " + this.value.toString() + "]";
        return this.value.toString();
    }
});

export default $data
