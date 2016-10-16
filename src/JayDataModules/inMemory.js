import $data, { $C, Guard, Container, Exception, MemberDefinition } from 'jaydata/core';

(function ($data) {

    $data.Array.prototype.toQueryable = function (type) {
        if (type == null) {
            if(this.length > 0) {
                var firtsItem = this[0];
                type = Container.resolveType(Container.getTypeName(firtsItem));
            }
            else {
                Guard.raise(new Exception("You may not call toQueryable on empty array. Either call toQueryable on non-empty array or pass entity type to toQueryable method"));
            }
        }

        if (!type.isAssignableTo || !type.isAssignableTo($data.Entity))
            Guard.raise(new Exception("Type '" + Container.resolveName(type) + "' is not subclass of $data.Entity", "Not supported", type));

        for (var i = 0; i < this.length; i++) {
            Guard.requireType('array item check', this[i], type);
        }

        var typeName = 'inMemoryArray_' + type.name;
        if (!Container.isTypeRegistered(typeName)) {
            $data.EntityContext.extend(typeName, {
                Source: {
                    type: $data.EntitySet,
                    elementType: type
                }
            });
        }

        var context = Container['create' + typeName]({ name: 'InMemory', source: { Source: this} });

        return context.Source;
    }

})($data);

export default $data
