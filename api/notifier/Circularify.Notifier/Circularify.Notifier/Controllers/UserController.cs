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
            // If the user is already logged in, redirect to home.
            if (Session["Username"] != null)
            {
                return RedirectToAction("Index", "Home");
            }

            ViewBag.IsLoginPage = true;
            return View();
        }

        // POST: Login
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Login(UserViewModel model)
        {
            ViewBag.IsLoginPage = true;

            if (ModelState.IsValid)
            {
                var validatedUser = _userManager.ValidateUser(model);

                if (validatedUser.IsValid)
                {
                    Session["Username"] = model.Username;
                    Session["LastLogin"] = model.LastLoggedIn;

                    return RedirectToAction("Index", "Home");
                }
                else
                {
                    // User not known error.
                    if (validatedUser.ErrorMessage[0] == "User is not in the system")
                    {
                        ModelState.AddModelError("Username", (validatedUser.ErrorMessage[0]));
                    }
                    else
                    {
                        // Wrong password error.
                        ModelState.AddModelError("Password", (validatedUser.ErrorMessage[0]));
                    }

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

            // Redirect to home.
            return RedirectToAction("Index", "Home");
        }
    }
}