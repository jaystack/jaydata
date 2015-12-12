using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JayData.Test.CommonItems.Entities
{
    public partial class Article : MyTClass
    {
        [Timestamp]
        public byte[] RowVersion { get; set; }
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
}
