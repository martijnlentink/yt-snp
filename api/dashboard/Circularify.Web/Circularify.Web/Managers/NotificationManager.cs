using System;
using System.Collections.Generic;
using System.Linq;
using Circularify.Web.Db;
using Circularify.Web.Db.Models;
using Circularify.Web.Domain;

namespace Circularify.Web.Managers
{
    public class NotificationManager
    {
        private NotifierDatabaseContext _db;

        public NotificationManager()
        {
            _db = DbInstance.Get;
        }

        public List<NotificationMessageEntity> LoadNotifications(int? max)
        {
            // Get all the notfications (not events).
            var storedNotifications = _db.Notifications.Where(n => n.IsEvent == false).ToList();

            var model = new List<NotificationMessageEntity>();

            // Loop through DB result and return the list.
            foreach (var notification in storedNotifications)
            {
                model.Add(new NotificationMessageEntity
                {
                    NotificationId = notification.Id,
                    Title = notification.Title,
                    Message = notification.Message,
                    IsProduction = notification.IsProduction,
                    HasAction = notification.HasAction,
                    ActionText = notification.ActionText,
                    ActionUrl = notification.ActionUrl,
                    Sent = notification.Sent
                });
            }

            // Order by id, most recent first.
            model = model.OrderByDescending(n => n.NotificationId).ToList();

            // If a max was given, return the last n.
            if (max != null && max.HasValue)
            {
                model = model.Take(max.Value).ToList();
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
                ActionUrl = notification.ActionUrl,
                Sent = DateTime.Now,
                IsEvent = false
            };

            // Add the new notification.
            _db.Notifications.Add(model);

            // Save the notifications.
            _db.SaveChanges();
        }

        public NotificationMessageEntity GetNotification(int id)
        {
            // Get the notification.
            var notification = _db.Notifications.FirstOrDefault(n => n.Id == id);

            // If a notification was found, convert and return it.
            if (notification != null)
            {
                return new NotificationMessageEntity
                {
                    NotificationId = notification.Id,
                    Title = notification.Title,
                    Message = notification.Message,
                    IsProduction = notification.IsProduction,
                    HasAction = notification.HasAction,
                    ActionText = notification.ActionText,
                    ActionUrl = notification.ActionUrl,
                    Sent = notification.Sent
                };
            }

            // Fallback: No result found.
            return null;
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