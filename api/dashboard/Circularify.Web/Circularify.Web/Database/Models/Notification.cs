using System;

namespace Circularify.Web.Db.Models
{
    public class Notification
    {
        public int Id { get; set; }
    
        public string Title { get; set; }
        
        public string Message { get; set; }

        public bool IsProduction { get; set; }

        public bool HasAction { get; set; }

        public string ActionText { get; set; }
        
        public string ActionUrl { get; set; }

        public DateTime Sent { get; set; }

        public bool IsEvent { get; set; }

        public string Event { get; set; }
    }
}