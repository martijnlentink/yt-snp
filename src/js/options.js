/*
	Seek 'n Play is an application developed by Circularify
*/

const _playAnywhereSetting = "playAnywhere";

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
	let isEnabled = await circularify.settings.get(_playAnywhereSetting);

	// Set the saved value when true
	if (isEnabled)
		enablePlayAnywhere.setAttribute("checked", "checked");
}

/**
 * Handle save event
 * 
 * @method handleSave()
 * @param event The save event.
 */
async function handleSave(event) {
	// Reference message placeholder and hide it, default state
	var message = document.getElementById("message");
	message.setAttribute("class", "message hidden");

	// Retrieve value from options page.
	var enablePlayAnywhere = document.getElementById("playAnywhere").checked;

	// Add success message.
	var msg = chrome.i18n.getMessage("settingsSaveSuccess");
	message.innerHTML = "<p>" + msg + "</p>";
	message.setAttribute("class", "message success");

	try {
		await circularify.settings.set(_playAnywhereSetting, enablePlayAnywhere);
	}
	catch (error) {
		// An error occurred.
		// Show message.
		var msg = chrome.i18n.getMessage("settingsSaveError");
		message.innerHTML = "<p>" + msg + "</p>";
		message.setAttribute("class", "message error");
	}
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