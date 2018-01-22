// IIFE
(function () {
	document.getElementById("btnGoToSettings").addEventListener("click", openSettingsPage);
	document.getElementById("btnGoToDonate").addEventListener("click", openDonatePage);
})();

// Open the settings page
function openSettingsPage() {
	// Call Chrome function (From Chrome 42 onwards)
	chrome.runtime.openOptionsPage();
}

// Open the donate page
function openDonatePage() {
	// open the PayPal donate page in a new tab.
	window.open("http://paypal.me/ccircularify", "_blank");
}