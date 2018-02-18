using System.Collections.Generic;
using System.Web.Mvc;
using Circularify.Web.Managers;
using Circularify.Web.ViewModels;

namespace Circularify.Web.Controllers
{
    [AuthorizationFilter]
    public class NotificationController : Controller
    {
        private NotificationManager _notificationManager;
        private GcmNotificationManager _gcmManager;

        public NotificationController()
        {
            _notificationManager = new NotificationManager();
            _gcmManager = new GcmNotificationManager();
        }
        
        public ActionResult Index()
        {
            var storedNotifications = _notificationManager.LoadNotifications(null);

            var notificationsModel = new List<NotificationViewModelEntity>();

            foreach (var nof in storedNotifications)
            {
                notificationsModel.Add(new NotificationViewModelEntity
                {
                    NotificationId = nof.NotificationId,
                    Title = nof.Title,
                    Message = nof.Message,
                    IsProduction = nof.IsProduction,
                    HasAction = nof.HasAction,
                    ActionText = nof.ActionText,
                    ActionUrl = nof.ActionUrl,
                    Sent = nof.Sent
                });
            }

            return View(notificationsModel);
        }

        [ChildActionOnly]
        public ActionResult LoadLatestNotifications()
        {
            var storedNotifications = _notificationManager.LoadNotifications(5);

            var notificationsModel = new List<NotificationViewModelEntity>();

            foreach (var nof in storedNotifications)
            {
                notificationsModel.Add(new NotificationViewModelEntity
                {
                    NotificationId = nof.NotificationId,
                    Title = nof.Title,
                    Sent = nof.Sent,
                    Message = nof.Message,
                    HasAction = nof.HasAction,
                    ActionText = nof.ActionText,
                    ActionUrl = nof.ActionUrl
                });
            }
            
            return PartialView("_LatestNotifications", notificationsModel);
        }

        public ActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Create(NotificationViewModelEntity notification)
        {
            if (!ModelState.IsValid)
            {
                return View(notification);
            }

            // Send the notification.
            _gcmManager.SendNotificationAsync(notification).ConfigureAwait(false);

            return RedirectToAction("CreateRedirect");
        }

        public ActionResult CreateRedirect()
        {
            return View();
        }

        public ActionResult Delete(int id)
        {
            // Delete the notification.
            _notificationManager.DeleteNotification(id);

            return RedirectToAction("DeleteRedirect");
        }

        public ActionResult DeleteRedirect()
        {
            return View();
        }

        public ActionResult Resend(int id)
        {
            var nof = _notificationManager.GetNotification(id);

            // If a notification was found, resend it.
            if (nof != null)
            {
                var model = new NotificationViewModelEntity
                {
                    NotificationId = nof.NotificationId,
                    Title = nof.Title,
                    Sent = nof.Sent,
                    Message = nof.Message,
                    HasAction = nof.HasAction,
                    ActionText = nof.ActionText,
                    ActionUrl = nof.ActionUrl
                };

                // Send the notification to the hub manager, flagging it as a resend.
                _hubManager.SendNotificationAsync(model, true).ConfigureAwait(false);

                // Return to the send succes page.
                return RedirectToAction("CreateRedirect");
            }

            // No action was taken.
            return RedirectToAction("Index");
        }
    }
}