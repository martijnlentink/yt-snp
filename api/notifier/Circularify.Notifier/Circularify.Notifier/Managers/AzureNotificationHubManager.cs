using System;
using System.Configuration;
using System.Threading.Tasks;
using Circularify.Notifier.Domain;
using Circularify.Notifier.ViewModels;
using Microsoft.Azure.NotificationHubs;
using Newtonsoft.Json;

namespace Circularify.Notifier.Managers
{
    public class AzureNotificationHubManager
    {
        private NotificationManager _notificationManager;
        private NotificationHubClient _hub;

        public AzureNotificationHubManager()
        {
            _notificationManager = new NotificationManager();
            _hub = NotificationHubClient.CreateClientFromConnectionString("Endpoint=sb://nh-seek-n-play.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=REDACTED", "NH-Seek-n-Play");
        }

        public async Task SendNotificationAsync(NotificationViewModelEntity notification)
        {
            var message = new AzureMessageEntity
            {
                Data = new NotificationMessageEntity
                {
                    NotificationId = GenerateNotificationId(),
                    Title = notification.Title,
                    Message = notification.Message,
                    IsProduction = notification.IsProduction,
                    HasAction = notification.HasAction,
                    ActionText = notification.ActionText,
                    ActionUrl = notification.ActionUrl

                }
            };

            // Convert the message to JSON.           
            var jsonMessage = JsonConvert.SerializeObject(message);

            try
            {
                // Send the notification.
                await _hub.SendGcmNativeNotificationAsync(jsonMessage).ConfigureAwait(false);

                // Save the notification in the database.
                _notificationManager.SaveNotification(message.Data);
            }
            catch (Exception ex)
            {
            }
        }

        private int GenerateNotificationId()
        {
            // Retrieve the last ID.
            var lastId = Convert.ToInt32(ConfigurationManager.AppSettings["LastNotificationId"]);

            // Create the new ID.
            var newId = lastId + 1;

            // Save the new ID.
            ConfigurationManager.AppSettings["LastNotificationId"] = newId.ToString();

            // Return the new ID.
            return newId;
        }
    }
}