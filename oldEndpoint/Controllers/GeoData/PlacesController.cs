using JayData.Models.GeoData;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Spatial;
using System.Web.Http;
using System.Web.Http.OData;
using System.Web.Http.OData.Query;

namespace JayData.Controllers.GeoData
{
    public class PlacesController : ODataController
    {
        protected List<Place> data { get; set; }

        public PlacesController()
        {
            data = new List<Place>();
            data.Add(new Place() { Id = 0, Name = "Place1", Description = "Desc", Entrance = GeographyPoint.Create(-1.56, 29.76) });
            data.Add(new Place() { Id = 1, Name = "Place1", Description = "Desc", Entrance = GeographyPoint.Create(-2.56, 19.76) });
            data.Add(new Place() { Id = 2, Name = "Place1", Description = "Desc", Entrance = GeographyPoint.Create(-3.56, 9.76) });
            data.Add(new Place() { Id = 3, Name = "Place1", Description = "Desc", Entrance = GeographyPoint.Create(-4.56, -9.76) });
            data.Add(new Place() { Id = 4, Name = "Place1", Description = "Desc", Entrance = GeographyPoint.Create(-10.56, -19.76) });


            for (int i = 0; i < data.Count; i++)
            {
                data[i].Gp = GeometryPoint.Create(-1.56 - i, 29.76 + i);

                SpatialBuilder spatialBuilder = SpatialBuilder.Create();
                GeographyPipeline geographyPipeline = spatialBuilder.GeographyPipeline;
                geographyPipeline.SetCoordinateSystem(CoordinateSystem.DefaultGeography);
                geographyPipeline.BeginGeography(SpatialType.LineString);
                geographyPipeline.BeginFigure(new GeographyPosition(-1.56, 29.76));
                geographyPipeline.LineTo(new GeographyPosition(-1.58, 29.78));
                geographyPipeline.LineTo(new GeographyPosition(5, 50));
                geographyPipeline.EndFigure();
                geographyPipeline.EndGeography();
                data[i].Ls = (GeographyLineString)spatialBuilder.ConstructedGeography;

                SpatialBuilder spatialBuilder1 = SpatialBuilder.Create();
                GeographyPipeline geographyPipeline1 = spatialBuilder1.GeographyPipeline;
                geographyPipeline1.SetCoordinateSystem(CoordinateSystem.DefaultGeography);
                geographyPipeline1.BeginGeography(SpatialType.MultiPoint);
                geographyPipeline1.BeginFigure(new GeographyPosition(-1.56, 29.76));
                geographyPipeline1.EndFigure();
                geographyPipeline1.BeginFigure(new GeographyPosition(-3.56, 50));
                geographyPipeline1.EndFigure();
                geographyPipeline1.EndGeography();
                data[i].Mp = (GeographyMultiPoint)spatialBuilder1.ConstructedGeography;

                SpatialBuilder spatialBuilder2 = SpatialBuilder.Create();
                GeographyPipeline geographyPipeline2 = spatialBuilder2.GeographyPipeline;
                geographyPipeline2.SetCoordinateSystem(CoordinateSystem.DefaultGeography);
                geographyPipeline2.BeginGeography(SpatialType.Polygon);
                geographyPipeline2.BeginFigure(new GeographyPosition(-2, 2));
                geographyPipeline2.LineTo(new GeographyPosition(2, 2));
                geographyPipeline2.LineTo(new GeographyPosition(2, -2));
                geographyPipeline2.LineTo(new GeographyPosition(-2, -2));
                geographyPipeline2.LineTo(new GeographyPosition(-2, 2));
                geographyPipeline2.EndFigure();
                geographyPipeline2.BeginFigure(new GeographyPosition(-1, 1));
                geographyPipeline2.LineTo(new GeographyPosition(1, 1));
                geographyPipeline2.LineTo(new GeographyPosition(1, -1));
                geographyPipeline2.LineTo(new GeographyPosition(-1, -1));
                geographyPipeline2.LineTo(new GeographyPosition(-1, 1));
                geographyPipeline2.EndFigure();
                geographyPipeline2.EndGeography();
                data[i].Pol = (GeographyPolygon)spatialBuilder2.ConstructedGeography;

                SpatialBuilder spatialBuilder3 = SpatialBuilder.Create();
                GeographyPipeline geographyPipeline3 = spatialBuilder3.GeographyPipeline;
                geographyPipeline3.SetCoordinateSystem(CoordinateSystem.DefaultGeography);
                geographyPipeline3.BeginGeography(SpatialType.MultiPolygon);
                geographyPipeline3.BeginGeography(SpatialType.Polygon);
                geographyPipeline3.BeginFigure(new GeographyPosition(-2, 2));
                geographyPipeline3.LineTo(new GeographyPosition(2, 2));
                geographyPipeline3.LineTo(new GeographyPosition(2, -2));
                geographyPipeline3.LineTo(new GeographyPosition(-2, -2));
                geographyPipeline3.LineTo(new GeographyPosition(-2, 2));
                geographyPipeline3.EndFigure();
                geographyPipeline3.BeginFigure(new GeographyPosition(-1, 1));
                geographyPipeline3.LineTo(new GeographyPosition(1, 1));
                geographyPipeline3.LineTo(new GeographyPosition(1, -1));
                geographyPipeline3.LineTo(new GeographyPosition(-1, -1));
                geographyPipeline3.LineTo(new GeographyPosition(-1, 1));
                geographyPipeline3.EndFigure();
                geographyPipeline3.EndGeography();
                geographyPipeline3.BeginGeography(SpatialType.Polygon);
                geographyPipeline3.BeginFigure(new GeographyPosition(-4, 4));
                geographyPipeline3.LineTo(new GeographyPosition(4, 4));
                geographyPipeline3.LineTo(new GeographyPosition(4, -4));
                geographyPipeline3.LineTo(new GeographyPosition(-4, -4));
                geographyPipeline3.LineTo(new GeographyPosition(-4, 4));
                geographyPipeline3.EndFigure();
                geographyPipeline3.BeginFigure(new GeographyPosition(-1, 1));
                geographyPipeline3.LineTo(new GeographyPosition(1, 1));
                geographyPipeline3.LineTo(new GeographyPosition(1, -1));
                geographyPipeline3.LineTo(new GeographyPosition(-1, -1));
                geographyPipeline3.LineTo(new GeographyPosition(-1, 1));
                geographyPipeline3.EndFigure();
                geographyPipeline3.EndGeography();
                geographyPipeline3.EndGeography();
                data[i].MPol = (GeographyMultiPolygon)spatialBuilder3.ConstructedGeography;

                SpatialBuilder spatialBuilder4 = SpatialBuilder.Create();
                GeographyPipeline geographyPipeline4 = spatialBuilder4.GeographyPipeline;
                geographyPipeline4.SetCoordinateSystem(CoordinateSystem.DefaultGeography);
                geographyPipeline4.BeginGeography(SpatialType.MultiLineString);
                geographyPipeline4.BeginGeography(SpatialType.LineString);
                geographyPipeline4.BeginFigure(new GeographyPosition(-1.56, 29.76));
                geographyPipeline4.LineTo(new GeographyPosition(-1.58, 29.78));
                geographyPipeline4.LineTo(new GeographyPosition(5, 50));
                geographyPipeline4.EndFigure();
                geographyPipeline4.EndGeography();
                geographyPipeline4.BeginGeography(SpatialType.LineString);
                geographyPipeline4.BeginFigure(new GeographyPosition(-2.56, 30.76));
                geographyPipeline4.LineTo(new GeographyPosition(-2.58, 30.78));
                geographyPipeline4.LineTo(new GeographyPosition(6, 51));
                geographyPipeline4.EndFigure();
                geographyPipeline4.EndGeography();
                geographyPipeline4.BeginGeography(SpatialType.LineString);
                geographyPipeline4.BeginFigure(new GeographyPosition(-1.56, 29.76));
                geographyPipeline4.LineTo(new GeographyPosition(-1.58, 29.78));
                geographyPipeline4.LineTo(new GeographyPosition(5, 50));
                geographyPipeline4.EndFigure();
                geographyPipeline4.EndGeography();
                geographyPipeline4.BeginGeography(SpatialType.LineString);
                geographyPipeline4.BeginFigure(new GeographyPosition(-2.56, 30.76));
                geographyPipeline4.LineTo(new GeographyPosition(-2.58, 30.78));
                geographyPipeline4.LineTo(new GeographyPosition(8, 52));
                geographyPipeline4.EndFigure();
                geographyPipeline4.EndGeography();
                geographyPipeline4.EndGeography();
                data[i].MLs = (GeographyMultiLineString)spatialBuilder4.ConstructedGeography;



                SpatialBuilder spatialBuilder5 = SpatialBuilder.Create();
                GeographyPipeline geographyPipeline5 = spatialBuilder5.GeographyPipeline;
                geographyPipeline5.SetCoordinateSystem(CoordinateSystem.DefaultGeography);
                geographyPipeline5.BeginGeography(SpatialType.Collection);
                geographyPipeline5.BeginGeography(SpatialType.LineString);
                geographyPipeline5.BeginFigure(new GeographyPosition(-1.56, 29.76));
                geographyPipeline5.LineTo(new GeographyPosition(-1.58, 29.78));
                geographyPipeline5.LineTo(new GeographyPosition(5, 50));
                geographyPipeline5.EndFigure();
                geographyPipeline5.EndGeography();
                geographyPipeline5.BeginGeography(SpatialType.Point);
                geographyPipeline5.BeginFigure(new GeographyPosition(-1.56, 29.76));
                geographyPipeline5.EndFigure();
                geographyPipeline5.EndGeography();
                geographyPipeline5.BeginGeography(SpatialType.LineString);
                geographyPipeline5.BeginFigure(new GeographyPosition(-1.56, 29.76));
                geographyPipeline5.LineTo(new GeographyPosition(-1.58, 29.78));
                geographyPipeline5.LineTo(new GeographyPosition(5, 50));
                geographyPipeline5.EndFigure();
                geographyPipeline5.EndGeography();
                geographyPipeline5.EndGeography();
                data[i].Coll = (GeographyCollection)spatialBuilder5.ConstructedGeography;

                SpatialBuilder spatialBuilder6 = SpatialBuilder.Create();
                GeometryPipeline geographyPipeline6 = spatialBuilder6.GeometryPipeline;
                geographyPipeline6.SetCoordinateSystem(CoordinateSystem.DefaultGeometry);
                geographyPipeline6.BeginGeometry(SpatialType.Collection);
                geographyPipeline6.BeginGeometry(SpatialType.LineString);
                geographyPipeline6.BeginFigure(new GeometryPosition(-1.56, 29.76));
                geographyPipeline6.LineTo(new GeometryPosition(-1.58, 29.78));
                geographyPipeline6.LineTo(new GeometryPosition(5, 50));
                geographyPipeline6.EndFigure();
                geographyPipeline6.EndGeometry();
                geographyPipeline6.BeginGeometry(SpatialType.Point);
                geographyPipeline6.BeginFigure(new GeometryPosition(-1.56, 29.76));
                geographyPipeline6.EndFigure();
                geographyPipeline6.EndGeometry();
                geographyPipeline6.BeginGeometry(SpatialType.LineString);
                geographyPipeline6.BeginFigure(new GeometryPosition(-1.56, 29.76));
                geographyPipeline6.LineTo(new GeometryPosition(-1.58, 29.78));
                geographyPipeline6.LineTo(new GeometryPosition(5, 50));
                geographyPipeline6.EndFigure();
                geographyPipeline6.EndGeometry();
                geographyPipeline6.EndGeometry();
                data[i].gColl = (GeometryCollection)spatialBuilder6.ConstructedGeometry;

            }
            
        }

        [Queryable(AllowedQueryOptions=AllowedQueryOptions.All)]
        public IQueryable<Place> Get()
        {
            return data.AsQueryable();
        }

        public Place Get([FromODataUri] int key)
        {
            Place place = data.Where(a => a.Id == key).SingleOrDefault();
            if (place == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return place;
        }

        public Place Patch([FromODataUri] int key, Delta<Place> patch)
        {
            Place movieToPatch = data.Where(a => a.Id == key).SingleOrDefault();
            patch.Patch(movieToPatch);
            return movieToPatch;
        }

        public Place Post(Place item)
        {
            item.Id = data.Count;
            return item;
        }

    }
}
