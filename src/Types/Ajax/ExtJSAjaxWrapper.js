import $data, { $C, Guard, Container, Exception } from '../../TypeSystem/index.js';

if (typeof Ext !== 'undefined' && typeof Ext.Ajax) {
    $data.ajax = $data.ajax || function (options) {
        Ext.Ajax.request(options);
    };
}

export default $data
