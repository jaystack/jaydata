import $data, { $C, Guard, Container, Exception } from '../../TypeSystem/index.js';

$data.Class.define('$data.Notifications.ChangeCollectorBase', null, null, {
    buildData: function (entityContextData) {
        Guard.raise("Pure class");
    },
    processChangedData: function (entityData) {
        if (this.Distrbutor && this.Distrbutor.distributeData)
            this.Distrbutor.distributeData(this.buildData(entityData));
    },
    Distrbutor: { enumerable: false, dataType: $data.Notifications.ChangeDistributorBase, storeOnObject: true }
}, null);

export default $data
