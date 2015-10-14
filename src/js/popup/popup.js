/*
 * Seek 'n Play is an application developed by Circularify
 */
 
 (function() {
	var cnt = document.getElementById("message");
	var msg = chrome.i18n.getMessage("popupMessage");
	
	cnt.innerHTML = msg;
})();