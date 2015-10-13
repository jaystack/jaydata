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

namespace JayData.Controllers.WebApiOData
{
    public class ArticlesController : ODataController
    {
        private EmptyNewsReaderContext db = new EmptyNewsReaderContext();

        public ArticlesController()
        {
            db.Configuration.LazyLoadingEnabled = false;
            db.Configuration.ProxyCreationEnabled = false;
        }

        [Queryable]
        public IQueryable<Article> Get()
        {
            return db.Articles.AsQueryable();
        }

        public Article Get([FromODataUri] int key)
        {
            Article article = db.Articles.Find(key);
            if (article == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return article;
        }

        public Article Patch([FromODataUri] int key, Delta<Article> patch)
        {
            Article movieToPatch = db.Articles.Find(key);
            patch.Patch(movieToPatch);
            return movieToPatch;
        }

        public Article Post(Article item)
        {
            db.Articles.Add(item);
            db.SaveChanges();
            return item;
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}