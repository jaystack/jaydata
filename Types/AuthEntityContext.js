//$data.EntitySetRights = {
//    None: 0,
//    ReadSingle: 1,
//    ReadMultiple: 2,
//    WriteAppend: 3,
//    WriteReplace: 4,
//    WriteDelete: 5,
//    WriteMerge: 6,
//    AllRead: 7,
//    AllWrite: 8,
//    All: 9
//};
//$data.Class.define('$data.AuthEntityContext', $data.EntityContext, null,
//{
//    Users: {
//        dataType: $data.EntitySet, elementType: $data.Class.define("User", $data.Entity, null, {
//            Id: { dataType: "int", key: true, computed: true, required: true },
//            UserName: { dataType: "string", required: true }
//        }, null)
//    },
//    AccessRules: {
//        dataType: $data.EntitySet, elementType: $data.Class.define("AccessRule", $data.Entity, null, {
//            Id: { dataType: "int", key: true, computed: true, required: true },
//            EntitySetName: { dataType: "string", required: true },
//            Right: { dataType: "int", required: true },
//            UserId: { dataType: "int", required: true }
//        }, null)
//    }
//}, null);