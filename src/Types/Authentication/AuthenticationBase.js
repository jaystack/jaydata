$data.Class.define("$data.Authentication.AuthenticationBase", null, null, {
    constructor: function (cfg) {
        this.configuration = cfg || {};
        this.Authenticated = false;
    },
    /// { error:, abort:, pending:, success: }
    Login: function (callbacks) {
         Guard.raise("Pure class");
    },
    Logout: function () {
        Guard.raise("Pure class");
    },
    CreateRequest: function (cfg) {
        Guard.raise("Pure class");
    }

}, null);