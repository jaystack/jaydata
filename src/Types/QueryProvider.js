import $data, { $C, Guard, Container, Exception } from '../TypeSystem/index.js';

$data.Class.define('$data.QueryProvider', null, null,
{
    //TODO: instance member?????
    constructor: function () { this.requiresExpressions= false },
    executeQuery: function (queryable, resultHandler) {
    },
    getTraceString: function (queryable) {
    }
}, null);

export default $data
