import $data, { $C, Guard, Container, Exception } from '../../TypeSystem/index.js';

$data.Class.define('$data.Notifications.ChangeDistributorBase', null, null, {
    distributeData: function (collectorData) {
        Guard.raise("Pure class");
    }
}, null);

export default $data
