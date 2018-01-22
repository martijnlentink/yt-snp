using System;
using System.Configuration;
using System.Threading.Tasks;
using Circularify.Web.Domain;
using Circularify.Web.ViewModels;
using Microsoft.Azure.NotificationHubs;
using Newtonsoft.Json;

namespace Circularify.Web.Managers
{
    public class AzureNotificationHubManager
    {
        private EventManager _eventManager;
        private NotificationManager _notificationManager;
        private NotificationHubClient _hub;

        public AzureNotificationHubManager()
        {
            _eventManager = new EventManager();
            _notificationManager = new NotificationManager();
            _hub = NotificationHubClient.CreateClientFromConnectionString("Endpoint=sb://nh-seek-n-play.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=REDACTED", "NH-Seek-n-Play");
        }

        public async Task SendNotificationAsync(NotificationViewModelEntity notification, bool resend)
        {
            var message = new AzureMessageEntity
            {
                Data = new NotificationMessageEntity
                {
                    NotificationId = GenerateNotificationId(),
                    Title = notification.Title?.Trim(),
                    Message = notification.Message?.Trim(),
                    IsProduction = notification.IsProduction,
                    HasAction = notification.HasAction,
                    ActionText = notification.ActionText?.Trim(),
                    ActionUrl = notification.ActionUrl?.Trim()
                }
            };

            // If the message is an event, add the event.
            if (notification.IsEvent)
            {
                message.Data.Event = $"circularify.{notification.Event}";
            }
 
            // Convert the message to JSON.           
            var jsonMessage = JsonConvert.SerializeObject(message);

            try
            {
                // Send the notification.
                await _hub.SendGcmNativeNotificationAsync(jsonMessage).ConfigureAwait(false);

                if (resend == false)
                {
                    if (notification.IsEvent)
                    {
                        // Save the event in the database.
                        _eventManager.SaveEvent(message.Data);
                    }
                    else
                    {
                        // Save the notification in the database.
                        _notificationManager.SaveNotification(message.Data);
                    }
                }
            }
            catch (Exception)
            {
            }
        }

        public async Task SendEventAsync(EventViewModelEntity evt)
        {
            // Convert the event to a notification.
            var nof = new NotificationViewModelEntity
            {
                IsEvent = true,
                IsProduction = evt.IsProduction,
                Event = evt.Event.ToString(),
            };

            // Send the notification.
            await SendNotificationAsync(nof, false).ConfigureAwait(false);
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