
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
	
	// if save success
	var success = true;
	
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