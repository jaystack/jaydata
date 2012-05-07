if (typeof console === 'undefined') {
    var console = {
        log : function () { },
        dir : function () { },
        time : function () { },
        timeEnd : function () { }
    };
}

(function (global) {
    /// <summary>NodeJS detecting, handling, and module export.</summary>            

    $ = typeof $ !== 'undefined' && $ || require('jquery');    

    if (typeof window === "undefined") {
        window = this;
    }

    $data = window["$data"] || (window["$data"] = {});

    if (typeof module !== "undefined" && module.exports) {
        sqLiteModule = require('sqlite3');
        module.exports = $data;
    }
    
})(this);

(function ($data) {
    ///<summary>
    /// Collection of JayData services
    ///</summary>
    $data.__namespace = true;
    $data.root = {};

})($data);