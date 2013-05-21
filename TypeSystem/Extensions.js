$data.StringFunctions = {
    startsWith: function () {
        var self, str;
        if (arguments.length == 2) {
            self = arguments[0];
            str = arguments[1];
        } else if (arguments.length == 1 && typeof this === 'string') {
            self = this;
            str = arguments[0];
        } else if (this instanceof String) {
            self = this.valueOf();
            str = arguments[0];
        } else
            return false;
            
        if (typeof self !== 'string') return false;
        return self.indexOf(str) === 0;
    },
    endsWith: function () {
        var self, str;
        if (arguments.length == 2) {
            self = arguments[0];
            str = arguments[1];
        } else if (arguments.length == 1 && typeof this === 'string') {
            self = this;
            str = arguments[0];
        } else if (this instanceof String) {
            self = this.valueOf();
            str = arguments[0];
        } else
            return false;

        if (typeof self !== 'string') return false;
        return self.slice(-str.length) === str;
    },
    contains: function () {
        var self, str;
        if (arguments.length == 2) {
            self = arguments[0];
            str = arguments[1];
        } else if (arguments.length == 1 && typeof this === 'string') {
            self = this;
            str = arguments[0];
        } else if (this instanceof String) {
            self = this.valueOf();
            str = arguments[0];
        } else
            return false;

        if (typeof self !== 'string') return false;
        return self.indexOf(str) >= 0;
    }
};
