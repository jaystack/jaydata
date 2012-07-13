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

(function (global) {
    /// <summary>NodeJS detecting, handling, and module export.</summary>

    //$ = typeof $ !== 'undefined' && $ || require('jquery');

    if (typeof window === "undefined") {
        window = this;
    }

    $data = window["$data"] || (window["$data"] = {});

    if (typeof module !== "undefined" && module.exports) {
        try {
            sqLiteModule = require('sqlite3');
            if (sqLiteModule) window['openDatabase'] = true;
        }
        catch (e) { }
        module.exports = $data;
    }

})(this);

(function ($data) {
    ///<summary>
    /// Collection of JayData services
    ///</summary>
    $data.__namespace = true;
    $data.version = "JayData 1.0.4";
    $data.versionNumber = "1.0.4";
    $data.root = {};

})($data);


// Do not remove this block, it is used by jsdoc 
/**
    @name $data.Base
    @class base class
*/
