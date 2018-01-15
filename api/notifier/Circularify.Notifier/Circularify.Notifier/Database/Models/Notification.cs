namespace Circularify.Notifier.Db.Models
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
    }
}