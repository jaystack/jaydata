using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Data.Entity;
using System.Data.Services.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace JayData.NewsReader
{
    public class EmptyNewsReaderContext : DbContext
    {
        public EmptyNewsReaderContext()
            : base("emptyNewsReader")
        {
            Database.CreateIfNotExists();
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<TestItem>()
                .HasKey(i => i.Id)
                .Property(i => i.Id)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);
            //modelBuilder.Entity<Category>().Property(p => p.RowVersion).IsRowVersion().IsConcurrencyToken();
            //modelBuilder.Entity<Article>().Property(p => p.RowVersion).IsRowVersion().IsConcurrencyToken();
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
    public class NewsReaderContext : DbContext
    {
        static NewsReaderContext()
        {
            Database.SetInitializer(new EntitiesContextInitializer());
        }
        public NewsReaderContext()
            : base("newsReader")
        {

        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<TestItem>()
                .HasKey(i => i.Id)
                .Property(i => i.Id)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);
        }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Article> Articles { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<TestItem> TestTable { get; set; }
        public DbSet<TagConnection> TagConnections { get; set; }

        public DbSet<TestItemType> TestItemTypes { get; set; }
    }
    public class Category
    {
        [Key]
        public int Id { get; set; }
        //[Timestamp]
        public byte[] RowVersion { get; set; }
        public string Title { get; set; }
        public string Subtitle { get; set; }
        public string Description { get; set; }
        public virtual List<Article> Articles { get; set; }
    }
    public class Article
    {
        [Key]
        public int Id { get; set; }
        [Timestamp]
        public byte[] RowVersion { get; set; }
        //[Column(TypeName = "ntext"), MaxLength]
        [Required]
        public string Title { get; set; }
        //[Column(TypeName = "ntext"), MaxLength]
        public string Lead { get; set; }
        //[Column(TypeName = "ntext"), MaxLength]
        public string Body { get; set; }
        public DateTime? CreateDate { get; set; }
        public byte[] Thumbnail_LowRes { get; set; }
        public byte[] Thumbnail_HighRes { get; set; }
        public virtual Category Category { get; set; }
        public virtual List<TagConnection> Tags { get; set; }
        [InverseProperty("Articles")]
        public virtual User Author { get; set; }
        public virtual User Reviewer { get; set; }
    }
    public class Tag
    {
        [Key]
        public int Id { get; set; }
        public string Title { get; set; }
        public virtual List<TagConnection> Articles { get; set; }
    }
    public class TagConnection
    {
        [Key]
        public int Id { get; set; }
        public virtual Article Article { get; set; }
        public virtual Tag Tag { get; set; }
    }
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string LoginName { get; set; }
        public string Email { get; set; }
        public virtual List<Article> Articles { get; set; }
        public virtual UserProfile Profile { get; set; }
    }
    public class UserProfile
    {
        [Key]
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Bio { get; set; }
        public byte[] Avatar { get; set; }
        public DateTime? Birthday { get; set; }
        public virtual Location Location { get; set; }
        [Required]
        public virtual User User { get; set; }
    }
    [ComplexType]
    public class Location
    {
        public string Address { get; set; }
        public string City { get; set; }
        public int Zip { get; set; }
        public string Country { get; set; }
    }
    [Table("TestTable")]
    public class TestItem
    {
        [Key]
        public int Id { get; set; }
        public int? i0 { get; set; }
        public bool? b0 { get; set; }
        public string s0 { get; set; }
        public byte?[] blob { get; set; }
        public double? n0 { get; set; }
        public DateTime? d0 { get; set; }
        public virtual List<Tag> Tags { get; set; }
        public virtual User User { get; set; }
        public Guid? g0 { get; set; }

        public long? l0 { get; set; }
        public decimal de0 { get; set; }
        public byte? b1 { get; set; }


    }
    [Table("TestTable2")]
    public class TestItemGuid
    {
        [Key]
        public Guid Id { get; set; }
        public int? i0 { get; set; }
        public bool? b0 { get; set; }
        public string s0 { get; set; }
        public virtual TestItemGroup Group { get; set; }

    }
    public class TestItemGroup
    {
        [Key]
        public Guid Id { get; set; }
        public string Name { get; set; }
        public virtual List<TestItemGuid> Items { get; set; }

    }

    public class TestItemType
    {
        [Key]
        public int Id { get; set; }

        public byte?[] blob { get; set; }
        public bool? b0 { get; set; }
        public byte? b1 { get; set; }
        public DateTime? d0 { get; set; }
        public decimal de0 { get; set; }
        public double? n0 { get; set; }
        public Single? si0 { get; set; }
        public Guid? g0 { get; set; }
        public Int16? i16 { get; set; }
        public int? i0 { get; set; }
        public Int64? i64 { get; set; }
        //public SByte? sb { get; set; }
        public string s0 { get; set; }
        //public TimeSpan? ts0 { get; set; }
        //public DateTimeOffset? dto0 { get; set; }
    }

    public class EntitiesContextInitializer : DropCreateDatabaseIfModelChanges<NewsReaderContext>
    {
        protected override void Seed(NewsReaderContext context)
        {
            var usr1 = new User { LoginName = "Usr1", Email = "usr1@company.com", Profile = new UserProfile { FullName = "Full Name", Bio = "Bio1", Birthday = new DateTime(1975, 1, 1), Location = new Location { City = "City 1", Zip = 1117, Country = "Country 1", Address = "Test data1" } } };
            var usr2 = new User { LoginName = "Usr2", Email = "usr2@company.com", Profile = new UserProfile { FullName = "Full Name", Bio = "Bio2", Birthday = new DateTime(1976, 2, 1), Location = new Location { City = "City 2", Zip = 1118, Country = "Country 2", Address = "Test data2" } } };
            var usr3 = new User { LoginName = "Usr3", Email = "usr3@company.com", Profile = new UserProfile { FullName = "Full Name", Bio = "Bio3", Birthday = new DateTime(1977, 3, 1), Location = new Location { City = "City 3", Zip = 1119, Country = "Country 3", Address = "Test data3" } } };
            var usr4 = new User { LoginName = "Usr4", Email = "usr4@company.com", Profile = new UserProfile { FullName = "Full Name", Bio = "Bio4", Birthday = new DateTime(1978, 4, 1), Location = new Location { City = "City 4", Zip = 1120, Country = "Country 4", Address = "Test data4" } } };
            var usr5 = new User { LoginName = "Usr5", Email = "usr5@company.com", Profile = new UserProfile { FullName = "Full Name", Bio = "Bio5", Birthday = new DateTime(1979, 5, 1), Location = new Location { City = "City 5", Zip = 1121, Country = "Country 5", Address = "Test data5" } } };
            var usr6 = new User { LoginName = "StartsWithTest", Email = "swt@company.com", Profile = new UserProfile { FullName = "Starts With Test", Bio = "Bio6", Birthday = new DateTime(1980, 5, 1), Location = new Location { City = "City 6", Zip = 1122, Country = "Country 6", Address = "Test data6" } } };
            var cat1 = new Category { Title = "Sport" };
            var cat2 = new Category { Title = "World" };
            var cat3 = new Category { Title = "Politics" };
            var cat4 = new Category { Title = "Tech" };
            var cat5 = new Category { Title = "Health" };
            var tag1 = new Tag { Title = "Tag1" };
            var tag2 = new Tag { Title = "Tag2" };
            var tag3 = new Tag { Title = "Tag3" };

            var article1 = new Article { Title = "Article1", Lead = "Lead1", Body = "Body1", CreateDate = DateTime.Now, Category = cat1, Author = usr1, Reviewer = usr6 };
            var article2 = new Article { Title = "Article2", Lead = "Lead2", Body = "Body2", CreateDate = DateTime.Now, Category = cat1, Author = usr2, Reviewer = usr5 };
            var article3 = new Article { Title = "Article3", Lead = "Lead3", Body = "Body3", CreateDate = DateTime.Now, Category = cat1, Author = usr3, Reviewer = usr4 };
            var article4 = new Article { Title = "Article4", Lead = "Lead4", Body = "Body4", CreateDate = DateTime.Now, Category = cat1, Author = usr4, Reviewer = usr3 };
            var article5 = new Article { Title = "Article5", Lead = "Lead5", Body = "Body5", CreateDate = DateTime.Now, Category = cat1, Author = usr5, Reviewer = usr2 };

            var article21 = new Article { Title = "Article21", Lead = "Lead21", Body = "Body21", CreateDate = DateTime.Now, Category = cat2, Author = usr1, Reviewer = usr1 };
            var article22 = new Article { Title = "Article22", Lead = "Lead22", Body = "Body22", CreateDate = DateTime.Now, Category = cat2, Author = usr2, Reviewer = usr6 };
            var article23 = new Article { Title = "Article23", Lead = "Lead23", Body = "Body23", CreateDate = DateTime.Now, Category = cat2, Author = usr3, Reviewer = usr5 };
            var article24 = new Article { Title = "Article24", Lead = "Lead24", Body = "Body24", CreateDate = DateTime.Now, Category = cat2, Author = usr4, Reviewer = usr4 };
            var article25 = new Article { Title = "Article25", Lead = "Lead25", Body = "Body25", CreateDate = DateTime.Now, Category = cat2, Author = usr5, Reviewer = usr3 };

            var article31 = new Article { Title = "Article31", Lead = "Lead31", Body = "Body31", CreateDate = DateTime.Now, Category = cat3, Author = usr1, Reviewer = usr2 };
            var article32 = new Article { Title = "Article32", Lead = "Lead32", Body = "Body32", CreateDate = DateTime.Now, Category = cat3, Author = usr2, Reviewer = usr1 };
            var article33 = new Article { Title = "Article33", Lead = "Lead33", Body = "Body33", CreateDate = DateTime.Now, Category = cat3, Author = usr3, Reviewer = usr6 };
            var article34 = new Article { Title = "Article34", Lead = "Lead34", Body = "Body34", CreateDate = DateTime.Now, Category = cat3, Author = usr4, Reviewer = usr5 };
            var article35 = new Article { Title = "Article35", Lead = "Lead35", Body = "Body35", CreateDate = DateTime.Now, Category = cat3, Author = usr5, Reviewer = usr4 };

            var article41 = new Article { Title = "Article41", Lead = "Lead41", Body = "Body41", CreateDate = DateTime.Now, Category = cat4, Author = usr1, Reviewer = usr3 };
            var article42 = new Article { Title = "Article42", Lead = "Lead42", Body = "Body42", CreateDate = DateTime.Now, Category = cat4, Author = usr2, Reviewer = usr2 };
            var article43 = new Article { Title = "Article43", Lead = "Lead43", Body = "Body43", CreateDate = DateTime.Now, Category = cat4, Author = usr3, Reviewer = usr1 };
            var article44 = new Article { Title = "Article44", Lead = "Lead44", Body = "Body44", CreateDate = DateTime.Now, Category = cat4, Author = usr4, Reviewer = usr6 };
            var article45 = new Article { Title = "Article45", Lead = "Lead45", Body = "Body45", CreateDate = DateTime.Now, Category = cat4, Author = usr5, Reviewer = usr5 };

            var article51 = new Article { Title = "Article51", Lead = "Lead51", Body = "Body51", CreateDate = DateTime.Now, Category = cat5, Author = usr1, Reviewer = usr4 };
            var article52 = new Article { Title = "Article52", Lead = "Lead52", Body = "Body52", CreateDate = DateTime.Now, Category = cat5, Author = usr2, Reviewer = usr3 };
            var article53 = new Article { Title = "Article53", Lead = "Lead53", Body = "Body53", CreateDate = DateTime.Now, Category = cat5, Author = usr3, Reviewer = usr2 };
            var article54 = new Article { Title = "Article54", Lead = "Lead54", Body = "Body54", CreateDate = DateTime.Now, Category = cat5, Author = usr4, Reviewer = usr1 };
            var article55 = new Article { Title = "Article55", Lead = "Lead55", Body = "Body55", CreateDate = DateTime.Now, Category = cat5, Author = usr5, Reviewer = usr6 };

            var article65 = new Article { Title = "Article65", Lead = "Lead65", Body = "Body65", CreateDate = DateTime.Now, Category = cat3, Author = usr6, Reviewer = usr5 };

            context.TagConnections.Add(new TagConnection { Article = article1, Tag = tag1 }); context.TagConnections.Add(new TagConnection { Article = article1, Tag = tag2 });
            context.TagConnections.Add(new TagConnection { Article = article2, Tag = tag3 }); context.TagConnections.Add(new TagConnection { Article = article2, Tag = tag1 });
            context.TagConnections.Add(new TagConnection { Article = article3, Tag = tag2 }); context.TagConnections.Add(new TagConnection { Article = article3, Tag = tag3 });
            context.TagConnections.Add(new TagConnection { Article = article4, Tag = tag1 }); context.TagConnections.Add(new TagConnection { Article = article4, Tag = tag2 });
            context.TagConnections.Add(new TagConnection { Article = article5, Tag = tag3 }); context.TagConnections.Add(new TagConnection { Article = article5, Tag = tag1 });

            context.TagConnections.Add(new TagConnection { Article = article21, Tag = tag2 }); context.TagConnections.Add(new TagConnection { Article = article21, Tag = tag3 });
            context.TagConnections.Add(new TagConnection { Article = article22, Tag = tag1 }); context.TagConnections.Add(new TagConnection { Article = article22, Tag = tag2 });
            context.TagConnections.Add(new TagConnection { Article = article23, Tag = tag3 }); context.TagConnections.Add(new TagConnection { Article = article23, Tag = tag1 });
            context.TagConnections.Add(new TagConnection { Article = article24, Tag = tag2 }); context.TagConnections.Add(new TagConnection { Article = article24, Tag = tag3 });
            context.TagConnections.Add(new TagConnection { Article = article25, Tag = tag1 }); context.TagConnections.Add(new TagConnection { Article = article25, Tag = tag2 });

            context.TagConnections.Add(new TagConnection { Article = article31, Tag = tag3 }); context.TagConnections.Add(new TagConnection { Article = article31, Tag = tag1 });
            context.TagConnections.Add(new TagConnection { Article = article32, Tag = tag2 }); context.TagConnections.Add(new TagConnection { Article = article32, Tag = tag3 });
            context.TagConnections.Add(new TagConnection { Article = article33, Tag = tag1 }); context.TagConnections.Add(new TagConnection { Article = article33, Tag = tag2 });
            context.TagConnections.Add(new TagConnection { Article = article34, Tag = tag3 }); context.TagConnections.Add(new TagConnection { Article = article34, Tag = tag1 });
            context.TagConnections.Add(new TagConnection { Article = article35, Tag = tag2 }); context.TagConnections.Add(new TagConnection { Article = article35, Tag = tag3 });

            context.TagConnections.Add(new TagConnection { Article = article41, Tag = tag2 }); context.TagConnections.Add(new TagConnection { Article = article41, Tag = tag3 });
            context.TagConnections.Add(new TagConnection { Article = article42, Tag = tag1 }); context.TagConnections.Add(new TagConnection { Article = article42, Tag = tag2 });
            context.TagConnections.Add(new TagConnection { Article = article43, Tag = tag3 }); context.TagConnections.Add(new TagConnection { Article = article43, Tag = tag1 });
            context.TagConnections.Add(new TagConnection { Article = article44, Tag = tag2 }); context.TagConnections.Add(new TagConnection { Article = article44, Tag = tag3 });
            context.TagConnections.Add(new TagConnection { Article = article45, Tag = tag1 }); context.TagConnections.Add(new TagConnection { Article = article45, Tag = tag2 });

            context.TagConnections.Add(new TagConnection { Article = article51, Tag = tag3 }); context.TagConnections.Add(new TagConnection { Article = article51, Tag = tag1 });
            context.TagConnections.Add(new TagConnection { Article = article52, Tag = tag2 }); context.TagConnections.Add(new TagConnection { Article = article52, Tag = tag3 });
            context.TagConnections.Add(new TagConnection { Article = article53, Tag = tag1 }); context.TagConnections.Add(new TagConnection { Article = article53, Tag = tag2 });
            context.TagConnections.Add(new TagConnection { Article = article54, Tag = tag3 }); context.TagConnections.Add(new TagConnection { Article = article54, Tag = tag1 });
            context.TagConnections.Add(new TagConnection { Article = article55, Tag = tag2 }); context.TagConnections.Add(new TagConnection { Article = article55, Tag = tag3 });

            context.TagConnections.Add(new TagConnection { Article = article65, Tag = tag2 }); context.TagConnections.Add(new TagConnection { Article = article65, Tag = tag3 });

            context.TestTable.Add(new TestItem { Id = 2, i0 = 0, b0 = true, d0 = new DateTime(2011, 1, 10), n0 = 7.5, s0 = "alma" });
            context.TestTable.Add(new TestItem { Id = 4, i0 = 1, b0 = false, d0 = new DateTime(2011, 5, 15), n0 = 37.35, s0 = "korte" });
            context.TestTable.Add(new TestItem { Id = 6, i0 = 2, b0 = true, d0 = new DateTime(2012, 1, 10), n0 = 27.25, s0 = "banan" });
            context.TestTable.Add(new TestItem { Id = 8, i0 = 3, b0 = false, d0 = new DateTime(2012, 5, 15), n0 = 17.15, s0 = "barack" });
            context.TestTable.Add(new TestItem { Id = 10, i0 = 4, b0 = null, d0 = new DateTime(2015, 5, 15), n0 = 67.65, s0 = "árvíztűrő tükörfúrógép ÁRVÍZTŰRŐ TÜKÖRFÚRÓGÉP" });
            context.TestTable.Add(new TestItem { Id = 12, i0 = 0, b0 = true, d0 = new DateTime(2011, 1, 10), n0 = 7.5, s0 = "alma" });
            context.TestTable.Add(new TestItem { Id = 14, i0 = 1, b0 = false, d0 = new DateTime(2011, 5, 15), n0 = 37.35, s0 = "korte" });
            context.TestTable.Add(new TestItem { Id = 16, i0 = 2, b0 = true, d0 = new DateTime(2012, 1, 10), n0 = 27.25, s0 = "banan" });
            context.TestTable.Add(new TestItem { Id = 18, i0 = 3, b0 = false, d0 = new DateTime(2012, 5, 15), n0 = 17.15, s0 = "barack" });
            context.TestTable.Add(new TestItem { Id = 20, i0 = 4, b0 = null, d0 = new DateTime(2015, 5, 15), n0 = 67.65, s0 = "árvíztűrő tükörfúrógép ÁRVÍZTŰRŐ TÜKÖRFÚRÓGÉP" });
            context.SaveChanges();
        }
    }
}