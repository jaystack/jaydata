require('jaydata');

$data.ServiceBase.extend('MyService', {
    HelloWorld: (function(){
        return 'Hello World!';
    }).toServiceOperation().returns('string')
});

exports = module.exports = {
    serviceTypes: [MyService]
};
