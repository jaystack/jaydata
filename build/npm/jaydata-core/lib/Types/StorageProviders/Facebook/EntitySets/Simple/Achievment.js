
/// https://developers.facebook.com/docs/reference/api/achievement/
$data.storageProviders.facebook.EntitySets.FacebookSimpleEntityContext.Achievment = $data.EntitySet.define({
    name: 'Achievment',
    fields: {
        items: [
            { name: "id", dataType: "string", key: true, computed: false, required: true, length: 64, schemaCreate: null },
            { name: "from", dataType: "<todo#seelink>", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "created_time", dataType: "datetime", key: false, computed: false, required: false, length: 20, schemaCreate: null },
            { name: "application", dataType: "<todo#seelink>", key: false, computed: false, required: false, length: 20, schemaCreate: null },
            { name: "achievment", dataType: "<todo#seelink>", key: false, computed: false, required: false, length: 20, schemaCreate: null },
            { name: "likes", dataType: "<todo#seelink>", key: false, computed: false, required: false, length: 20, schemaCreate: null },
            { name: "comments", dataType: "<todo#seelink>", key: false, computed: false, required: false, length: 20, schemaCreate: null }
        ],
        schemaCreate: null
    }
});