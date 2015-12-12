using JayData.Test.CommonItems.Entities;
using JayData.Test.WebApi_2_2_OData_4.Model;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.OData;

namespace WebApi_2_2_OData_4.Controllers
{
    [RoutePrefix("odata")]
    public class NonBindableActionsController : ODataController
    {
        NewsReaderContext db = new NewsReaderContext();
        

        [HttpGet]
        [Route("SAction1")]
        public string SAction1([FromODataUri]int number)
        {
            return "a1_ " + number.ToString();
        }

        //[HttpPost]
        [HttpGet]
        [Route("SAction2")]
        [EnableQuery]
        public IQueryable<Article> SAction2([FromODataUri]int count)
        {
            return db.Articles.Take(count);
        }

        [HttpGet]
        [Route("SFunction1")]
        public List<string> SFunction1([FromODataUri]int number)
        {
            return new List<string>() { "f1_ ", number.ToString() };
        }

        [HttpGet]
        [Route("SFunction2")]
        public string SFunction2([FromODataUri]int number)
        {
            return "f2_ " + number.ToString();
        }
    }
}
