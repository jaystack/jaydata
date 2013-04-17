$data.Class.define("$data.Authentication.FacebookAuth", $data.Authentication.AuthenticationBase, null, {
    constructor: function (cfg) {
        this.configuration = $data.typeSystem.extend({
            Url_code: '',
            type_code: '',
            scope: '',
            Url_token: '',
            type_token: '',
            access_token: '',
            app_id: ''
        }, cfg);
    },
    Login: function (callbacks) {
        if (this.Authenticated) {
            return;
        }

        var provider = this;
        provider.configuration.stateCallbacks = callbacks || {};

        $data.ajax({
            url: this.configuration.Url_code,
            data: 'type=' + provider.configuration.type_code + '&client_id=' + provider.configuration.app_id + '&scope=' + provider.configuration.scope,
            type: 'POST',
            dataType: 'json',
            success: function (data) {
                if (typeof provider.configuration.stateCallbacks.pending == "function")
                    provider.configuration.stateCallbacks.pending(data);
                provider._processRequestToken(data);
                provider.Authenticated = true;
            },
            error: function () {
                if (typeof provider.configuration.stateCallbacks.error == "function")
                    provider.configuration.stateCallbacks.error(arguments);
            }
        });
    },
    Logout: function () {
        this.Authenticated = false;
    },
    CreateRequest: function (cfg) {
        if (!cfg)
            return;
        var _this = this;

        if (cfg.url.indexOf('access_token=') === -1) {
            if (cfg.url && this.Authenticated) {
                var andChar = '?';
                if (cfg.url.indexOf(andChar) > 0)
                    andChar = '&';

                if (this.configuration.access_token)
                    cfg.url = cfg.url + andChar + 'access_token=' + this.configuration.access_token;
            }
        }

        $data.ajax(cfg);
    },
    _processRequestToken: function (verification_data) {
        var provider = this;

        $data.ajax({
            url: provider.configuration.Url_token,
            data: 'type=' + provider.configuration.type_token + '&client_id=' + provider.configuration.app_id + '&code=' + verification_data.code,
            type: 'POST',
            dataType: 'json',
            success: function(result) {
                provider.configuration.access_token = result.access_token;
                if (typeof provider.configuration.stateCallbacks.success == "function")
                    provider.configuration.stateCallbacks.success(result);
            },
            error: function(obj) {
                var data = eval('(' + obj.responseText + ')');
                if (data.error) {
                    if (data.error.message == "authorization_pending") {
                        setTimeout(function() {
                            provider._processRequestToken(verification_data);
                        }, 2000);
                    } else if ("authorization_declined") {
                        if (typeof provider.configuration.stateCallbacks.abort == "function")
                            provider.configuration.stateCallbacks.abort(arguments);
                    }
                }
            }
        });
    }
}, null);