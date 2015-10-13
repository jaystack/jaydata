using JayData.Models.CollectionProp;
using JayData.Models.GeoData;
using JayData.Models.ODataInheritance;
using JayData.NewsReader;
using Microsoft.Data.Edm;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Spatial;
using System.Web.Http;
using System.Web.Http.OData.Builder;

namespace jaydata
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.Routes.MapHttpRoute(
                name: "DefaultApi2",
                routeTemplate: "api/{controller}/TestItemTypes/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            config.Routes.MapHttpRoute(
                name: "DefaultApi3",
                routeTemplate: "api/{controller}/CollectionProps/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );


            ODataConventionModelBuilder modelBuilder = new ODataConventionModelBuilder();
            var cset = modelBuilder.EntitySet<Category>("Categories");
            cset.EntityType.HasKey(a => a.Id);

            var aset = modelBuilder.EntitySet<Article>("Articles");
            aset.EntityType.HasKey(a => a.Id);

            var uset = modelBuilder.EntitySet<User>("Users");
            uset.EntityType.HasKey(a => a.Id);

            var tcset = modelBuilder.EntitySet<TagConnection>("TagConnections");
            tcset.EntityType.HasKey(a => a.Id);

            var tset = modelBuilder.EntitySet<Tag>("Tags");
            tset.EntityType.HasKey(a => a.Id);

            var upset = modelBuilder.EntitySet<UserProfile>("UserProfiles");
            upset.EntityType.HasKey(a => a.Id);


            var action = modelBuilder.Entity<Category>().Action("GetFirstArticleTitle");
            action.Parameter<string>("contains");
            action.Returns<string>();

            //var action2 = modelBuilder.Entity<Category>().TransientAction("GetFirstArticleTitle2");
            //action2.Parameter<string>("contains");
            //action2.Returns<string>();

            var action3 = modelBuilder.Entity<Category>().Collection.Action("GetFirstArticleTitle");
            action3.Parameter<string>("contains");
            action3.Returns<string>();

            //var action4 = modelBuilder.Action("GetFirstArticleTitle4");
            //action4.Parameter<string>("contains");
            //action4.Returns<string>();

            var action5 = modelBuilder.Entity<Category>().Action("LocationSwipe");
            action5.Parameter<GeographyPoint>("Loc");
            action5.Returns<GeographyPoint>();
            
            IEdmModel model = modelBuilder.GetEdmModel();
            config.Routes.MapODataRoute(routeName: "OData", routePrefix: "odata", model: model);



            ODataConventionModelBuilder modelBuilderInheriance = new ODataConventionModelBuilder();
            var car = modelBuilderInheriance.EntitySet<Car>("Cars");
            car.EntityType.DerivesFrom<Vehicle>();
            var carAction = car.EntityType.Collection.Action("Reset");
            carAction.Returns<bool>();

            var bike = modelBuilderInheriance.EntitySet<Bike>("Bikes");
            bike.EntityType.DerivesFrom<Vehicle>();
            var ship = modelBuilderInheriance.EntitySet<Ship>("Ships");

            IEdmModel modelInheritance = modelBuilderInheriance.GetEdmModel();
            config.Routes.MapODataRoute(routeName: "ODataInheritance", routePrefix: "odatainheritance", model: modelInheritance);



            ODataConventionModelBuilder modelBuilderGeoData = new ODataConventionModelBuilder();
            var place = modelBuilderGeoData.EntitySet<Place>("Places");

            IEdmModel modelGeoData = modelBuilderGeoData.GetEdmModel();
            config.Routes.MapODataRoute(routeName: "ODataGeoData", routePrefix: "odatageo", model: modelGeoData);


            ODataConventionModelBuilder modelBuilderPrimitives = new ODataConventionModelBuilder();
            var prim = modelBuilderPrimitives.EntitySet<TestItemType>("TestItemTypes");

            IEdmModel modelprim = modelBuilderPrimitives.GetEdmModel();
            config.Routes.MapODataRoute(routeName: "ODataprim", routePrefix: "odataprim", model: modelprim);

            ODataConventionModelBuilder modelBuilderColl = new ODataConventionModelBuilder();
            var coll = modelBuilderColl.EntitySet<TestEntity>("CollectionProps");

            IEdmModel modelcoll = modelBuilderColl.GetEdmModel();
            config.Routes.MapODataRoute(routeName: "ODatacoll", routePrefix: "odatacoll", model: modelcoll);
        }
    }
}
