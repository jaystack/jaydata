using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JayData.Test.CommonItems.Entities
{
    [Table("TestTable")]
    public partial class TestItem
    {
        [Key]
        public int Id { get; set; }
        public int? i0 { get; set; }
        public bool? b0 { get; set; }
        public string s0 { get; set; }
        public byte?[] blob { get; set; }
        public double? n0 { get; set; }
        public DateTime? d0 { get; set; }
        //public virtual List<Tag> Tags { get; set; }
        //public virtual User User { get; set; }
        public Guid? g0 { get; set; }

        public long? l0 { get; set; }
        public decimal de0 { get; set; }
        public byte? b1 { get; set; }


    }
}
