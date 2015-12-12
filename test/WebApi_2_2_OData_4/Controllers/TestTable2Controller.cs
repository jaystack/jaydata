using JayData.Test.CommonItems.Entities;
using JayData.Test.WebApi_2_2_OData_4.Model;
using Microsoft.OData.Edm.Library;
using Microsoft.Spatial;
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
            //return db.TestTable2;
            var list = new List<TestItemGuid>();

            list.Add(new TestItemGuid { Id = Guid.NewGuid(), date = Date.Now, time = new TimeOfDay(15, 10, 15, 00), b0 = true, dec = (decimal)2.2, dtOffset = new DateTimeOffset(DateTime.Now), dur = DateTime.Now - DateTime.Today, flt = 3.56f, i0 = 1234, t = DateTime.Now, lng = 4324233L, s0 = "1st row" });
            var item1 = new TestItemGuid { Id = Guid.NewGuid(), date = new Date(2000, 3, 15), time = new TimeSpan(99336998), b0 = false, dec = (decimal)4.2, dtOffset = new DateTimeOffset(DateTime.Today), dur = new TimeSpan(99696998), flt = 5.56f, i0 = 6234, t = DateTime.Now.AddDays(-3), lng = 4344233L, s0 = "2nd row" };
            item1.openProperties.Add("t0", 1.0f);
            item1.openProperties.Add("t1", false);
            item1.openProperties.Add("t2", DateTime.Now);
            item1.openProperties.Add("t3", null);
            item1.openProperties.Add("t4", "öö");
            item1.openProperties.Add("t5", GeographyPoint.Create(64.1, 142.1));

            list.Add(item1);
            var item = new TestItemGuid { Id = Guid.NewGuid()/*, Entrance = GeographyPoint.Create(64.1, 142.1)*/, date = DateTime.Now, time = new TimeOfDay(22, 10, 15, 00), b0 = null, dec = (decimal)1.2, dtOffset = new DateTimeOffset(DateTime.Today), dur = new TimeSpan(99336998), flt = 15.56f, i0 = 62341, t = DateTime.Now.AddDays(-2), lng = 4344253L, s0 = "3nd row" };
            item.openProperties.Add("t0", 1);
            item.openProperties.Add("t1", "xx");
            item.openProperties.Add("t2", DateTime.Now);
            item.openProperties.Add("t3", Date.Now);
            item.openProperties.Add("t4", false);
            //item.openProperties.Add("t5", UserType.Customer);

            item.emails.Add("a@example.com");
            item.emails.Add("b@example.com");
            item.emails.Add("c@example.com");

            list.Add(item);

            return list.AsQueryable();
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
