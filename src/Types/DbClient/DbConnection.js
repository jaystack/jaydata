$data.Class.define('$data.dbClient.DbConnection', null, null,
{
    connectionParams: {},
    database: {},
    isOpen: function () {
        Guard.raise("Pure class");
    },
    open: function () {
        Guard.raise("Pure class");
    },
    close: function () {
        Guard.raise("Pure class");
    },
    createCommand: function () {
        Guard.raise("Pure class");
    }
}, null);