using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JayData.Test.CommonItems.Entities
{
    public enum UserType
    {
        Admin = 0,
        Customer = 1,
        Guest = 2
    }
    public partial class User
    {
        [Key]
        public int Id { get; set; }
        public string LoginName { get; set; }
        public string Email { get; set; }
        public UserType UserType { get; set; }
        public virtual List<Article> Articles { get; set; }
        public virtual UserProfile Profile { get; set; }
    }
}
