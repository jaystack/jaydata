using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace JayData.Models.ODataInheritance
{
    public class Vehicle
    {
        public int Id { get; set; }
        public string Color { get; set; }
        public int Speed { get; set; }
    }

    public class Car : Vehicle
    {
        public int Weight { get; set; }
        public int Doors { get; set; }
    }

    public class Bike : Vehicle
    {
        public int Weight { get; set; }
    }

    public class Ship
    {
        public int Id { get; set; }
        public int Passengers { get; set; }
        public int Age { get; set; }
    }
}