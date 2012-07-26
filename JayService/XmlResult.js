$data.Class.define('$data.XmlResult', null, null, {
    constructor:function (data) {
        this.data = data;
    },
    data:{value:{}},
    toString:function () {
        return this.data;
    }
}, null);