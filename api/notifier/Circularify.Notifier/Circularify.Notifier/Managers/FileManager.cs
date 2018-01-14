using System;
using System.Collections.Generic;
using Circularify.Notifier.Domain;
using Circularify.Notifier.Resources;
using Newtonsoft.Json;

namespace Circularify.Notifier.Managers
{
    public class FileManager
    {
        public void SaveNotification(NotificationMessageEntity notification)
        {
            // Load existing notifications.
            var notifications = LoadNotifications();
            
            // Add the new notification.
            notifications.Add(notification);

            // Save the notifications.
            SaveNotifications(notifications);
        }

        public List<NotificationMessageEntity> LoadNotifications()
        {
            try
            {
                // Read the file.
                var json = Files.notifications;

                // Convert to List<T> and return.
                return JsonConvert.DeserializeObject<List<NotificationMessageEntity>>(json);
            }
            catch (Exception)
            {
                return new List<NotificationMessageEntity>();
            }
        }

        private void SaveNotifications(List<NotificationMessageEntity> notifications)
        {
            //// Open the file for writing.
            //var resxWriter = new ResXResourceWriter("Files.resx");

            //    // Write the object to the file.
            //    var serializer = new JsonSerializer();
            //    serializer.Serialize(sw, notifications);
            //}
        }
    }
}