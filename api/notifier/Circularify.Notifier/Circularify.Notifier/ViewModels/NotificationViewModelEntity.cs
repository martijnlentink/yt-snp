using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Circularify.Web.ViewModels
{
    public class NotificationViewModelEntity : IValidatableObject
    {
        public int NotificationId { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Message { get; set; }

        [Display(Name = "Is Production notification")]
        public bool IsProduction { get; set; }

        [Display(Name = "Notification has action")]
        public bool HasAction { get; set; }

        [Display(Name = "Action text")]
        public string ActionText { get; set; }

        [Display(Name = "Action URL")]
        public string ActionUrl { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (Title == null)
            {
                yield return new ValidationResult("Title is required.");
            }

            if (Message == null)
            {
                yield return new ValidationResult("Message is required.");
            }

            if (HasAction)
            {
                if (ActionText == null)
                {
                    yield return new ValidationResult("If the notification has an action, the Action Text must be given.");
                }

                if (ActionUrl == null)
                {
                    yield return new ValidationResult("If the notification has an action, the Action Url must be given.");
                }
            }
        }
    }
}