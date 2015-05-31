$data.Class.define("$data.EntityAttachMode", null, null, {}, {
    defaultMode: 'Default',
    AllChanged: function (data) {
        var memDefs = data.getType().memberDefinitions.getPublicMappedProperties();
        for (var i = 0; i < memDefs.length; i++) {
            data._setPropertyChanged(memDefs[i]);
        }
        data.entityState = $data.EntityState.Modified;
    },
    KeepChanges: function (data) {
        if (data.changedProperties && data.changedProperties.length > 0) {
            data.entityState = $data.EntityState.Modified;
        } else {
            data.entityState = $data.EntityState.Unchanged;
        }
    },
    Default: function (data) {
        data.entityState = $data.EntityState.Unchanged;
        data.changedProperties = undefined;
    }
});