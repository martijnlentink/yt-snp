
// IIFE
(function() 
{
	// Data-bind function call to button
	document.getElementById("btnSave").addEventListener("click", handleSave);

	// Internationalize
	internationalize();
})();

///////////////////////////////////////
///////// Handle Save event function //
///////////////////////////////////////
function handleSave(event)
{
	// Reference message placeholder and hide it, default state
	var message = document.getElementById("message");
	message.setAttribute("class", "message hidden");
	
	// Retrieve value from options page
	var enablePlayAnywhere = document.getElementById("playAnywhere").checked;
	
	// Create settings object
	var objToSave = { 'enablePlayAnywhere': enablePlayAnywhere };
	
	// Call save function
	let success = saveSettings(objToSave);
	
	// When succesfull saving data, communicate this to the user
	if(success)
	{
		var msg = chrome.i18n.getMessage("settingsSaveSuccess");
		
		// Add success message
		message.innerHTML = "<p>" + msg + "</p>";
				
		// Show message
		message.setAttribute("class", "message success");
	}
	else
	{
		// Retrieve i18n message
		var msg = chrome.i18n.getMessage("settingsSaveError");
		
		// An error occurred.
		message.innerHTML = "<p>" + msg + "</p>";
				
		// Show message
		message.setAttribute("class", "message error");
	}
}

///////////////////////////////////////
//////////////// Async Save Function //
/////// Saves setting to Chrome Sync //
///////////////////////////////////////
async function saveSettings(setting)
{
	// Stringify the object
	var stringified = JSON.stringify(setting);
	
	// Save to Chrome
	chrome.storage.sync.set({ 'seeknplayApp': stringified }, function() {
		
		// Check if the lastError is set, if so an error occurred
		if(chrome.runtime.lastError !== undefined)
		{
			// Cout the error
			console.error(chrome.runtime.lastError);
			
			// Return save error
			return false;
		}
		else
		{
			// All is well, return so
			return true;
		}
	});
}

////////////////////////////////////////
//////////// I // 1 // 8 // N //////////
////////////////////////////////////////
function internationalize() 
{	
	// Retrieve all elements that need i18n
	var toIntlz = document.querySelectorAll('[data-i18n]');
	
	// Loop through each and retrieve the i18n value
	toIntlz.forEach(function(ele) {
		
		// Retrieve the key for i18n
		var key = ele.getAttribute("data-i18n");
		
		// Retrieve the val
		var val = chrome.i18n.getMessage(key);
		
		ele.innerHTML = val;
	});
}