$data.Base.extend('$data.ObjectWrapper', {
    getInstance: function () {
        Guard.raise("pure object");
    }
});