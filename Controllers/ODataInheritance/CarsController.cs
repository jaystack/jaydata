using JayData.Models.ODataInheritance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.OData;

namespace JayData.Controllers.ODataInheritance
{
    public class CarsController : ODataController
    {
        private static List<Car> _data = new List<Car>() {
                new Car() { Id = 1, Speed = 20, Weight = 150, Doors = 5, Color = "White" },
                new Car() { Id = 2, Speed = 30, Weight = 160, Doors = 5, Color = "Black" },
                new Car() { Id = 3, Speed = 40, Weight = 170, Doors = 5, Color = "Red" },
                new Car() { Id = 4, Speed = 50, Weight = 180, Doors = 5, Color = "Blue" } };

        [Queryable]
        public IQueryable<Car> Get()
        {
            return _data.AsQueryable();
        }

        public Car Get([FromODataUri] int key)
        {
            Car Car = _data.Where(c => c.Id == key).FirstOrDefault();
            if (Car == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return Car;
        }

        public Car Patch([FromODataUri] int key, Delta<Car> patch)
        {
            Car carToPatch = _data.Where(c => c.Id == key).FirstOrDefault();
            patch.Patch(carToPatch);
            return carToPatch;
        }

        public Car Post(Car item)
        {
            _data.Add(item);
            return item;
        }

        public void Delete([FromODataUri] int key)
        {
            Car Car = _data.Where(c => c.Id == key).FirstOrDefault();
            _data.Remove(Car);
        }

        public bool Reset() {
            CarsController._resetData();
            return true;
        }

        public static void _resetData() {
            _data = new List<Car>() {
                new Car() { Id = 1, Speed = 20, Weight = 150, Doors = 5, Color = "White" },
                new Car() { Id = 2, Speed = 30, Weight = 160, Doors = 5, Color = "Black" },
                new Car() { Id = 3, Speed = 40, Weight = 170, Doors = 5, Color = "Red" },
                new Car() { Id = 4, Speed = 50, Weight = 180, Doors = 5, Color = "Blue" } };
        }

    }
}
