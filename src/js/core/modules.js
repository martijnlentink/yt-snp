/*
 * Seek 'n Play is an application developed by Circularify
 */

var circularify = circularify || {};


// Circularify Utils Class
circularify.utils = circularify.utils ||  function() {
	
	// Wait until the YouTube API's ready.	
	function _wait(target, action) {
		setTimeout(target() ? action : function () { wait(target, action)}, 100);
	}
	
	function _mergeObjects(obj1,obj2){
		var obj3 = {};
		for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
		for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
		return obj3;
	};
	
	return {
		mergeObjects: _mergeObjects,
		wait: _wait
	}

}();


// Main method
(function (circularify, chrome) {
	
	circularify.settings = circularify.settings || {};
	// --- Private fields ---
	// Callback registrations for when the settings are loaded
	_registeredCallbacks = [];

	// Default settings are implemented by the project
	circularify.settings.defaultSettings = circularify.defaultSettings || {};
	circularify.settings.currentSettings = circularify.settings.currentSettings || {};
	
	chrome.storage.sync.get("settings", function (set) {
		// Merge saved settings with defaults
		circularify.settings.defaultSettings = circularify.utils.mergeObjects(circularify.defaultSettings, circularify.settings.currentSettings);
		for (var i = _registeredCallbacks.length - 1; i >= 0; i--) {
			var callback = _registeredCallbacks[i];
			callback();
		};
	});

	circularify.settings.registerSettingsLoaded = function (callback) {
		if (typeof (callback) !== "function")
			throw new Exception("Callback must be of type 'function'");
		_registeredCallbacks.push(callback);
	};
	
	
	// Retrieve a setting
	circularify.settings.get = function (setting) {
		return circularify.currentSettings.settings[setting];
	}
	
	// Set a setting
	circularify.settings.set = function (setting, value) {
		settings[setting] = value;
		chrome.storage.sync.set( { settings: settings } );
	}
	
	// Creates a simple two-way binding
	circularify.settings.bind = function () {
		var elements = document.querySelectorAll("[data-setting]");
		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];
			var value = element.value;
			var settingString = element.getAttribute("data-setting");
			var settingValue = circularify.settings.get(settingString);
			var type = element.getAttribute("type");
			
			// We know the following two way bindings -- TODO is add more as we go
			switch(type) {
				// Multiple radio buttons
				case 'radio':
					element.checked = value === settingValue;
					element.addEventListener('click', function (event) { if (event.target.checked) circularify.settings.set(event.target.getAttribute("data-setting"), event.target.value); });
					break;
				// Single checkboxes
				case 'checkbox':
					var bool = value == 'true';
					element.checked = bool == settingValue;
					element.addEventListener('change', function () { var val = event.target.value == 'true'; circularify.settings.set(event.target.getAttribute("data-setting"), event.target.checked ? val : !val ); });
					break;
			}
		}
	};
	
	circularify.i18n = circularify.i18n || {};
	
	/* Internationalization */
	circularify.i18n.performTranslation = function () {

		var elements = document.querySelectorAll("[data-translation]");
		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];
			var translationString = element.getAttribute("data-translation");
			var translation = chrome.i18n.getMessage(translationString);
			element.innerHTML = translation;
		}
	};

	return circularify;
}(circularify || {}, chrome));


// JavaScript extensions;

// Add 'endsWith' method for URL sake
// Reference: https://coderwall.com/p/9nfu0a
if (typeof String.prototype.endsWith === 'undefined') {
	String.prototype.endsWith = function(suffix) {
		if (typeof suffix === 'String') {
			return this.indexOf(suffix, this.length - suffix.length) !== -1;
		}else if(suffix instanceof Array){
			return _.find(suffix, function(value){
				console.log(value, (this.indexOf(value, this.length - value.length) !== -1));
				return this.indexOf(value, this.length - value.length) !== -1;
			}, this);
		}
	};
}