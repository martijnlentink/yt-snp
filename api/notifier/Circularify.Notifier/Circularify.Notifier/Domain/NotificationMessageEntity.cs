using Newtonsoft.Json;

namespace Circularify.Web.Domain
{
    public class NotificationMessageEntity
    {
        [JsonProperty(PropertyName = "notificationId")]
        public int NotificationId { get; set; }

        [JsonProperty(PropertyName = "title")]
        public string Title { get; set; }

        [JsonProperty(PropertyName = "message")]
        public string Message { get; set; }

        [JsonProperty(PropertyName = "isProduction")]
        public bool IsProduction { get; set; }

        [JsonProperty(PropertyName = "hasAction")]
        public bool HasAction { get; set; }
        [JsonProperty(PropertyName = "actionText")]
        public string ActionText { get; set; }

        [JsonProperty(PropertyName = "actionUrl")]
        public string ActionUrl { get; set; }
    }

    public class AzureMessageEntity
    {
        [JsonProperty("data")]
        public NotificationMessageEntity Data { get; set; }
    }
}