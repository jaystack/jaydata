using JayData.Test.CommonItems.Entities;
using Microsoft.OData.Edm;
using Microsoft.OData.Edm.Library;
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
            var art = client.EntitySet<Article>("Articles");
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


            var tig1 = client.EntityType<TestItemGuid>().Collection.Action("GetTitles");
            tig1.Parameter<int>("count");
            tig1.Returns<string>();

            var tig2 = client.EntityType<TestItemGuid>().Action("GetDisplayText");

            tig2.ReturnsCollection<string>();


            var a6 = client.Action("SAction1");
            a6.Parameter<int>("number");
            a6.Returns<string>();

            var a6_b = client.Action("SAction2");
            a6_b.Parameter<int>("count");
            a6_b.ReturnsCollectionFromEntitySet<Article>("Articles");

            var a7 = client.Function("SFunction1");
            a7.Parameter<int>("number");
            a7.ReturnsCollection<string>();

            var a8 = client.Function("SFunction2");
            a8.Parameter<int>("number");
            a8.IncludeInServiceDocument = false;
            a8.Returns<string>();


            client.EntityType<Article>().Ignore(a => a.Category);
            client.EntityType<Category>().Ignore(a => a.Articles);

            client.EntityType<Article>().Ignore(a => a.Reviewer);
            client.EntityType<Article>().Ignore(a => a.Author);
            client.EntityType<User>().Ignore(a => a.Articles);

            client.EntityType<User>().Ignore(a => a.Profile);
            client.EntityType<UserProfile>().Ignore(a => a.User);

            client.EntityType<TagConnection>().Ignore(a => a.Article);
            client.EntityType<TagConnection>().Ignore(a => a.Tag);
            client.EntityType<Article>().Ignore(a => a.Tags);
            client.EntityType<Tag>().Ignore(a => a.Articles);

            client.EntityType<TestItemGuid>().Ignore(a => a.Group);
            client.EntityType<TestItemGroup>().Ignore(a => a.Items);

            var model = client.GetEdmModel();



            UpgradeBidirectionalNavigationProperties(model, "Articles", "Categories", "JayData.Test.CommonItems.Entities.Article", "JayData.Test.CommonItems.Entities.Category", "Category", "Articles", EdmMultiplicity.ZeroOrOne, EdmMultiplicity.Many);

            UpgradeBidirectionalNavigationProperties(model, "Articles", "Users", "JayData.Test.CommonItems.Entities.Article", "JayData.Test.CommonItems.Entities.User", "Reviewer", "RevieweredArticles", EdmMultiplicity.ZeroOrOne, EdmMultiplicity.Many);
            UpgradeBidirectionalNavigationProperties(model, "Articles", "Users", "JayData.Test.CommonItems.Entities.Article", "JayData.Test.CommonItems.Entities.User", "Author", "AuthoredArticles", EdmMultiplicity.ZeroOrOne, EdmMultiplicity.Many);

            UpgradeBidirectionalNavigationProperties(model, "Users", "UserProfiles", "JayData.Test.CommonItems.Entities.User", "JayData.Test.CommonItems.Entities.UserProfile", "Profile", "User", EdmMultiplicity.ZeroOrOne, EdmMultiplicity.One);

            UpgradeBidirectionalNavigationProperties(model, "TagConnections", "Articles", "JayData.Test.CommonItems.Entities.TagConnection", "JayData.Test.CommonItems.Entities.Article", "Article", "Tags", EdmMultiplicity.ZeroOrOne, EdmMultiplicity.Many);
            UpgradeBidirectionalNavigationProperties(model, "TagConnections", "Tags", "JayData.Test.CommonItems.Entities.TagConnection", "JayData.Test.CommonItems.Entities.Tag", "Tag", "Articles", EdmMultiplicity.ZeroOrOne, EdmMultiplicity.Many);

            UpgradeBidirectionalNavigationProperties(model, "TestTable2", "TestItemGroups", "JayData.Test.CommonItems.Entities.TestItemGuid", "JayData.Test.CommonItems.Entities.TestItemGroup", "Group", "Items", EdmMultiplicity.ZeroOrOne, EdmMultiplicity.Many);



            IList<IODataRoutingConvention> conventions = ODataRoutingConventions.CreateDefaultWithAttributeRouting(config, model);
            conventions.Insert(0, new ContainmentRoutingConvention());

            config.MapODataServiceRoute("odata", "odata", model, new DefaultODataPathHandler(), conventions);

            appBuilder.UseWebApi(config);
        }

        public static void UpgradeBidirectionalNavigationProperties(Microsoft.OData.Edm.IEdmModel model, string setName, string partnerSetName, string elementTypeName, string partnerElementTypeName, string navigationName, string partnerName, EdmMultiplicity multipl, EdmMultiplicity partnerMultipl)
        {
            var fromSet = (EdmEntitySet)model.EntityContainer.FindEntitySet(setName);
            var partnerSet = (EdmEntitySet)model.EntityContainer.FindEntitySet(partnerSetName);

            var fromType = (EdmEntityType)model.FindDeclaredType(elementTypeName);
            var partnerType = (EdmEntityType)model.FindDeclaredType(partnerElementTypeName);

            if (fromType == null)
                throw new Exception("fromType is null");

            if (partnerType == null)
                throw new Exception("partnerType is null");

            var partsProperty = new EdmNavigationPropertyInfo();
            partsProperty.Name = navigationName;
            partsProperty.TargetMultiplicity = multipl;
            partsProperty.Target = partnerType;
            partsProperty.ContainsTarget = false;
            partsProperty.OnDelete = EdmOnDeleteAction.None;

            var partnerProperty = new EdmNavigationPropertyInfo();
            partnerProperty.Name = partnerName;
            partnerProperty.TargetMultiplicity = partnerMultipl;
            partnerProperty.Target = fromType;
            partnerProperty.ContainsTarget = false;
            partnerProperty.OnDelete = EdmOnDeleteAction.None;

            fromSet.AddNavigationTarget(fromType.AddBidirectionalNavigation(partsProperty, partnerProperty), partnerSet);
        }
    }
}
