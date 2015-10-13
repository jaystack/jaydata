using JayData.Test.CommonItems.Entities;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JayData.Test.WebApi_2_2_OData_1_3.Model
{
    public class NewsReaderContext:DbContext
    {
        public NewsReaderContext()
        {

        }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Article> Articles { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<TestItem> TestTable { get; set; }
        public DbSet<TagConnection> TagConnections { get; set; }
        public DbSet<TestItemGuid> TestTable2 { get; set; }
        public DbSet<TestItemGroup> TestItemGroups { get; set; }
        public DbSet<TestItemType> TestItemTypes { get; set; }
    }
}
