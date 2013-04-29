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

namespace JayData.Controllers.Primitives.WebApi
{
    public class TestItemTypesWebApiController : ApiController
    {
        private EmptyNewsReaderContext db = new EmptyNewsReaderContext();

        // GET api/TestItemTypes
        [Queryable]
        public IQueryable<TestItemType> GetTestItemTypes()
        {
            return db.TestItemTypes.AsQueryable();
        }

        // GET api/TestItemTypes/5
        public TestItemType GetTestItemType(int id)
        {
            TestItemType testitemtype = db.TestItemTypes.Find(id);
            if (testitemtype == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return testitemtype;
        }

        // PUT api/TestItemTypes/5
        public HttpResponseMessage PutTestItemType(int id, TestItemType testitemtype)
        {
            if (ModelState.IsValid && id == testitemtype.Id)
            {
                db.Entry(testitemtype).State = EntityState.Modified;

                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateConcurrencyException)
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                }

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
        }

        // POST api/TestItemTypes
        public HttpResponseMessage PostTestItemType(TestItemType testitemtype)
        {
            if (ModelState.IsValid)
            {
                db.TestItemTypes.Add(testitemtype);
                db.SaveChanges();

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, testitemtype);
                response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = testitemtype.Id }));
                return response;
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
        }

        // DELETE api/TestItemTypes/5
        public HttpResponseMessage DeleteTestItemType(int id)
        {
            TestItemType testitemtype = db.TestItemTypes.Find(id);
            if (testitemtype == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.TestItemTypes.Remove(testitemtype);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            return Request.CreateResponse(HttpStatusCode.OK, testitemtype);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}