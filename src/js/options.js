/*
	Seek 'n Play is an application developed by Circularify
*/

// Main
(function () {
	// Init
	init();

	// Internationalize the UI
	internationalize();
})();

///////////////////////////////////////
//////////////// Initialize function //
///////////////////////////////////////
async function init() {
	// Step 1: Data bind buttons
	document.getElementById("btnSave").addEventListener("click", handleSave);

	// Step 2: Pre-load the saved settings

	// Retrieve the setting box
	var enablePlayAnywhere = document.getElementById("playAnywhere");

	// Retrieve stored data
	let data = await loadSettings();

	// Set the saved value when true
	if (data.enablePlayAnywhere) {
		enablePlayAnywhere.setAttribute("checked", "checked");
	}
}

/**
 * Handle save event
 * 
 * @method handleSave()
 * @param event The save event.
 */
function handleSave(event) {
	// Reference message placeholder and hide it, default state
	var message = document.getElementById("message");
	message.setAttribute("class", "message hidden");

	// Retrieve value from options page.
	var enablePlayAnywhere = document.getElementById("playAnywhere").checked;

	// Create settings object.
	var objToSave = { 'enablePlayAnywhere': enablePlayAnywhere };

	let deferred = new Promise(function (resolve) {
		// Call save function
		saveSettings(objToSave)
			.then(function (success) {

				// When succesfull saving data, communicate this to the user,
				if (success) {
					// Retrieve i18n message.
					var msg = chrome.i18n.getMessage("settingsSaveSuccess");

					// Add success message.
					message.innerHTML = "<p>" + msg + "</p>";

					// Show message.
					message.setAttribute("class", "message success");
				}
				else {
					// Retrieve i18n message.
					var msg = chrome.i18n.getMessage("settingsSaveError");

					// An error occurred.
					message.innerHTML = "<p>" + msg + "</p>";

					// Show message.
					message.setAttribute("class", "message error");
				}

				resolve();
			});
	});
}

/**
 * Loads settings from Chrome Sync asyncrhonously.
 * 
 * @method loadSettings()
 */
function loadSettings() {
	let deferred = new Promise((resolve, reject) => {

		// Retrieve data from Chrome Sync
		chrome.storage.promise.sync.get("seeknplayApp")
			.then(function (data) {
				// Parse JSON string to object
				var obj = JSON.parse(data.seeknplayApp);

				// If nothing was stored, default values
				if (obj === undefined) {
					var obj = { 'enablePlayAnywhere': false };
				}

				resolve(obj);
			})
			.catch(function (err) {
				reject(err);
			});
	});

	return deferred;
}

/**
 * Saves setting to Chrome Sync asynchronously.
 * 
 * @method saveSettings()
 * @param The object to save.
 */
function saveSettings(setting) {
	let deferred = new Promise((resolve) => {

		// Stringify the object
		var stringified = JSON.stringify(setting);

		// Save to Chrome	
		chrome.storage.promise.sync.set({ 'seeknplayApp': stringified })
			.then(function () {
				// Return that it was succesfull.
				resolve(true);
			})
			.catch(function () {
				// Return that it was not succesfull.
				resolve(false);
			});
	});

	return deferred;
}

////////////////////////////////////////
//////////// I // 1 // 8 // N //////////
////////////////////////////////////////
function internationalize() {
	// Retrieve all elements that need i18n
	var toIntlz = document.querySelectorAll('[data-i18n]');

	// Loop through each and retrieve the i18n value
	toIntlz.forEach(function (ele) {

		// Retrieve the key for i18n
		var key = ele.getAttribute("data-i18n");

		// Retrieve the val
		var val = chrome.i18n.getMessage(key);

		// Set the body of the element with the retrieved value
		ele.innerHTML = val;
	});
}