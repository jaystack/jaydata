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
            var converter = Container.resolveName(type);
            if (type && type.isAssignableTo && type.isAssignableTo($data.Entity)) {
                converter = $data.Entity.fullName;
            }

            if (converter in self) {
                var val = self[converter].call(self, options, value);
                return val;
            }
        }
        return value;
    },
    parseData: function (value) { try { return JSON.parse(value); } catch (er) { return undefined; } },

    '$data.String': function (config, value) {
        if (typeof value === 'string' && value.indexOf("'") === 0 && value.lastIndexOf("'") === value.length - 1) {
            return value.slice(1, value.length - 1);
        } else {
            return value;
        }
    },
    '$data.Integer': function (config, value) { return this.parseData(value); },
    '$data.Number': function (config, value) { return this.parseData(value); },
    '$data.Boolean': function (config, value) { return this.parseData(value); },
    '$data.Object': function (config, value) { return this.parseData(value); },

    '$data.Blob': function (config, value) { return value; },
    '$data.Array': function (config, value) {
        if (config.elementType) {
            var type = Container.resolveType(config.elementType);
            var converter = Container.resolveName(type);
            if (type && type.isAssignableTo && type.isAssignableTo($data.Entity)) {
                converter = $data.Entity.fullName;
            }

            value = this.parseData(value) || [];
            if (Array.isArray(value)) {
                var subConfig = { type: type };
                for (var i = 0; i < value.length; i++) {
                    value[i] = this[converter].call(this, subConfig, value[i])
                }
            }
            return value;
        }
        return this.parseData(value) || [];
    },
    '$data.Date': function (config, value) {
        if (/^datetime'/.test(value)) {
            return new Date(value.slice(9, value.length - 1));
        } else if (/^\/Date\(/.test(value)) {
            return new Date(parseInt(value.slice(6, value.length - 2)));
        } else if (/^\d+$'/.test(value)) {
            return new Date(parseInt(value));
        }
        return value;
    },
    '$data.Entity': function (config, value) { return new config.type(this.parseData(value)); },
    '$data.GeographyPoint': function (config, value) {
        if (/^geography'POINT\(/.test(value)) {
            var data = value.slice(16, value.length - 2).split(' ');
            return new $data.GeographyPoint(data);
        }
        return value;
    },
    '$data.GeometryPoint': function (config, value) {
        if (/^geometry'POINT\(/.test(value)) {
            var data = value.slice(16, value.length - 2).split(' ');
            return new $data.GeometryPoint(data);
        }
        return value;
    },
    '$data.Guid': function (config, value) {
        if (/^guid'\w{8}-\w{4}-\w{4}-\w{4}-\w{12}'$/.test(value)) {
            var data = value.slice(5, value.length - 1)
            return $data.parseGuid(data).toString();
        }
        return value;
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