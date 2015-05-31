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
    $data.version = "JayData 1.2.0";
    $data.versionNumber = "1.2.0";
    $data.root = {};
    $data.Acorn = $data.Acorn || (typeof acorn == 'object' ? acorn : undefined);
    $data.Esprima = $data.Esprima || (typeof esprima == 'object' ? esprima : undefined);

})($data);

// Do not remove this block, it is used by jsdoc 
/**
    @name $data.Base
    @class base class
*/
