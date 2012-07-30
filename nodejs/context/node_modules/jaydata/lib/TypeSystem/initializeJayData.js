if (typeof console === 'undefined') {
    console = {
        warn: function () { },
        error: function () { },
        log: function () { },
        dir: function () { },
        time: function () { },
        timeEnd: function () { }
    };
}

if (!console.warn) console.warn = function () { };
if (!console.error) console.error = function () { };

(function ($data) {
    ///<summary>
    /// Collection of JayData services
    ///</summary>
    $data.__namespace = true;
    $data.version = "JayData 1.1.0";
    $data.versionNumber = "1.1.0";
    $data.root = {};

})($data);

// Do not remove this block, it is used by jsdoc 
/**
    @name $data.Base
    @class base class
*/
