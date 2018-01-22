using System;
using System.ComponentModel.DataAnnotations;

namespace Circularify.Web.ViewModels
{
    public class EventViewModelEntity
    {
        public int EventId { get; set; }

        [Required]
        public EventType Event { get; set; }

        public DateTime Sent { get; set; }

        [Display(Name = "Is Production event")]
        public bool IsProduction { get; set; }

    }

    public enum EventType
    {
        [Display(Name = "Snp.Enable")]
        SnpEnable,

        [Display(Name = "Snp.Disable")]
        SnpDisable,        
    }
}