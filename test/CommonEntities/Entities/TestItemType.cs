using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JayData.Test.CommonItems.Entities
{
    public partial class TestItemType
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
}
