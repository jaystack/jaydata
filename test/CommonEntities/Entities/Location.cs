using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JayData.Test.CommonItems.Entities
{
    [ComplexType]
    public partial class Location
    {
        public string Address { get; set; }
        public string City { get; set; }
        public int Zip { get; set; }
        public string Country { get; set; }
    }
}
