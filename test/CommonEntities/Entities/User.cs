using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JayData.Test.CommonItems.Entities
{
    public partial class User
    {
        [Key]
        public int Id { get; set; }
        public string LoginName { get; set; }
        public string Email { get; set; }
        public virtual List<Article> Articles { get; set; }
        public virtual UserProfile Profile { get; set; }
    }
}
