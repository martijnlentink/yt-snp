using System.Collections.Generic;
using System.Web.Mvc;
using Circularify.Web.Managers;
using Circularify.Web.ViewModels;

namespace Circularify.Web.Controllers
{
    [AuthorizationFilter]
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }        
    }
}