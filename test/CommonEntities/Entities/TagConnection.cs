using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JayData.Test.CommonItems.Entities
{
    public partial class TagConnection
    {
        [Key]
        public int Id { get; set; }
        public virtual Article Article { get; set; }
        public virtual Tag Tag { get; set; }
    }
}
