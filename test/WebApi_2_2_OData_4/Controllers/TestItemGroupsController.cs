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
    public class TestItemGroupsController : ODataController
    {
        NewsReaderContext db = new NewsReaderContext();

        [EnableQuery]
        public IQueryable<TestItemGroup> Get()
        {
            return db.TestItemGroups;
        }

        [EnableQuery]
        public SingleResult<TestItemGroup> Get([FromODataUri] Guid key)
        {
            IQueryable<TestItemGroup> result = db.TestItemGroups.Where(p => p.Id == key);
            return SingleResult.Create(result);
        }

        public async Task<IHttpActionResult> Post(TestItemGroup TestItemGroup)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            db.TestItemGroups.Add(TestItemGroup);
            await db.SaveChangesAsync();
            return Created(TestItemGroup);
        }

        public async Task<IHttpActionResult> Patch([FromODataUri] Guid key, Delta<TestItemGroup> TestItemGroup)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var entity = await db.TestItemGroups.FindAsync(key);
            if (entity == null)
            {
                return NotFound();
            }
            TestItemGroup.Patch(entity);
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

        public async Task<IHttpActionResult> Put([FromODataUri] Guid key, TestItemGroup update)
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

        public async Task<IHttpActionResult> Delete([FromODataUri] Guid key)
        {
            var TestItemGroup = await db.TestItemGroups.FindAsync(key);
            if (TestItemGroup == null)
            {
                return NotFound();
            }
            db.TestItemGroups.Remove(TestItemGroup);
            await db.SaveChangesAsync();
            return StatusCode(HttpStatusCode.NoContent);
        }

        private bool ProductExists(Guid key)
        {
            return db.TestItemGroups.Any(p => p.Id == key);
        }
        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}
