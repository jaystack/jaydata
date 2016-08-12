import $data, { $C, Guard, Container, Exception } from '../../../TypeSystem/index.js';

$C('$data.Expressions.EntitySetExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source, selector, params, instance) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntityExpression" />
        ///<param name="selector" type="$data.Expressions.MemberInfoExpression" />
        ///</signature>
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntityContextExpression" />
        ///<param name="selector" type="$data.Expressions.MemberInfoExpression" />
        ///</signature>
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///<param name="selector" type="$data.Expressions.ParametricQueryExpression" />
        ///</signature>
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///<param name="selector" type="$data.Expressions.CodeExpression" />
        ///</signature>
        Guard.requireType("source", source,
                    [$data.Expressions.EntityContextExpression, $data.Expressions.EntitySetExpression]);
        Guard.requireType("selector", source,
                    [$data.Expressions.MemberInfoExpression, $data.Expressions.CodeExpression, $data.Expressions.ParametricQueryExpression]);

        this.source = source;
        this.selector = selector;
        this.params = params;
        //Object.defineProperty(this, "instance", { value: instance, enumerable: false, writable: true });
        this.instance = instance;

        function findContext() {
            //TODO: use source from function parameter and return a value at the end of the function
            var r = source;
            while (r) {
                if (r instanceof $data.Expressions.EntityContextExpression) {
                    return r;
                }
                r = r.source;
            }
        }

        ///TODO!!!
        this.storage_type = {};
        var c = findContext();
        switch (true) {
            case this.source instanceof $data.Expressions.EntityContextExpression:
                Guard.requireType("selector", selector, $data.Expressions.MemberInfoExpression);
                this.elementType = selector.memberDefinition.elementType;
                this.storageModel = c.instance._storageModel.getStorageModel(this.elementType);
                break;
            case this.source instanceof $data.Expressions.EntityExpression:
                Guard.requireType("selector", selector, $data.Expressions.AssociationInfoExpression);
                this.elementType = selector.associationInfo.ToType;
                this.storageModel = c.instance._storageModel.getStorageModel(this.elementType);
                break;
            case this.source instanceof $data.Expressions.EntitySetExpression:
                if (selector instanceof $data.Expressions.AssociationInfoExpression) {
                    this.elementType = selector.associationInfo.ToType,
                    this.storageModel = c.instance._storageModel.getStorageModel(selector.associationInfo.ToType)
                } else {
                    this.elementType = this.source.elementType;
                    this.storageModel = this.source.storageModel;
                }
                break;
            case this.source instanceof $data.Expressions.ServiceOperationExpression:
                this.elementType = this.source.elementType;//?????????
                this.storageModel = this.source.storageModel;
                break;
            case this.source instanceof $data.Expressions.FindExpression:
                this.elementType = this.source.resultType;
                this.storageModel = c.instance._storageModel.getStorageModel(this.elementType);
                break;
            default:
                Guard.raise("take and skip must be the last expressions in the chain!");
                //Guard.raise("Unknown source type for EntitySetExpression: " + this.getType().name);
                break;
        }

        // suspicious code
        /*if (this.source instanceof $data.Expressions.EntitySetExpression) {
                //TODO: missing operation
        }*/
        //EntityTypeInfo

    },
    getMemberDefinition: function (name) {
        var memdef = this.elementType.getMemberDefinition(name);
        if (!(memdef)) {
            Guard.raise(new Exception("Unknown member " + name + " on type "+ this.entityType.name, "MemberNotFound"));
        };
            memdef.storageModel = this.storageModel;
        return memdef;
    },
    
    instance: { enumerable: false },
    nodeType: { value: $data.Expressions.ExpressionType.EntitySet, enumerable: true }
});

export default $data
