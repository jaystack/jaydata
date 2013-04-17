$data.Class.define('$data.ArgumentBinder', null, null, {
    convert: function (name, options, request) {
        ///	<signature>
        ///     <summary>Request (GET) parameter resolver for create typed parameters</summary>
        ///     <description>Request (GET) parameter resolver for create typed parameters</description>
        ///     <param name="name" type="String">Name of parameter</param>
        ///     <param name="options" type="Object">Config object with type property for a resolved type</param>
        ///     <param name="request" type="Object">Request context</param>
        ///     <returns type="object">options.type</returns>
        /// </signature>
        ///	<signature>
        ///     <summary>Request (GET) parameter resolver for create typed parameters</summary>
        ///     <description>Request (GET) parameter resolver for create typed parameters</description>
        ///     <param name="name" type="String">Name of parameter</param>
        ///     <param name="options" type="Object">Config object with type property for a resolved type</param>
        ///     <param name="request" type="Object">Request context</param>
        ///     <returns type="String">If cannot convert</returns>
        /// </signature>

        var self = $data.ArgumentBinder._defaultBinder;

        var value = request.query[name];
        if (options.type) {
            var type = Container.resolveType(options.type);
            var typeName = Container.resolveName(type);
            if (type && type.isAssignableTo && type.isAssignableTo($data.Entity)) {
                typeName = $data.Entity.fullName;
            }

            var converter = self.valueConverter.unescape[typeName];
            value = converter ? converter(value, options) : value;

            converter = self.valueConverter.fromDb[typeName];
            value = converter ? converter(value) : value;
        }

        return value;
    },
    valueConverter: {
        value: $data.oDataConverter
    }
}, {
    defaultBinder: {
        get: function () {
            if (!$data.ArgumentBinder._defaultBinder) {
                $data.ArgumentBinder._defaultBinder = new $data.ArgumentBinder();
            }
            return $data.ArgumentBinder._defaultBinder.convert;
        },
        set: function (value) {
            $data.ArgumentBinder._defaultBinder = value;
        }
    },
    _defaultBinder: { value: null }
});