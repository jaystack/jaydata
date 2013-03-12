using System;
using System.Collections.Generic;
using System.Linq;
using System.Spatial;
using System.Web;

namespace JayData.Models.GeoData
{
    public class Place
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public GeographyPoint Entrance { get; set; }
        public GeometryPoint Gp { get; set; }
        public GeographyLineString Ls { get; set; }
        public GeographyMultiPoint Mp { get; set; }
        public GeographyPolygon Pol { get; set; }
        public GeographyMultiPolygon MPol { get; set; }
        public GeographyMultiLineString MLs { get; set; }
        public GeographyCollection Coll { get; set; }
        public GeometryCollection gColl { get; set; }
    }
}