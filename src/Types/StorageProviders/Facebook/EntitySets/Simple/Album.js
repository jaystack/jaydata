
/// https://developers.facebook.com/docs/reference/api/album/

$data.storageProviders.facebook.EntitySets.FacebookSimpleEntityContext.Album = $data.EntitySet.define({
    name: 'Album',
    fields: {
        items: [
            { name: "id", dataType: "string", key: true, computed: true, required: true, length: 64, schemaCreate: null },
            { name: "from", dataType: "object containing the id and name of user", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "name", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "description", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "location", dataType: "string", key: false, computed: false, required: false, length: 20, schemaCreate: null },
            { name: "link", dataType: "string", key: false, computed: false, required: false, length: 20, schemaCreate: null },
            { name: "cover_photo", dataType: "string", key: false, computed: false, required: false, length: 20, schemaCreate: null },
            { name: "location", dataType: "string", key: false, computed: false, required: false, length: 20, schemaCreate: null },
            { name: "privacy", dataType: "string", key: false, computed: true, required: false, length: 20, schemaCreate: null },
            { name: "count", dataType: "string", key: false, computed: true, required: false, length: 20, schemaCreate: null },
            { name: "type", dataType: "string", key: false, computed: true, required: false, length: 20, schemaCreate: null },
            { name: "created_time", dataType: "datetime", key: false, computed: false, required: false, length: 20, schemaCreate: null },
            { name: "updated_time", dataType: "datetime", key: false, computed: false, required: false, length: 20, schemaCreate: null },
            { name: "photos", dataType: "EntitySet<Photo>", key: false, computed: false, required: false, length: 20, schemaCreate: null },
            { name: "likes", dataType: "EntitySet<Like>", key: false, computed: false, required: false, length: 20, schemaCreate: null },
            { name: "comments", dataType: "EntitySet<Comment>", key: false, computed: false, required: false, length: 20, schemaCreate: null },
            { name: "picture", dataType: "string", key: false, computed: false, required: false, length: 20, schemaCreate: null }
        ],
        schemaCreate: null
    }
});