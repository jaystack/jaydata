using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JayData.Test.CommonItems.Entities
{
    public partial class TestItemGroup
    {
        [Key]
        public Guid Id { get; set; }
        public string Name { get; set; }
        public virtual List<TestItemGuid> Items { get; set; }

    }
}
