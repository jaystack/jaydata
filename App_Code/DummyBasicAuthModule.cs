using System;
using System.Collections.Generic;
using System.Linq;
using System.Security;
using System.Security.Principal;
using System.Text;
using System.Web;
using System.Web.Security;

namespace JayData
{
    public class DummyBasicAuthModule : IHttpModule
    {
        public void Dispose()
        {

        }

        public void Init(HttpApplication context)
        {
            context.AuthenticateRequest += context_AuthenticateRequest;
            context.EndRequest += context_EndRequest;
        }

        void context_EndRequest(object sender, EventArgs e)
        {
            // Adds the WWW-Authenticate: Basic header if required
            HttpApplication context = (HttpApplication)sender;
            if (context.Response.StatusCode == 401)
                context.Response.AppendHeader("WWW-Authenticate", "Basic");
        }

        void context_AuthenticateRequest(object sender, EventArgs e)
        {
            string user;
            string password;
            HttpApplication context = (HttpApplication)sender;

            IPrincipal principal = null;
            if (tryGetAuthorizationData(context, out user, out password))
            {
                if (user == "user" && password == "password")
                {
                    var identity = new GenericIdentity(user);
                    principal = new GenericPrincipal(identity, null);
                }
                else
                    createNotAuthorizedResponse(context, 401, 1, "Logon failed.");
            }
            context.Context.User = principal;
        }

        protected static bool tryGetAuthorizationData(HttpApplication context, out string user, out string password)
        {
            user = null;
            password = null;
            try
            {
                var authHeader = context.Request.Headers["Authorization"];
                if (authHeader == null)
                    return false;
                var authHeaderData = authHeader.Split(new[] { ' ' }, 2);
                if (!String.Equals(authHeaderData[0], "Basic", StringComparison.InvariantCultureIgnoreCase))
                    return false;

                var decodedData = Encoding.ASCII.GetString(Convert.FromBase64String(authHeaderData[1]));
                var authParams = decodedData.Split(':');
                user = authParams[0];
                password = authParams[1];
                return true;
            }
            catch
            {
                return false;
            }
        }

        protected static void createNotAuthorizedResponse(HttpApplication context, int code, int subCode, string description, bool completeRequest = true)
        {
            HttpResponse response = context.Context.Response;
            response.StatusCode = code;            
            response.StatusDescription = description;
            if (completeRequest)
                context.CompleteRequest();
        }
    }
}