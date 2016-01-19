import $data, { $C, Guard, Container, Exception } from '../../TypeSystem/index.js';

$data.ajax = $data.ajax || function () {
    var cfg = arguments[arguments.length - 1];
    var clb = $data.PromiseHandlerBase.createCallbackSettings(cfg);
    clb.error("Not implemented");
};

export default $data
