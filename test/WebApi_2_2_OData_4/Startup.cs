using JayData.Test.CommonItems.Entities;
using Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.OData.Builder;
using System.Web.OData.Extensions;

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
            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            var client = new ODataConventionModelBuilder();
            client.EntitySet<User>("Users");
            client.EntitySet<Article>("Articles");
            client.EntitySet<UserProfile>("UserProfiles");

            client.EntitySet<Category>("Categories");
            client.EntitySet<Tag>("Tags");
            client.EntitySet<TestItem>("TestTable");
            client.EntitySet<TagConnection>("TagConnections");
            client.EntitySet<TestItemGuid>("TestTable2");
            client.EntitySet<TestItemGroup>("TestItemGroups");
            client.EntitySet<TestItemType>("TestItemTypes");

            config.MapODataServiceRoute("odata", "odata", client.GetEdmModel());

            appBuilder.UseWebApi(config);
        }
    } 
}
