$data.ajax = $data.ajax || function () {
    var cfg = arguments[arguments.length - 1];
    var clb = $data.typeSystem.createCallbackSetting(cfg);
    clb.error("Not implemented");
};

