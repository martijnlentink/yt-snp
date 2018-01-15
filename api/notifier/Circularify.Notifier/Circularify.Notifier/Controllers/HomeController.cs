using System.Collections.Generic;
using System.Web.Mvc;
using Circularify.Notifier.Managers;
using Circularify.Notifier.ViewModels;

namespace Circularify.Notifier.Controllers
{
    [AuthorizationFilter]
    public class HomeController : Controller
    {
        private NotificationManager _notificationManager;
        private AzureNotificationHubManager _hubManager;

        public HomeController()
        {
            _notificationManager = new NotificationManager();
            _hubManager = new AzureNotificationHubManager();
        }

        public ActionResult Index()
        {
            var storedNotifications = _notificationManager.LoadNotifications();

            var notificationsModel = new List<NotificationViewModelEntity>();

            foreach (var nof in storedNotifications)
            {
                notificationsModel.Add(new NotificationViewModelEntity
                {
                    NotificationId = nof.NotificationId,
                    Title = nof.Title,
                    Message = nof.Message,
                    HasAction = nof.HasAction,
                    ActionText = nof.ActionText,
                    ActionUrl = nof.ActionUrl
                });
            }

            return View(notificationsModel);
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Notify()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Notify(NotificationViewModelEntity notification)
        {
            if (!ModelState.IsValid)
            {
                return View(notification);
            }

            // Send the notification.
            _hubManager.SendNotificationAsync(notification).ConfigureAwait(false);

            return RedirectToAction("NotifyRedirect");
        }

        public ActionResult NotifyRedirect()
        {
            return View();
        }

        public ActionResult NotifyDelete(int id)
        {
            // Delete the notification.
            _notificationManager.DeleteNotification(id);

            return RedirectToAction("Index");
        }
    }
}