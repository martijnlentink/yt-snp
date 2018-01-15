using System.ComponentModel.DataAnnotations;
using Microsoft.Azure.NotificationHubs;

namespace Circularify.Notifier.ViewModels
{
    public class NotificationViewModelEntity
    {
        public int NotificationId { get; set; }
        
        public string Title { get; set; }
        
        public string Message { get; set; }

        [Display(Name = "Is production")]
        public bool IsProduction { get; set; }

        [Display(Name = "Has action")]
        public bool HasAction { get; set; }

        [Display(Name = "Action text")]
        public string ActionText { get; set; }

        [Display(Name = "Action URL")]
        public string ActionUrl { get; set; }        
    }
}