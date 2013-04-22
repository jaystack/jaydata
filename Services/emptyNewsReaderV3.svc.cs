using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.Objects;
using System.Data.Services;
using System.Data.Services.Common;
using System.Linq;
using System.ServiceModel.Web;
using System.Web;
using JayData.NewsReader;

namespace JayData
{
    public class EmptyNewsReaderServiceV3 : DataService<ObjectContext>
    {
        // This method is called only once to initialize service-wide policies.
        public static void InitializeService(DataServiceConfiguration config)
        {
            // TODO: set rules to indicate which entity sets and service operations are visible, updatable, etc.
            // Examples:
            config.SetEntitySetAccessRule("*", EntitySetRights.All);
            config.SetServiceOperationAccessRule("*", ServiceOperationRights.All);
            config.DataServiceBehavior.MaxProtocolVersion = DataServiceProtocolVersion.V3;
            config.UseVerboseErrors = true;
            //config.SetEntitySetPageSize("Articles", 2);
            //config.SetEntitySetPageSize("Users", 2);
            //config.SetEntitySetPageSize("UserProfiles", 2);
            //config.SetEntitySetPageSize("Categories", 2);
        }

        protected override ObjectContext CreateDataSource()
        {
            var newsReader = new EmptyNewsReaderContext();
            var context = ((IObjectContextAdapter)newsReader).ObjectContext;
            context.ContextOptions.ProxyCreationEnabled = false;
            return context;
        }
        [WebGet]
        public Location PrefilteredLocation(int minId, string startsWith)
        {
            return this.CurrentDataSource.CreateObjectSet<Article>().Where(a => a.Id > minId && a.Title.StartsWith(startsWith)).Select(a => a.Reviewer.Profile.Location).First();
        }
        [WebGet]
        public IQueryable<Location> PrefilteredLocations(int minId, string startsWith)
        {
            return this.CurrentDataSource.CreateObjectSet<Article>().Where(a => a.Id > minId && a.Title.StartsWith(startsWith)).Select(a => a.Reviewer.Profile.Location);
        }
        [WebGet]
        public int PrefilteredArticlesCount(int minId, string startsWith)
        {
            return this.CurrentDataSource.CreateObjectSet<Article>().Where(a => a.Id > minId && a.Title.StartsWith(startsWith)).Count();
        }
        [WebGet]
        public IQueryable<int> PrefilteredArticlesId(int minId, string startsWith)
        {

            return this.CurrentDataSource.CreateObjectSet<Article>().Where(a => a.Id > minId && a.Title.StartsWith(startsWith)).Select(a => a.Id);
        }
        [WebGet]
        public IQueryable<Article> PrefilteredArticles(int minId, string startsWith)
        {
            return this.CurrentDataSource.CreateObjectSet<Article>().Where(a => a.Id > minId && a.Title.StartsWith(startsWith));
        }
        [WebGet]
        public ICollection<Article> PrefilteredArticleList(int minId, string startsWith)
        {
            return new List<Article>(this.CurrentDataSource.CreateObjectSet<Article>().Where(a => a.Id > minId && a.Title.StartsWith(startsWith)).Select(a => a));
        }
        [WebGet]
        public Article PrefilteredArticle(int minId, string startsWith)
        {
            return this.CurrentDataSource.CreateObjectSet<Article>().Where(a => a.Id > minId && a.Title.StartsWith(startsWith)).First();
        }
        [WebInvoke(Method = "POST")]
        public void CreateCategory(string title)
        {
            this.CurrentDataSource.CreateObjectSet<Category>().AddObject(new Category { Title = title });
            this.CurrentDataSource.SaveChanges();
        }

        [WebGet]
        public TestItem Test(double dd)
        {
            return new TestItem()
            {
                l0 = -56531531,
                de0 = 153135641,
                //n0 = 1.7976931348623157e+307,
                d0 = DateTime.Now,
                b1 = 34,
                n0 = dd
            };
        }
    }
}
