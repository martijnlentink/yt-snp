using System.Web.Mvc;
using System.Web.Routing;

namespace Circularify.Notifier
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
               name: "Notify",
               url: "notify",
               defaults: new { controller = "Home", action = "Notify" });

            routes.MapRoute(
               name: "About",
               url: "about",
               defaults: new { controller = "Home", action = "About" });

            routes.MapRoute(
               name: "Notify Redirect",
               url: "notify/redirect",
               defaults: new { controller = "Home", action = "NotifyRedirect" });

            routes.MapRoute(
               name: "Delete",
               url: "notify/delete/{id}",
               defaults: new { controller = "Home", action = "NotifyDelete" });

            routes.MapRoute(
               name: "Delete Redirect",
               url: "delete/redirect",
               defaults: new { controller = "Home", action = "DeleteRedirect" });

            routes.MapRoute(
               name: "Login",
               url: "login",
               defaults: new { controller = "User", action = "Login" });

            routes.MapRoute(
               name: "Logout",
               url: "logout",
               defaults: new { controller = "User", action = "Logout" });

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional });
        }
    }
}
