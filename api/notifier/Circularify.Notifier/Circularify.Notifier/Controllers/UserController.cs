using System.Web.Mvc;
using Circularify.Notifier.Managers;
using Circularify.Notifier.ViewModels;

namespace Circularify.Notifier.Controllers
{
    public class UserController : Controller
    {
        private UserManager _userManager;

        public UserController()
        {
            _userManager = new UserManager();
        }

        // GET: Login
        public ActionResult Login()
        {
            return View();
        }

        // POST: Login
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Login(UserViewModel model)
        {
            if (ModelState.IsValid)
            {
                var validatedUser = _userManager.ValidateUser(model);

                if (validatedUser.IsValid)
                {
                    Session["Username"] = model.Username;
                    Session["LastLogin"] = model.LastLoggedIn;

                    RedirectToAction("Index", "Home");
                }
                else
                {
                    return View(validatedUser);
                }
            }

            return View(model);
        }

        public ActionResult Logout()
        {
            // Remove the username from the session, effectively logging the user out.
            Session.Remove("Username");
            Session.Remove("LastLogin");

            // 
            return RedirectToAction("Index", "Home");
        }
    }
}