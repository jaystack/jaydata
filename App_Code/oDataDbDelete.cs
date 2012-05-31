using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;

/// <summary>
/// Summary description for oDataDbDelete
/// </summary>
//[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
// To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line. 
// [System.Web.Script.Services.ScriptService]
public class oDataDbDelete : System.Web.Services.WebService {

    public oDataDbDelete () {

        //Uncomment the following line if using designed components 
        //InitializeComponent(); 
    }

    [WebMethod]
    public void Delete() {
        using (var ctx = new JayData.NewsReader.EmptyNewsReaderContext())
        {
            ctx.Database.Delete();
        }
    }
    
}
