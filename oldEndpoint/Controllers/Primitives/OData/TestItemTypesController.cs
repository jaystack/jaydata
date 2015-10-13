using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using JayData.NewsReader;
using System.Web.Http.OData;

namespace JayData.Controllers.Primitives.OData
{
    public class TestItemTypesController : ODataController
    {
        private EmptyNewsReaderContext db = new EmptyNewsReaderContext();

        // GET api/TestItemTypes
        [Queryable]
        public IQueryable<TestItemType> Get()
        {
            //var d = new List<TestItemType>();
            //d.Add(new TestItemType() { 
            //    blob = new byte?[5] { 1, 2, 3, 4, 5},
            //    b0 = false,
            //    b1 = 230,
            //    d0 = DateTime.Now,
            //    de0 = 1353456,
            //    n0 = 1356,
            //    si0 = 1235.15346f,
            //    g0 = Guid.NewGuid(),
            //    i16 = 351,
            //    i0 = 13534,
            //    i64 = 13546846213,
            //    s0 = "helloWorld"
            //});
            //return d.AsQueryable();
            return db.TestItemTypes.AsQueryable();
        }

        public TestItemType Get([FromODataUri] int key)
        {
            TestItemType testitemtype = db.TestItemTypes.Find(key);
            if (testitemtype == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return testitemtype;
        }

        public TestItemType Patch([FromODataUri] int key, Delta<TestItemType> patch)
        {
            TestItemType testitemtype = db.TestItemTypes.Find(key);
            patch.Patch(testitemtype);

            db.SaveChanges();

            return testitemtype;
        }

        public TestItemType Post(TestItemType item)
        {
            db.TestItemTypes.Add(item);
            db.SaveChanges();
            return item;
        }

        public void Delete([FromODataUri] int key)
        {
            TestItemType testitemtype = db.TestItemTypes.Find(key);
            db.TestItemTypes.Remove(testitemtype);
            db.SaveChanges();
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}