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


        [HttpPost]
        [Route("SAction1")]
        public string SAction1(ODataActionParameters param)
        {
            var number = (int)param["number"];
            return "a1_ " + number.ToString();
        }

        [HttpPost]
        [Route("SAction2")]
        [EnableQuery]
        public IQueryable<Article> SAction2(ODataActionParameters param)
        {
            var count = (int)param["count"];
            return db.Articles.Take(count);
        }

        [HttpPost]
        [Route("SFunction1")]
        public List<string> SFunction1(ODataActionParameters param)
        {
            var number = (int)param["number"];
            return new List<string>() { "f1_ ", number.ToString() };
        }

        [HttpPost]
        [Route("SFunction2")]
        public string SFunction2(ODataActionParameters param)
        {
            var number = (int)param["number"];
            return "f2_ " + number.ToString();
        }
    }
}
