using Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.OData;
using System.Web.Http.OData.Extensions;
using System.Web.Http.OData.Builder;
using JayData.Test.CommonItems.Entities;


namespace JayData.Test.WebApi_2_2_OData_1_3
{
    public class Startup
    {
        // This code configures Web API. The Startup class is specified as a type
        // parameter in the WebApp.Start method.
        public void Configuration(IAppBuilder appBuilder)
        {
            // Configure Web API for self-host. 
            HttpConfiguration config = new HttpConfiguration();
            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            var builder_client_v2 = new ODataConventionModelBuilder();
            builder_client_v2.EntitySet<User>("Users");
            builder_client_v2.EntitySet<Article>("Articles");
            builder_client_v2.EntitySet<UserProfile>("UserProfiles");

            builder_client_v2.EntitySet<Category>("Categories");
            builder_client_v2.EntitySet<Tag>("Tags");
            builder_client_v2.EntitySet<TestItem>("TestTable");
            builder_client_v2.EntitySet<TagConnection>("TagConnections");
            builder_client_v2.EntitySet<TestItemGuid>("TestTable2");
            builder_client_v2.EntitySet<TestItemGroup>("TestItemGroups");
            builder_client_v2.EntitySet<TestItemType>("TestItemTypes");

            builder_client_v2.DataServiceVersion = new Version(3, 0);
            builder_client_v2.MaxDataServiceVersion = new Version(3, 0);
            config.Routes.MapODataServiceRoute("odata", "odata", builder_client_v2.GetEdmModel());

            appBuilder.UseWebApi(config);
        }
    } 
}
