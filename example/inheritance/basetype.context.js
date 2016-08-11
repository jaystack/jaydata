(function(mod) {
    if (typeof exports == "object" && typeof module == "object") return mod(exports, require("../../dist/core.js")); // CommonJS
    if (typeof define == "function" && define.amd) return define(["exports", "jaydata/core"], mod); // AMD
    mod($data.generatedContext || ($data.generatedContext = {}), $data); // Plain browser env
})(function(exports, $data) {

    var types = {};

    types["JayData.Test.CommonItems.Entities.UserType"] = $data.createEnum("JayData.Test.CommonItems.Entities.UserType", [{
        "name": "Admin",
        "index": 0,
        "value": 0
    }, {
        "name": "Customer",
        "index": 1,
        "value": 1
    }, {
        "name": "Guest",
        "index": 2,
        "value": 2
    }]);

    types["JayData.Test.CommonItems.Entities.Location"] = $data("$data.Entity").extend("JayData.Test.CommonItems.Entities.Location", {
        Address: {
            "type": "Edm.String"
        },
        City: {
            "type": "Edm.String"
        },
        Zip: {
            "type": "Edm.Int32",
            "nullable": false,
            "required": true
        },
        Country: {
            "type": "Edm.String"
        }
    });

    types["JayData.Test.CommonItems.Entities.User"] = $data("$data.Entity").extend("JayData.Test.CommonItems.Entities.User", {
        Id: {
            "type": "Edm.Int32",
            "nullable": false,
            "key": true,
            "computed": true
        },
        LoginName: {
            "type": "Edm.String"
        },
        Email: {
            "type": "Edm.String"
        },
        UserType: {
            "type": "JayData.Test.CommonItems.Entities.UserType",
            "nullable": false,
            "required": true
        },
        ReviewedArticles: {
            "type": "Array",
            "elementType": "JayData.Test.CommonItems.Entities.Article",
            "inverseProperty": "Reviewer"
        },
        Articles: {
            "type": "Array",
            "elementType": "JayData.Test.CommonItems.Entities.Article",
            "inverseProperty": "Author"
        },
        Profile: {
            "type": "JayData.Test.CommonItems.Entities.UserProfile",
            "inverseProperty": "User"
        }
    });

    types["JayData.Test.CommonItems.Entities.Article"] = $data("$data.Entity").extend("JayData.Test.CommonItems.Entities.Article", {
        RowVersion: {
            "type": "Edm.Binary",
            "concurrencyMode": $data.ConcurrencyMode.Fixed
        },
        Lead: {
            "type": "Edm.String"
        },
        Body: {
            "type": "Edm.String"
        },
        CreateDate: {
            "type": "Edm.DateTimeOffset"
        },
        Thumbnail_LowRes: {
            "type": "Edm.Binary"
        },
        Thumbnail_HighRes: {
            "type": "Edm.Binary"
        },
        Id: {
            "type": "Edm.Int32",
            "nullable": false,
            "key": true,
            "computed": true
        },
        Title: {
            "type": "Edm.String"
        },
        Category: {
            "type": "JayData.Test.CommonItems.Entities.Category",
            "inverseProperty": "Articles"
        },
        Reviewer: {
            "type": "JayData.Test.CommonItems.Entities.User",
            "inverseProperty": "ReviewedArticles"
        },
        Author: {
            "type": "JayData.Test.CommonItems.Entities.User",
            "inverseProperty": "Articles"
        },
        Tags: {
            "type": "Array",
            "elementType": "JayData.Test.CommonItems.Entities.TagConnection",
            "inverseProperty": "Article"
        }
    });

    types["JayData.Test.CommonItems.Entities.UserProfile"] = $data("$data.Entity").extend("JayData.Test.CommonItems.Entities.UserProfile", {
        Id: {
            "type": "Edm.Int32",
            "nullable": false,
            "key": true,
            "computed": true
        },
        FullName: {
            "type": "Edm.String"
        },
        Bio: {
            "type": "Edm.String"
        },
        Avatar: {
            "type": "Edm.Binary"
        },
        Birthday: {
            "type": "Edm.DateTimeOffset"
        },
        Location: {
            "type": "JayData.Test.CommonItems.Entities.Location"
        },
        User: {
            "type": "JayData.Test.CommonItems.Entities.User",
            "nullable": false,
            "required": true,
            "inverseProperty": "Profile"
        }
    });

    types["JayData.Test.CommonItems.Entities.Category"] = $data("$data.Entity").extend("JayData.Test.CommonItems.Entities.Category", {
        RowVersion: {
            "type": "Edm.Binary"
        },
        Subtitle: {
            "type": "Edm.String"
        },
        Description: {
            "type": "Edm.String"
        },
        Id: {
            "type": "Edm.Int32",
            "nullable": false,
            "key": true,
            "computed": true
        },
        Title: {
            "type": "Edm.String"
        },
        Articles: {
            "type": "Array",
            "elementType": "JayData.Test.CommonItems.Entities.Article",
            "inverseProperty": "Category"
        }
    });

    types["JayData.Test.CommonItems.Entities.Tag"] = $data("$data.Entity").extend("JayData.Test.CommonItems.Entities.Tag", {
        Id: {
            "type": "Edm.Int32",
            "nullable": false,
            "key": true,
            "computed": true
        },
        Title: {
            "type": "Edm.String"
        },
        Articles: {
            "type": "Array",
            "elementType": "JayData.Test.CommonItems.Entities.TagConnection",
            "inverseProperty": "Tag"
        }
    });

    types["JayData.Test.CommonItems.Entities.TestItem"] = $data("$data.Entity").extend("JayData.Test.CommonItems.Entities.TestItem", {
        Id: {
            "type": "Edm.Int32",
            "nullable": false,
            "required": true,
            "key": true
        },
        i0: {
            "type": "Edm.Int32"
        },
        b0: {
            "type": "Edm.Boolean"
        },
        s0: {
            "type": "Edm.String"
        },
        blob: {
            "type": "Array",
            "elementType": "Edm.Byte"
        },
        n0: {
            "type": "Edm.Double"
        },
        d0: {
            "type": "Edm.DateTimeOffset"
        },
        g0: {
            "type": "Edm.Guid"
        },
        l0: {
            "type": "Edm.Int64"
        },
        de0: {
            "type": "Edm.Decimal",
            "nullable": false,
            "required": true
        },
        b1: {
            "type": "Edm.Byte"
        }
    });

    types["JayData.Test.CommonItems.Entities.TagConnection"] = $data("$data.Entity").extend("JayData.Test.CommonItems.Entities.TagConnection", {
        Id: {
            "type": "Edm.Int32",
            "nullable": false,
            "key": true,
            "computed": true
        },
        Article: {
            "type": "JayData.Test.CommonItems.Entities.Article",
            "inverseProperty": "Tags"
        },
        Tag: {
            "type": "JayData.Test.CommonItems.Entities.Tag",
            "inverseProperty": "Articles"
        }
    });

    types["JayData.Test.CommonItems.Entities.TestItemGuid"] = $data("$data.Entity").extend("JayData.Test.CommonItems.Entities.TestItemGuid", {
        Id: {
            "type": "Edm.Guid",
            "nullable": false,
            "required": true,
            "key": true
        },
        i0: {
            "type": "Edm.Int32"
        },
        b0: {
            "type": "Edm.Boolean"
        },
        s0: {
            "type": "Edm.String"
        },
        time: {
            "type": "Edm.TimeOfDay",
            "nullable": false,
            "required": true
        },
        date: {
            "type": "Edm.Date",
            "nullable": false,
            "required": true
        },
        t: {
            "type": "Edm.DateTimeOffset",
            "nullable": false,
            "required": true
        },
        dur: {
            "type": "Edm.Duration",
            "nullable": false,
            "required": true
        },
        dtOffset: {
            "type": "Edm.DateTimeOffset",
            "nullable": false,
            "required": true
        },
        lng: {
            "type": "Edm.Int64",
            "nullable": false,
            "required": true
        },
        dec: {
            "type": "Edm.Decimal",
            "nullable": false,
            "required": true
        },
        flt: {
            "type": "Edm.Single",
            "nullable": false,
            "required": true
        },
        emails: {
            "type": "Array",
            "elementType": "Edm.String"
        },
        Group: {
            "type": "JayData.Test.CommonItems.Entities.TestItemGroup",
            "inverseProperty": "Items"
        },
        GetDisplayText: {
            "type": "$data.ServiceAction",
            "namespace": "Default",
            "returnType": "Edm.String",
            "params": []
        },
        Concatenate: {
            "type": "$data.ServiceAction",
            "namespace": "Default",
            "returnType": "Edm.String",
            "params": [{
                "name": "values",
                "type": "Array",
                "elementType": "Edm.String"
            }]
        }
    }, {
        openType: {
            "value": true
        }
    });

    types["JayData.Test.CommonItems.Entities.TestItemGroup"] = $data("$data.Entity").extend("JayData.Test.CommonItems.Entities.TestItemGroup", {
        Id: {
            "type": "Edm.Guid",
            "nullable": false,
            "required": true,
            "key": true
        },
        Name: {
            "type": "Edm.String"
        },
        Items: {
            "type": "Array",
            "elementType": "JayData.Test.CommonItems.Entities.TestItemGuid",
            "inverseProperty": "Group"
        }
    });

    types["JayData.Test.CommonItems.Entities.TestItemType"] = $data("$data.Entity").extend("JayData.Test.CommonItems.Entities.TestItemType", {
        Id: {
            "type": "Edm.Int32",
            "nullable": false,
            "required": true,
            "key": true
        },
        blob: {
            "type": "Edm.Binary"
        },
        b0: {
            "type": "Edm.Boolean"
        },
        b1: {
            "type": "Edm.Byte"
        },
        d0: {
            "type": "Edm.DateTimeOffset"
        },
        de0: {
            "type": "Edm.Decimal",
            "nullable": false,
            "required": true
        },
        n0: {
            "type": "Edm.Double"
        },
        si0: {
            "type": "Edm.Single"
        },
        g0: {
            "type": "Edm.Guid"
        },
        i16: {
            "type": "Edm.Int16"
        },
        i0: {
            "type": "Edm.Int32"
        },
        i64: {
            "type": "Edm.Int64"
        },
        s0: {
            "type": "Edm.String"
        }
    });

    types["Inheritance.GenericArticle"] = $data("$data.Entity").extend("Inheritance.GenericArticle", {
        Id: {
            "type": "Edm.Int32",
            "nullable": false,
            "required": true,
            "key": true
        },
        Title: {
            "type": "Edm.String"
        },
        Body: {
            "type": "Edm.String"
        },
        Deleted: {
            "type": "Edm.Boolean",
            "nullable": false,
            "required": true
        }
    });

    types["Inheritance.InternalArticle"] = types["Inheritance.GenericArticle"].extend("Inheritance.InternalArticle", {
        InternalTitle: {
            "type": "Edm.String"
        },
        InternalBody: {
            "type": "Edm.String"
        },
        ValidTill: {
            "type": "Edm.DateTimeOffset",
            "nullable": false,
            "required": true
        }
    });

    types["Inheritance.PublicArticle"] = types["Inheritance.GenericArticle"].extend("Inheritance.PublicArticle", {
        Lead: {
            "type": "Edm.String"
        },
        PublishDate: {
            "type": "Edm.DateTimeOffset",
            "nullable": false,
            "required": true
        }
    });

    exports.type = types["Default.Container"] = $data("$data.EntityContext").extend("Default.Container", {
        Users: {
            "type": "$data.EntitySet",
            "elementType": "JayData.Test.CommonItems.Entities.User"
        },
        Articles: {
            "type": "$data.EntitySet",
            "elementType": "JayData.Test.CommonItems.Entities.Article"
        },
        UserProfiles: {
            "type": "$data.EntitySet",
            "elementType": "JayData.Test.CommonItems.Entities.UserProfile"
        },
        Categories: {
            "type": "$data.EntitySet",
            "elementType": "JayData.Test.CommonItems.Entities.Category",
            "actions": {
                "SAction1": {
                    "type": "$data.ServiceAction",
                    "namespace": "Default",
                    "returnType": "$data.Queryable",
                    "params": [{
                        "name": "p1",
                        "type": "Edm.Int32"
                    }, {
                        "name": "p2",
                        "type": "Edm.String"
                    }, {
                        "name": "p3",
                        "type": "Array",
                        "elementType": "Edm.String"
                    }],
                    "elementType": "Edm.String"
                },
                "SFunction1": {
                    "type": "$data.ServiceFunction",
                    "namespace": "Default",
                    "returnType": "$data.Queryable",
                    "params": [{
                        "name": "p1",
                        "type": "Edm.Int32"
                    }, {
                        "name": "p2",
                        "type": "Edm.String"
                    }, {
                        "name": "p3",
                        "type": "Array",
                        "elementType": "Edm.String"
                    }],
                    "elementType": "Edm.String"
                }
            }
        },
        Tags: {
            "type": "$data.EntitySet",
            "elementType": "JayData.Test.CommonItems.Entities.Tag"
        },
        TestTable: {
            "type": "$data.EntitySet",
            "elementType": "JayData.Test.CommonItems.Entities.TestItem"
        },
        TagConnections: {
            "type": "$data.EntitySet",
            "elementType": "JayData.Test.CommonItems.Entities.TagConnection"
        },
        TestTable2: {
            "type": "$data.EntitySet",
            "elementType": "JayData.Test.CommonItems.Entities.TestItemGuid",
            "actions": {
                "GetTitles": {
                    "type": "$data.ServiceAction",
                    "namespace": "Default",
                    "returnType": "$data.Queryable",
                    "params": [{
                        "name": "count",
                        "type": "Edm.Int32"
                    }],
                    "elementType": "Edm.String"
                }
            }
        },
        TestItemGroups: {
            "type": "$data.EntitySet",
            "elementType": "JayData.Test.CommonItems.Entities.TestItemGroup"
        },
        TestItemTypes: {
            "type": "$data.EntitySet",
            "elementType": "JayData.Test.CommonItems.Entities.TestItemType"
        },
        GenericArticles: {
            "type": "$data.EntitySet",
            "elementType": "Inheritance.GenericArticle"
        },
        Delete: {
            "type": "$data.ServiceAction",
            "returnType": null,
            "params": []
        },
        InitDb: {
            "type": "$data.ServiceAction",
            "returnType": null,
            "params": []
        },
        SAction1: {
            "type": "$data.ServiceAction",
            "returnType": "Edm.String",
            "params": [{
                "name": "number",
                "type": "Edm.Int32"
            }]
        },
        SAction2: {
            "type": "$data.ServiceAction",
            "returnType": "$data.Queryable",
            "params": [{
                "name": "count",
                "type": "Edm.Int32"
            }],
            "elementType": "JayData.Test.CommonItems.Entities.Article"
        },
        SFunction1: {
            "type": "$data.ServiceFunction",
            "returnType": "$data.Queryable",
            "params": [{
                "name": "number",
                "type": "Edm.Int32"
            }],
            "elementType": "Edm.String"
        },
        SFunction2: {
            "type": "$data.ServiceFunction",
            "returnType": "Edm.String",
            "params": [{
                "name": "number",
                "type": "Edm.Int32"
            }]
        }
    });

    var ctxType = exports.type;
    exports.factory = function(config) {
        if (ctxType) {
            var cfg = $data.typeSystem.extend({
                name: "oData",
                oDataServiceHost: "http://localhost:9000/odata",
                withCredentials: false,
                maxDataServiceVersion: "4.0"
            }, config);
            return new ctxType(cfg);
        } else {
            return null;
        }
    };

    if (typeof Reflect !== "undefined" && typeof Reflect.defineMetadata === "function") {
        Reflect.defineMetadata("Org.OData.Core.V1.Computed", "true", types["JayData.Test.CommonItems.Entities.User"].prototype, "Id")
        Reflect.defineMetadata("Org.OData.Core.V1.Computed", "true", types["JayData.Test.CommonItems.Entities.Article"].prototype, "Id")
        Reflect.defineMetadata("UI.DisplayName", "Article identifier", types["JayData.Test.CommonItems.Entities.Article"].prototype, "Id")
        Reflect.defineMetadata("UI.ControlHint", "ReadOnly", types["JayData.Test.CommonItems.Entities.Article"].prototype, "Id")
        Reflect.defineMetadata("Org.OData.Core.V1.Computed", "true", types["JayData.Test.CommonItems.Entities.UserProfile"].prototype, "Id")
        Reflect.defineMetadata("Org.OData.Core.V1.Computed", "true", types["JayData.Test.CommonItems.Entities.Category"].prototype, "Id")
        Reflect.defineMetadata("UI.DisplayName", "Category identifier", types["JayData.Test.CommonItems.Entities.Category"].prototype, "Id")
        Reflect.defineMetadata("UI.ControlHint", "ReadOnly", types["JayData.Test.CommonItems.Entities.Category"].prototype, "Id")
        Reflect.defineMetadata("Org.OData.Core.V1.Computed", "true", types["JayData.Test.CommonItems.Entities.Tag"].prototype, "Id")
        Reflect.defineMetadata("Org.OData.Core.V1.Computed", "true", types["JayData.Test.CommonItems.Entities.TagConnection"].prototype, "Id")
        Reflect.defineMetadata("UI.DisplayName", "Categories", types["JayData.Test.CommonItems.Entities.Category"].prototype)
        Reflect.defineMetadata("UI.DisplayName", "Category name", types["JayData.Test.CommonItems.Entities.Category"].prototype, "Title")
        Reflect.defineMetadata("UI.ControlHint", "ShortText", types["JayData.Test.CommonItems.Entities.Category"].prototype, "Title")
        Reflect.defineMetadata("UI.DisplayName", "Articles", types["JayData.Test.CommonItems.Entities.Article"].prototype)
        Reflect.defineMetadata("UI.DisplayName", "Article title", types["JayData.Test.CommonItems.Entities.Article"].prototype, "Title")
        Reflect.defineMetadata("UI.ControlHint", "ShortText", types["JayData.Test.CommonItems.Entities.Article"].prototype, "Title")
        Reflect.defineMetadata("UI.DisplayName", "Article lead", types["JayData.Test.CommonItems.Entities.Article"].prototype, "Lead")
        Reflect.defineMetadata("UI.ControlHint", "ShortText", types["JayData.Test.CommonItems.Entities.Article"].prototype, "Lead")
        Reflect.defineMetadata("UI.DisplayName", "Article body", types["JayData.Test.CommonItems.Entities.Article"].prototype, "Body")
        Reflect.defineMetadata("UI.ControlHint", "LongText", types["JayData.Test.CommonItems.Entities.Article"].prototype, "Body")
        Reflect.defineMetadata("UI.ControlHint", "Hidden", types["JayData.Test.CommonItems.Entities.Article"].prototype, "RowVersion")
        Reflect.defineMetadata("UI.ControlHint", "ReadOnly", types["JayData.Test.CommonItems.Entities.Article"].prototype, "CreateDate")
        Reflect.defineMetadata("Org.OData.Core.V1.OptimisticConcurrency", ["RowVersion"], types["JayData.Test.CommonItems.Entities.Article"].prototype)
    }

});