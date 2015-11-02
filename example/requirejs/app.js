requirejs.config({
    baseUrl: '../../dist/public'
});

requirejs(['jaydata', 'jaydataproviders/oDataProvider'], function ($data) {
    document.body.innerHTML += $data.version;
});
