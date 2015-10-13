using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace JayData.Models.CollectionProp
{
    public class TestEntity
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string[] Groups { get; set; }
        public ComplexEntity[] Complexes { get; set; }



        public static IQueryable<TestEntity> CreateData() {
            
            var d = new List<TestEntity>();
            d.Add(new TestEntity()
            {
                Id = 0,
                Name = "Name",
                Groups = new string[] { "name1", "name2" },
                Complexes = new ComplexEntity[]{
                    new ComplexEntity() { Name = "Name", Created = DateTime.Now, Index = 1, LargeNum = 156315313513 },
                    new ComplexEntity() { Name = "Name2", Created = DateTime.Now, Index = 3, LargeNum = 64651321353 },
                    new ComplexEntity() { Name = "Name3", Created = DateTime.Now, Index = 2, LargeNum = 9879323132 }
                }
            });
            return d.AsQueryable();
        }
    }

    public class ComplexEntity
    {
        public string Name { get; set; }
        public DateTime Created { get; set; }
        public int Index { get; set; }
        public long LargeNum { get; set; }
    }
}