using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JayData.Test.CommonItems.Entities
{
    [Table("TestTable2")]
    public partial class TestItemGuid
    {
        [Key]
        public Guid Id { get; set; }
        public int? i0 { get; set; }
        public bool? b0 { get; set; }
        public string s0 { get; set; }
        public virtual TestItemGroup Group { get; set; }

    }
}
