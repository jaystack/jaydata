$data.Class.define('$data.Logger', null, null, {
    log: function () {
        console.log(this.getDateFormat(), arguments.length === 1 ? arguments[0] : arguments);
    },
    warn: function () {
        console.warn(this.getDateFormat(), arguments.length === 1 ? arguments[0] : arguments);
    },
    error: function () {
        console.error(this.getDateFormat(), arguments.length === 1 ? arguments[0] : arguments);
    },

    getDateFormat: function () {
        var date = new Date();
        return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '.' + date.getMilliseconds();
    }
});
