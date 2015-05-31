using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JayData.Test.CommonItems.Entities
{
    public partial class UserProfile
    {
        [Key]
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Bio { get; set; }
        public byte[] Avatar { get; set; }
        public DateTime? Birthday { get; set; }
        public virtual Location Location { get; set; }
        [Required]
        public virtual User User { get; set; }
    }
}
