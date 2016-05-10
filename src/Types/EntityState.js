import $data, { $C, Guard, Container, Exception } from '../TypeSystem/index.js';

$data.EntityState = {
    Detached:0,
    Unchanged: 10,
    Added: 20,
    Modified: 30,
    Deleted: 40
};

export default $data
