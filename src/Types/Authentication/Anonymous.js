$data.Class.define("$data.Authentication.Anonymous", $data.Authentication.AuthenticationBase, null, {
    constructor: function (cfg) {
        this.configuration = cfg || {};
        this.Authenticated = false;
    },
    /// { error:, abort:, pending:, success: }
    Login: function (callbacks) {
    },
    Logout: function () {
    },
    CreateRequest: function (cfg) {
        $data.ajax(cfg);
    }

}, null);