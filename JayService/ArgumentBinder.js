$data.Class.define('$data.JayService.ArgumentBinder', null, null, {
    convert: function (name, options, request) {
        //<params name="config" type="object" />
        //<params name="value" type="object" />

        var self = $data.JayService.ArgumentBinder._defaultBinder;

        var value = request.query[name];
        if (options.type) {
            var type = Container.resolveType(options.type);
            var converter = Container.getName(type);
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

    '$data.String': function (config, value) {
        if (typeof value === 'string' && value.indexOf("'") === 0 && value.lastIndexOf("'") === value.length - 1) {
            return value.slice(1, value.length - 1);
        } else {
            return value;
        }
    },
    '$data.Integer': function (config, value) { return JSON.parse(value); },
    '$data.Number': function (config, value) { return JSON.parse(value); },
    '$data.Boolean': function (config, value) { return JSON.parse(value); },
    '$data.Object': function (config, value) { return JSON.parse(value) },

    '$data.Blob': function (config, value) { return value; },
    '$data.Array': function (config, value) {
        if (config.elementType) {
            var type = Container.resolveType(config.elementType);
            var converter = Container.getName(type);
            if (type && type.isAssignableTo && type.isAssignableTo($data.Entity)) {
                converter = $data.Entity.fullName;
            }

            value = JSON.parse(value);
            if (Array.isArray(value)) {
                var subConfig = { type: type };
                for (var i = 0; i < value.length; i++) {
                    value[i] = this[converter].call(this, subConfig, value[i])
                }
            }
            return value;
        }
        return JSON.parse(value);
    },
    '$data.Date': function (config, value) {
        if (/^datetime'/.test(value)) {
            return new Date(value.slice(9, value.length-1));
        } else if (/^\/Date\(/.test(value)) {
            return new Date(parseInt(value.slice(6, value.length - 2)));
        } else if (/^\d+$'/.test(value)) {
            return new Date(parseInt(value));
        }
        return value;
    },
    '$data.Entity': function (config, value) { return new config.type(JSON.parse(value)); },
    '$data.Geography': function (config, value) {
        if (/^POINT\(/.test(value)) {
            var data = value.slice(6, value.length - 1).split(' ');
            return new $data.Geography(data[0], data[1]);
        }
        return value;
    }


}, {
    defaultBinder: { 
        get: function () {
            if (!$data.JayService.ArgumentBinder._defaultBinder) {
                $data.JayService.ArgumentBinder._defaultBinder = new $data.JayService.ArgumentBinder();
            }
            return $data.JayService.ArgumentBinder._defaultBinder.convert;
        },
        set: function (value) {
            $data.JayService.ArgumentBinder._defaultBinder = value;
        }
    },
    _defaultBinder: { value: null }
});