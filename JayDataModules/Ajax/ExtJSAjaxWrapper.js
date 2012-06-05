(function ($data) {
    if (typeof Ext !== 'undefined' && typeof Ext.Ajax) {
        $data.ajax = Ext.Ajax.request;        
    }
})($data);