using System.Web.Mvc;
using System.Web.Routing;

namespace Circularify.Web
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            #region Home Controller

            routes.MapRoute(
               name: "Home",
               url: "",
               defaults: new { controller = "Home", action = "Index" });

            routes.MapRoute(
               name: "About",
               url: "about",
               defaults: new { controller = "Home", action = "About" });

            #endregion

            #region Notification Controller

            routes.MapRoute(
              name: "Notification Index",
              url: "notifications",
              defaults: new { controller = "Notification", action = "Index" });

            routes.MapRoute(
               name: "Notification Create",
               url: "notification/new",
               defaults: new { controller = "Notification", action = "Create" });

            routes.MapRoute(
               name: "Notification Create Redirect",
               url: "notification/new/redirect",
               defaults: new { controller = "Notification", action = "CreateRedirect" });

            routes.MapRoute(
               name: "Notification Delete",
               url: "notification/{id}/delete",
               defaults: new { controller = "Notification", action = "Delete" });

            routes.MapRoute(
               name: "Notification Delete Redirect",
               url: "notification/{id}/delete/redirect",
               defaults: new { controller = "Notification", action = "DeleteRedirect" });

            #endregion

            #region Event Controller

            routes.MapRoute(
              name: "Event Index",
              url: "events",
              defaults: new { controller = "Event", action = "Index" });

            routes.MapRoute(
               name: "Event Create",
               url: "event/new",
               defaults: new { controller = "Event", action = "Create" });

            routes.MapRoute(
               name: "Event Create Redirect",
               url: "event/new/redirect",
               defaults: new { controller = "Event", action = "CreateRedirect" });

            routes.MapRoute(
               name: "Event Delete",
               url: "event/{id}/delete",
               defaults: new { controller = "Event", action = "Delete" });

            routes.MapRoute(
               name: "Event Delete Redirect",
               url: "event/{id}/delete/redirect",
               defaults: new { controller = "Event", action = "DeleteRedirect" });

            #endregion

            #region User Controller

            routes.MapRoute(
               name: "Login",
               url: "login",
               defaults: new { controller = "User", action = "Login" });

            routes.MapRoute(
               name: "Logout",
               url: "logout",
               defaults: new { controller = "User", action = "Logout" });

            #endregion

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional });
        }
    }
}
