(function ($data) {

    $data.Array.prototype.toQueryable = function () {
        if (this.length > 0) {
            var firtsItem = this[0];
            var type = Container.resolveType(Container.getTypeName(firtsItem));

            if (!type.isAssignableTo || !type.isAssignableTo($data.Entity))
                Guard.raise(new Exception("Type '" + Container.getName(type) + "' is not subclass of $data.Entity", "Not supported", type));

            for (var i = 0; i < this.length; i++) {
                Guard.requireType('array item check', this[i], type);
            }

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