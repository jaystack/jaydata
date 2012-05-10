var fs = require('fs');

console.log('JayData unit test started');
fs.readdir('Modules', function (err, files) {    
    var testModules = [];
    for (var i = 0; i < files.length; i++) {
        if (files[i].substr(files[i].length - 3) == '.js') {
            testModules.push(files[i]);
        }
    }
    console.log(testModules.length + ' tests found');
    var successful = 0;
    var failed = 0;
    function onTestFinish(result) {        
        switch (result) {
            case 'timeout':
                console.log('TIMEOUT - ' + this.name);
                failed++;
                break;
            case true:
                console.log('OK   - ' + this.name);
                successful++;
                break;
            case false:
                console.log('FAIL - ' + this.name);
                failed++;
                break;
        }        
    }
    for (var i = 0; i < testModules.length; i++) {
        var item = require('./Modules/' + testModules[i]);        
        if (typeof item.run == 'function') {
            item.run(onTestFinish.bind(item));
        }
    }
    console.log(successful + ' successful, ' + failed + ' failed test out of ' + testModules.length);
});