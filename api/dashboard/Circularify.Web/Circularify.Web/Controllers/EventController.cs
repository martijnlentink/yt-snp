using System;
using System.Collections.Generic;
using System.Web.Mvc;
using Circularify.Web.Managers;
using Circularify.Web.ViewModels;

namespace Circularify.Web.Controllers
{
    public class EventController : Controller
    {
        private EventManager _eventManager;
        private GcmNotificationManager _gcmManager;

        public EventController()
        {
            _eventManager = new EventManager();
            _gcmManager = new GcmNotificationManager();
        }
        
        public ActionResult Index()
        {
            var storedEvents = _eventManager.LoadEvents(null);

            var eventsModel = new List<EventViewModelEntity>();

            foreach (var evt in storedEvents)
            {
                eventsModel.Add(new EventViewModelEntity
                {
                    EventId = evt.NotificationId,
                    Event = (EventType)Enum.Parse(typeof(EventType), evt.Event),
                    Sent = evt.Sent
                });
            }

            return View(eventsModel);
        }

        [ChildActionOnly]
        public ActionResult LoadLatestEvents()
        {
            var storedEvents = _eventManager.LoadEvents(5);

            var eventsModel = new List<EventViewModelEntity>();

            foreach (var evt in storedEvents)
            {
                eventsModel.Add(new EventViewModelEntity
                {
                    EventId = evt.NotificationId,
                    Event = (EventType)Enum.Parse(typeof(EventType), evt.Event),
                    Sent = evt.Sent
                });
            }

            return PartialView("_LatestEvents", eventsModel);
        }

        public ActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Create(EventViewModelEntity evt)
        {
            if (!ModelState.IsValid)
            {
                return View(evt);
            }
       
            // Send the notification.
            _gcmManager.SendEventAsync(evt).ConfigureAwait(false);

            return RedirectToAction("CreateRedirect");
        }

        public ActionResult CreateRedirect()
        {
            return View();
        }

        public ActionResult Delete(int id)
        {
            // Delete the notification.
            _eventManager.DeleteEvent(id);

            return RedirectToAction("DeleteRedirect");
        }

        public ActionResult DeleteRedirect()
        {
            return View();
        }
    }
}