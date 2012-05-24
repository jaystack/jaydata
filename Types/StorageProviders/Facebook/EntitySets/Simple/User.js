
/// https://developers.facebook.com/docs/reference/api/user/

$data.storageProviders.facebook.EntitySets.FacebookSimpleEntityContext.User = $data.EntitySet.define({
    name: "User",
    fields: {
        items: [
            { name: "id", dataType: "string", key: true, computed: true, required: true, length: 64, schemaCreate: null },
            { name: "name", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "first_name", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "middle_name", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "last_name", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "gender", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "locale", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "languages", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "link", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "username", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "third_party_id", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "installed", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "timezone", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "updated_time", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "verified", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "bio", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "birthday", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "education", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "email", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "hometown", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "interested_in", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "location", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "political", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "favorite_athletes", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "favorite_teams", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "quotes", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "relationship_status", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "religion", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "significant_other", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "video_upload_limits", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "website", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null },
            { name: "work", dataType: "string", key: false, computed: false, required: true, length: 20, schemaCreate: null }
        ]
    },
    schemaCreate: null
});