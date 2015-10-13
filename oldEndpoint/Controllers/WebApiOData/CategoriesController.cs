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
using System.Spatial;

namespace JayData.Controllers.WebApiOData
{
    public class CategoriesController : ODataController
    {
        private EmptyNewsReaderContext db = new EmptyNewsReaderContext();

        public CategoriesController()
        {
            db.Configuration.LazyLoadingEnabled = false;
            db.Configuration.ProxyCreationEnabled = false;
        }

        [Queryable]
        public IQueryable<Category> Get()
        {
            return db.Categories.AsQueryable();
        }

        public Category Get([FromODataUri] int key)
        {
            Category category = db.Categories.Find(key);
            if (category == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return category;
        }

        public Category Patch([FromODataUri] int key, Delta<Category> patch)
        {
            Category movieToPatch = db.Categories.Find(key);
            patch.Patch(movieToPatch);
            return movieToPatch;
        }

        [HttpPost]
        public string GetFirstArticleTitle([FromODataUri] int key, ODataActionParameters parameters) { 
            var contains = (string)parameters["contains"] ?? "";
            return db.Articles.Where(a => a.Category.Id == key && a.Title.Contains(contains)).Select(a => a.Title).FirstOrDefault() ?? " - ";
        }

        [HttpPost]
        public string GetFirstArticleTitle(ODataActionParameters parameters)
        {
            var contains = (string)parameters["contains"] ?? "";
            return db.Articles.Where(a => a.Title.Contains(contains)).Select(a => a.Title).FirstOrDefault() ?? " - ";
        }

        [HttpPost]
        public GeographyPoint LocationSwipe([FromODataUri] int key, ODataActionParameters parameters)
        {
            var loc = (GeographyPoint)parameters["Loc"] ?? null;
            return GeographyPoint.Create(loc.Longitude, loc.Latitude);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}