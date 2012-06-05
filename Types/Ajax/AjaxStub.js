if (typeof jQuery !== 'undefined' && jQuery.ajax) {
    $data.ajax = jQuery.ajax;
} else {
    $data.ajax = function () {
        var cfg = arguments[arguments.length - 1];
        var clb = $data.TypeSystem.createCallbackSetting(cfg);
        clb.error("Not implemented");
    }
}