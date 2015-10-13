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
    public class TagsController : ODataController
    {
        NewsReaderContext db = new NewsReaderContext();

        [EnableQuery]
        public IQueryable<Tag> Get()
        {
            return db.Tags;
        }

        [EnableQuery]
        public SingleResult<Tag> Get([FromODataUri] int key)
        {
            IQueryable<Tag> result = db.Tags.Where(p => p.Id == key);
            return SingleResult.Create(result);
        }

        public async Task<IHttpActionResult> Post(Tag Tag)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            db.Tags.Add(Tag);
            await db.SaveChangesAsync();
            return Created(Tag);
        }

        public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<Tag> Tag)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var entity = await db.Tags.FindAsync(key);
            if (entity == null)
            {
                return NotFound();
            }
            Tag.Patch(entity);
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
        
        public async Task<IHttpActionResult> Put([FromODataUri] int key, Tag update)
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
            var Tag = await db.Tags.FindAsync(key);
            if (Tag == null)
            {
                return NotFound();
            }
            db.Tags.Remove(Tag);
            await db.SaveChangesAsync();
            return StatusCode(HttpStatusCode.NoContent);
        }

        private bool ProductExists(int key)
        {
            return db.Tags.Any(p => p.Id == key);
        }
        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}
