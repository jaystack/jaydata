
var albums = $data.EntitySet.define(
    {
        name: 'Album',
        fields: {
            items: [
                { name: "aid", dataType: "string", key: false, computed: false, required: true },
                { name: "object_id", dataType: "int", key: true, computed: false, required: true },
                { name: "owner", dataType: "string", key: true, computed: false, required: true },
                { name: "cover_pid", dataType: "string", key: true, computed: false, required: true },
                { name: "cover_object_pid", dataType: "string", key: true, computed: false, required: true },
                { name: "name", dataType: "string", key: true, computed: false, required: true },
                { name: "created", dataType: "string", key: true, computed: false, required: true },
                { name: "modified", dataType: "string", key: true, computed: false, required: true },
                { name: "description", dataType: "string", key: true, computed: false, required: true },
                { name: "location", dataType: "string", key: true, computed: false, required: true }
            ],
            schemaCreate: null
        }
    }
);