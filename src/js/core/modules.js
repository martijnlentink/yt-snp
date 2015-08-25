/*
 * Seek 'n Play is an application developed by Circularify
 */

var circularify = circularify || {};


// Circularify Utils Class
circularify.utils = circularify.utils ||  function() {
	
	// Wait until the YouTube API's ready.	
	function _wait(target, action) {
		setTimeout(target() ? action : function () { _wait(target, action)}, 100);
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

// Observer pattern, uses publisher - subscriber model
circularify.mailoffice = circularify.mailoffice || function() {

	var _receipients = [];
	
	function _subscribe(receipient) {
		console.log('>Receipient added: ' + receipient);
		circularify.mailoffice.receipients.push(receipient);
	};

	function _unubscribe(receipient) {
		console.log('>Receipient removed: ' + receipient);
		var index = circularify.mailoffice.receipients.indexOf(receipient);
		
		if(~index) {
			this.receipients.splice(index, 1);
		}
	};
	
	function _sendMailman() {		
		//console.info("Sending the mailman");
		for(var i = 0; i < circularify.mailoffice.receipients.length; i++) {
			circularify.mailoffice.receipients[i]();
		}
	}
	
	return {
		receipients: _receipients,
		subscribe: _subscribe,
		unsubscribe: _unubscribe,
		sendMailman: _sendMailman
	}
}();

// Main method
(function (circularify, chrome) {
		
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