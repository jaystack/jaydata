import $data, { $C, Guard, Container, Exception } from '../TypeSystem/index.js';

$data.Base.extend('$data.EntityWrapper', {
    getEntity: function () {
        Guard.raise("pure object");
    }
});

export default $data
