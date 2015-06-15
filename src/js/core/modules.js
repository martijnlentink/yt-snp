/*
 * Seek 'n Play is an application developed by Circularify
 */

// Main method
var YTSNP = (function (snp, chrome) {
	
	var mergeObjects = function (obj1,obj2){
		var obj3 = {};
		for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
		for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
		return obj3;
	};

	/* Settings */
	var defaultSettings = {
		'position': 'bottom',
		'hide-welcome': false
	};
	
	var settings;
	
	chrome.storage.sync.get("settings", function (set) {
		settings = mergeObjects(defaultSettings, set.settings || {});
		if (typeof (snp.settings.ready) === "function") {
			snp.settings.ready();
		}
	});
	
	snp.settings = snp.settings || {};
	
	// Retrieve a setting
	snp.settings.get = function (setting) {
		return settings[setting];
	}
	
	// Set a setting
	snp.settings.set = function (setting, value) {
		settings[setting] = value;
		chrome.storage.sync.set( { settings: settings } );
	}
	
	// Creates a simple two-way binding
	snp.settings.bind = function () {
		var elements = document.querySelectorAll("[data-setting]");
		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];
			var value = element.value;
			var settingString = element.getAttribute("data-setting");
			var settingValue = snp.settings.get(settingString);
			var type = element.getAttribute("type");
			
			// We know the following two way bindings -- TODO is add more as we go
			switch(type) {
				// Multiple radio buttons
				case 'radio':
					element.checked = value === settingValue;
					element.addEventListener('click', function (event) { if (event.target.checked) snp.settings.set(event.target.getAttribute("data-setting"), event.target.value); });
					break;
				// Single checkboxes
				case 'checkbox':
					var bool = value == 'true';
					element.checked = bool == settingValue;
					element.addEventListener('change', function () { var val = event.target.value == 'true'; snp.settings.set(event.target.getAttribute("data-setting"), event.target.checked ? val : !val ); });
					break;
			}
		}
	};
	
	snp.i18n = snp.i18n || {};
	
	/* Internationalization */
	snp.i18n.performTranslation = function () {

		var elements = document.querySelectorAll("[data-translation]");
		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];
			var translationString = element.getAttribute("data-translation");
			var translation = chrome.i18n.getMessage(translationString);
			element.innerHTML = translation;
		}
	};

	return snp;
}(YTSNP || {}, chrome));