using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JayData.Test.CommonItems.Entities
{
    public partial class Category
    {
        [Key]
        public int Id { get; set; }
        //[Timestamp]
        public byte[] RowVersion { get; set; }
        public string Title { get; set; }
        public string Subtitle { get; set; }
        public string Description { get; set; }
        public virtual IList<Article> Articles { get; set; }
    }
}
