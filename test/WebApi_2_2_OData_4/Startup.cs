using JayData.Test.CommonItems.Entities;
using Microsoft.Spatial;
using Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.OData.Builder;
using System.Web.OData.Extensions;
using System.Web.OData.Routing;
using System.Web.OData.Routing.Conventions;

namespace WebApi_2_2_OData_4
{
    public class Startup
    {
        // This code configures Web API. The Startup class is specified as a type
        // parameter in the WebApp.Start method.
        public void Configuration(IAppBuilder appBuilder)
        {
            System.Data.Entity.Database.SetInitializer(new JayData.Test.WebApi_2_2_OData_4.Model.initdb());
            // Configure Web API for self-host. 
            HttpConfiguration config = new HttpConfiguration();
            appBuilder.UseCors(Microsoft.Owin.Cors.CorsOptions.AllowAll);
            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            var client = new ODataConventionModelBuilder();
            //client.Namespace = "Test";
            client.EntitySet<User>("Users");
            var a = client.EntitySet<Article>("Articles");
            var aa = client.EntityType<Article>();
            aa.DerivesFrom<MyTClass>();
            client.EntitySet<UserProfile>("UserProfiles");

            //var mc = client.EntityType<MyTClass>();
            //mc.HasDynamicProperties(x => x.ttt);

            var c = client.EntitySet<Category>("Categories");
            var cc = client.EntityType<Category>();
            cc.DerivesFrom<MyTClass>();
            client.EntitySet<Tag>("Tags");
            client.EntitySet<TestItem>("TestTable");
            client.EntitySet<TagConnection>("TagConnections");
            client.EntitySet<TestItemGuid>("TestTable2");
            client.EntitySet<TestItemGroup>("TestItemGroups");
            client.EntitySet<TestItemType>("TestItemTypes");


            client.AddEnumType(typeof(UserType));


            var action = client.EntityType<Category>().Action("GetFirstArticleTitle");
            action.Parameter<string>("contains");
            action.Returns<string>();

            var action3 = client.EntityType<Category>().Collection.Action("GetFirstArticleTitle");
            action3.Parameter<string>("contains");
            action3.Returns<string>();

            var action5 = client.EntityType<Category>().Function("LocationSwipe");
            action5.Parameter<GeographyPoint>("Loc");
            action5.Returns<GeographyPoint>();


            var a6 = client.Action("SAction1");
            a6.Parameter<int>("number1");
            a6.Returns<string>();

            var a6_b = client.Action("SAction2");
            a6_b.Parameter<int>("count");
            a6_b.ReturnsCollectionFromEntitySet<Article>("Articles");

            var a7 = client.Function("SFunction1");
            a7.Parameter<int>("number2");
            a7.ReturnsCollection<string>();

            var a8 = client.Function("SFunction2");
            a8.Parameter<int>("number3");
            a8.IncludeInServiceDocument = false;
            a8.Returns<string>();


            var model = client.GetEdmModel();
            IList<IODataRoutingConvention> conventions = ODataRoutingConventions.CreateDefaultWithAttributeRouting(config, model);
            conventions.Insert(0, new ContainmentRoutingConvention());

            config.MapODataServiceRoute("odata", "odata", model, new DefaultODataPathHandler(), conventions);

            appBuilder.UseWebApi(config);
        }
    }
}
