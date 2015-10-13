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
    public class TestItemTypesController : ODataController
    {
        NewsReaderContext db = new NewsReaderContext();

        [EnableQuery]
        public IQueryable<TestItemType> Get()
        {
            return db.TestItemTypes;
        }

        [EnableQuery]
        public SingleResult<TestItemType> Get([FromODataUri] int key)
        {
            IQueryable<TestItemType> result = db.TestItemTypes.Where(p => p.Id == key);
            return SingleResult.Create(result);
        }

        public async Task<IHttpActionResult> Post(TestItemType TestItemType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            db.TestItemTypes.Add(TestItemType);
            await db.SaveChangesAsync();
            return Created(TestItemType);
        }

        public async Task<IHttpActionResult> Patch([FromODataUri] int key, Delta<TestItemType> TestItemType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var entity = await db.TestItemTypes.FindAsync(key);
            if (entity == null)
            {
                return NotFound();
            }
            TestItemType.Patch(entity);
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
        
        public async Task<IHttpActionResult> Put([FromODataUri] int key, TestItemType update)
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
            var TestItemType = await db.TestItemTypes.FindAsync(key);
            if (TestItemType == null)
            {
                return NotFound();
            }
            db.TestItemTypes.Remove(TestItemType);
            await db.SaveChangesAsync();
            return StatusCode(HttpStatusCode.NoContent);
        }

        private bool ProductExists(int key)
        {
            return db.TestItemTypes.Any(p => p.Id == key);
        }
        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}
