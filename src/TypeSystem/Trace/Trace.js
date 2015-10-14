import $data from '../TypeSystem.js'

$data.Class.define('$data.TraceBase', null, null, {
    log: function () { },
    warn: function () { },
    error: function () { }
});

$data.Trace = new $data.TraceBase();

export default $data
