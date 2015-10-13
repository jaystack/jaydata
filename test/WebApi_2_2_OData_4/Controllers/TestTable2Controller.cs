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
    public class TestTable2Controller : ODataController
    {
        NewsReaderContext db = new NewsReaderContext();

        [EnableQuery]
        public IQueryable<TestItemGuid> Get()
        {
            return db.TestTable2;
        }

        [EnableQuery]
        public SingleResult<TestItemGuid> Get([FromODataUri] Guid key)
        {
            IQueryable<TestItemGuid> result = db.TestTable2.Where(p => p.Id == key);
            return SingleResult.Create(result);
        }

        public async Task<IHttpActionResult> Post(TestItemGuid TestGuid)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            db.TestTable2.Add(TestGuid);
            await db.SaveChangesAsync();
            return Created(TestGuid);
        }

        public async Task<IHttpActionResult> Patch([FromODataUri] Guid key, Delta<TestItemGuid> TestGuid)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var entity = await db.TestTable2.FindAsync(key);
            if (entity == null)
            {
                return NotFound();
            }
            TestGuid.Patch(entity);
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

        public async Task<IHttpActionResult> Put([FromODataUri] Guid key, TestItemGuid update)
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
            var TestGuid = await db.TestTable2.FindAsync(key);
            if (TestGuid == null)
            {
                return NotFound();
            }
            db.TestTable2.Remove(TestGuid);
            await db.SaveChangesAsync();
            return StatusCode(HttpStatusCode.NoContent);
        }

        private bool ProductExists(Guid key)
        {
            return db.TestTable2.Any(p => p.Id == key);
        }
        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}
