// IIFE
(function() {
	document.getElementById("btnGoToSettings").addEventListener("click", openSettinsPage);
})();

// Open the settings page
function openSettinsPage()
{
	// Call Chrome function (From Chromme 42 onwards)
	chrome.runtime.openOptionsPage();
}