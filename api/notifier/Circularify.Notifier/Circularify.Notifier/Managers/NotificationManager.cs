using System.Collections.Generic;
using System.Linq;
using Circularify.Notifier.Db;
using Circularify.Notifier.Db.Models;
using Circularify.Notifier.Domain;

namespace Circularify.Notifier.Managers
{
    public class NotificationManager
    {
        private NotifierDatabaseContext _db;

        public NotificationManager()
        {
            _db = DbInstance.Get;
        }

        public List<NotificationMessageEntity> LoadNotifications()
        {
            // Get all the notfications.
            var storedNotifications = _db.Notifications;

            var model = new List<NotificationMessageEntity>();

            // Loop through DB result and return the list.
            foreach (var notification in storedNotifications)
            {
                model.Add(new NotificationMessageEntity
                {
                    NotificationId = notification.Id,
                    Title = notification.Title,
                    Message = notification.Message,
                    HasAction = notification.HasAction,
                    ActionText = notification.ActionText,
                    ActionUrl = notification.ActionUrl
                });
            }

            return model;
        }

        public void SaveNotification(NotificationMessageEntity notification)
        {
            // Create the database model entity.
            var model = new Notification
            {
                Title = notification.Title,
                Message = notification.Message,
                IsProduction = notification.IsProduction,
                HasAction = notification.HasAction,
                ActionText = notification.ActionText,
                ActionUrl = notification.ActionUrl
            };

            // Add the new notification.
            _db.Notifications.Add(model);

            // Save the notifications.
            _db.SaveChanges();
        }

        public void DeleteNotification(int id)
        {            
            var notification = _db.Notifications.FirstOrDefault(n => n.Id == id);
         
            // Check if the notification exists.
            if (notification != null)
            {
                // Remove the notification and save changes.
                _db.Notifications.Remove(notification);
                _db.SaveChanges();
            }
        }
    }
}