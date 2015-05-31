using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JayData.Test.CommonItems.Entities
{
    public partial class Tag
    {
        [Key]
        public int Id { get; set; }
        public string Title { get; set; }
        public virtual List<TagConnection> Articles { get; set; }
    }
}
