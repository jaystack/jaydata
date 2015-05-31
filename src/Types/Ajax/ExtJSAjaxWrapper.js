if (typeof Ext !== 'undefined' && typeof Ext.Ajax) {
    $data.ajax = $data.ajax || function (options) {
        Ext.Ajax.request(options);
    };
}

