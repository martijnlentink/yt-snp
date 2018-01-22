using System;
using System.Collections.Generic;
using System.Linq;
using Circularify.Web.Db;
using Circularify.Web.Db.Models;
using Circularify.Web.Domain;

namespace Circularify.Web.Managers
{
    public class EventManager
    {
        private NotifierDatabaseContext _db;

        public EventManager()
        {
            _db = DbInstance.Get;
        }

        public List<NotificationMessageEntity> LoadEvents(int? max)
        {
            // Get all the notfications (only events).
            var storedNotifications = _db.Notifications.Where(n => n.IsEvent == true).ToList();

            var model = new List<NotificationMessageEntity>();

            // Loop through DB result and return the list.
            foreach (var @event in storedNotifications)
            {
                model.Add(new NotificationMessageEntity
                {
                    NotificationId = @event.Id,
                    Event = @event.Event,
                    Sent = @event.Sent
                });
            }

            // Sort by id (most recent first).
            model = model.OrderByDescending(e => e.NotificationId).ToList();

            // If a max was given, return the last n.
            if (max != null && max.HasValue)
            {                
                model = model.Take(max.Value).ToList();
            }

            return model;
        }

        public void SaveEvent(NotificationMessageEntity evt)
        {
            // Split event (circularify.xxx; xxx being the event).
            var eventSplit = evt.Event.Split('.');

            // Create the database model entity.
            var model = new Notification
            {               
                Sent = DateTime.Now,
                IsEvent = true,
                Event = eventSplit[1],
                IsProduction = evt.IsProduction
            };

            // Add the new event.
            _db.Notifications.Add(model);

            // Save the event.
            _db.SaveChanges();
        }

        public void DeleteEvent(int id)
        {
            var evt = _db.Notifications.FirstOrDefault(n => n.Id == id && n.IsEvent == true);

            // Check if the event exists.
            if (evt != null)
            {
                // Remove the event and save changes.
                _db.Notifications.Remove(evt);
                _db.SaveChanges();
            }
        }
    }
}