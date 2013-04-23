using JayData.Models.CollectionProp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.OData;

namespace JayData.Controllers.CollectionProp
{
    public class CollectionPropsWebApiController : ApiController
    {

        // GET api/TestItemTypes
        [Queryable]
        public IQueryable<TestEntity> Get()
        {
            return TestEntity.CreateData();
        }


        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
        }
    }

    public class CollectionPropsController : ODataController
    {

        // GET api/TestItemTypes
        [Queryable]
        public IQueryable<TestEntity> Get()
        {
            return TestEntity.CreateData();
        }


        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
        }
    }

    
}
