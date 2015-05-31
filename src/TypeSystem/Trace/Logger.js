$data.Class.define('$data.Logger', $data.TraceBase, null, {
    log: function () {
        Array.prototype.unshift.call(arguments, this.getDateFormat());
        console.log.apply(console, arguments);
    },
    warn: function () {
        Array.prototype.unshift.call(arguments, this.getDateFormat());
        console.warn.apply(console, arguments);
    },
    error: function () {
        Array.prototype.unshift.call(arguments, this.getDateFormat());
        console.error.apply(console, arguments);
    },

    getDateFormat: function () {
        var date = new Date();
        return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '.' + date.getMilliseconds();
    }
});
