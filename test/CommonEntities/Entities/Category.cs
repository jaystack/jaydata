using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JayData.Test.CommonItems.Entities
{
    public abstract class MyTClass
    {
        [Key]
        public int Id { get; set; }
        public string Title { get; set; }

        public IDictionary<string, object> ttt { get; set; }
    }


    public partial class Category : MyTClass
    {
        //[Timestamp]
        public byte[] RowVersion { get; set; }
        public string Subtitle { get; set; }
        public string Description { get; set; }
        public virtual IList<Article> Articles { get; set; }
    }
}
