using Microsoft.OData.Edm.Library;
using Microsoft.Spatial;
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
    public class TestItemGuid
    {
        public TestItemGuid()
        {
            openProperties = new Dictionary<string, object>();
            emails = new List<string>();
        }

        [Key]
        public Guid Id { get; set; }
        public int? i0 { get; set; }
        public bool? b0 { get; set; }
        public string s0 { get; set; }
        public virtual TestItemGroup Group { get; set; }

        //TODO: np refactor

        //Edm.Time not support https://github.com/OData/WebApi/issues/118
        public TimeOfDay time { get; set; }
        public Date date { get; set; }

        public DateTime t { get; set; }
        public TimeSpan dur { get; set; }
        //public  Duration dur { get; set; }
        public DateTimeOffset dtOffset { get; set; }
        public long lng { get; set; }
        public Decimal dec { get; set; }
        public float flt { get; set; }

        public IDictionary<string, object> openProperties { get; set; }

        public List<string> emails { get; set; }

        public GeographyPoint Entrance { get; set; }
    }
}
