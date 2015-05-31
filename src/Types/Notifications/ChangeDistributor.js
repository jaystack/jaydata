
$data.Class.define('$data.Notifications.ChangeDistributor', $data.Notifications.ChangeDistributorBase, null, {
    constructor: function (broadcastUrl) {
        this.broadcastUrl = broadcastUrl;
    },
    distributeData: function (data) {
        $data.ajax({
            url: this.broadcastUrl,
            type: "POST",
            data: 'data=' + JSON.stringify(data),
            succes: this.success,
            error: this.error
        });
    },
    broadcastUrl: { dataType: "string" },
    success: function () { },
    error: function () { }
}, null);