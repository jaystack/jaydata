using JayData.Test.CommonItems.Entities;
using JayData.Test.WebApi_2_2_OData_4.Model;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.OData;

namespace WebApi_2_2_OData_4.Controllers
{
    public class TagConnectionsController : ODataController
    {
        NewsReaderContext db = new NewsReaderContext();

        [EnableQuery]
        public IQueryable<TagConnection> Get()
        {
            return db.TagConnections;
        }

        [EnableQuery]
        public SingleResult<TagConnection> Get([FromODataUri] int key)
        {
            IQueryable<TagConnection> result = db.TagConnections.Where(p => p.Id == key);
            return SingleResult.Create(result);
        }

        public async Task<IHttpActionResult> Post(TagConnection TagConnection)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            db.TagConnections.Add(TagConnection);
            await db.SaveChangesAsync();
            return Created(TagConnection);
        }

        public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<TagConnection> TagConnection)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var entity = await db.TagConnections.FindAsync(key);
            if (entity == null)
            {
                return NotFound();
            }
            TagConnection.Patch(entity);
            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return Updated(entity);
        }
        
        public async Task<IHttpActionResult> Put([FromODataUri] int key, TagConnection update)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (key != update.Id)
            {
                return BadRequest();
            }
            db.Entry(update).State = EntityState.Modified;
            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return Updated(update);
        }
        
        public async Task<IHttpActionResult> Delete([FromODataUri] int key)
        {
            var TagConnection = await db.TagConnections.FindAsync(key);
            if (TagConnection == null)
            {
                return NotFound();
            }
            db.TagConnections.Remove(TagConnection);
            await db.SaveChangesAsync();
            return StatusCode(HttpStatusCode.NoContent);
        }

        private bool ProductExists(int key)
        {
            return db.TagConnections.Any(p => p.Id == key);
        }
        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}
