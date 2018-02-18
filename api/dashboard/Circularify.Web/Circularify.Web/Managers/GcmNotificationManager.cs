using System;
using System.Configuration;
using System.IO;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Circularify.Web.Domain;
using Circularify.Web.ViewModels;
using Newtonsoft.Json;

namespace Circularify.Web.Managers
{
    public class GcmNotificationManager
    {
        private NotificationManager _notificationManager;

        public GcmNotificationManager()
        {
            _notificationManager = new NotificationManager();
        }

        public async Task SendNotificationAsync(NotificationViewModelEntity notification)
        {
            var message = new GcmMessageEntity
            {
                Notification = new NotificationMessageEntity
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
            
            try
            {
                // Send the notification.
                var response = await SendNotificationAsync(message).ConfigureAwait(false);

                // Save the notification in the database.
                _notificationManager.SaveNotification(message.Notification);
            }
            catch (Exception)
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

        private async Task<string> SendNotificationAsync(GcmMessageEntity message)
        {
            var applicationId = ConfigurationManager.AppSettings["GcmApplicationId"];
            var senderId = ConfigurationManager.AppSettings["GcmSenderId"];

            var sendRequest = WebRequest.Create("https://fcm.googleapis.com/fcm/send");
            sendRequest.Method = "post";
            sendRequest.ContentType = "application/json";
            
            var json = JsonConvert.SerializeObject(message);
            var byteArray = Encoding.UTF8.GetBytes(json);

            sendRequest.Headers.Add($"Authorization: key={applicationId}");
            sendRequest.Headers.Add($"Sender: id={senderId}");
            sendRequest.ContentLength = byteArray.Length;

            try
            {
                using (var stream = await sendRequest.GetRequestStreamAsync().ConfigureAwait(false))
                {
                    await stream.WriteAsync(byteArray, 0, byteArray.Length).ConfigureAwait(false);

                    using (var response = await sendRequest.GetResponseAsync().ConfigureAwait(false))
                    {
                        using (var responseStream = response.GetResponseStream())
                        {
                            using (var reader = new StreamReader(responseStream))
                            {
                                return await reader.ReadToEndAsync().ConfigureAwait(false);
                            }
                        }
                    }
                }
            }
            catch(Exception ex)
            {
                return ex.Message;
            }
        }
    }
}