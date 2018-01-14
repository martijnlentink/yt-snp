using System.Web;
using System.Web.Mvc;

namespace Circularify.Notifier
{
    public class AuthorizationFilterAttribute : AuthorizeAttribute, IAuthorizationFilter
    {
        public override void OnAuthorization(AuthorizationContext context)
        {           
            if (HttpContext.Current.Session["Username"] == null)
            {
                context.Result = new RedirectResult("/login");
            }
        } 
    }
}