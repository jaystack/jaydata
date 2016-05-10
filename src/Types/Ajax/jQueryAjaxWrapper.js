import $data, { $C, Guard, Container, Exception } from '../../TypeSystem/index.js';

if (typeof jQuery !== 'undefined' && jQuery.ajax) {
    $data.ajax = $data.ajax || jQuery.ajax;
}

export default $data
