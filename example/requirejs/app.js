requirejs.config({
    baseUrl: '../../dist/public',
    paths: {
        'jaydata/core': 'jaydata',
        'jaydata/odata': 'jaydataproviders/oDataProvider'
    },
    shim: {
        'jaydata/odata': {
            deps: ['jaydata/core']
        }
    }
});

requirejs(['jaydata/core', 'jaydata/odata'], function ($data) {
    document.body.innerHTML += $data.version;
    if ('oData' in $data.RegisteredStorageProviders) document.body.innerHTML += '<br>JayData OData provider is available';
});
