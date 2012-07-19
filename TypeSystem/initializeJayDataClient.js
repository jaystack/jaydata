(function (global) {
    if (typeof window === "undefined") {
        window = this;
    }
    $data = window["$data"] || (window["$data"] = {});
})(this);

