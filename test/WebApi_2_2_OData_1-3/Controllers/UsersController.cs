using JayData.Test.CommonItems.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http.OData;

namespace JayData.Test.WebApi_2_2_OData_1_3.Controllers
{
    public class UsersController:ODataController
    {
        public UsersController()
        {

        }

        public IEnumerable<User> Get() {
            return new List<User> { new User{Id=1, LoginName="almafa"}};
        }
    }
}
