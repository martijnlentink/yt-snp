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

circularify.omni = circularify.omni || function () {

	// Callbacks
	_callbacks = {};

	function executeFunctionByName(functionName, context, args) {
	  var namespaces = functionName.split(".");
	  var func = namespaces.pop();
	  for(var i = 0; i < namespaces.length; i++) {
	    context = context[namespaces[i]];
	  }
	  var func = context[func];
	  if (typeof func === "function")
	  	return func.apply(this, args);
	  return func;
	}

	function _generateGuid() {
	  function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000)
	      .toString(16)
	      .substring(1);
	  }
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	    s4() + '-' + s4() + s4() + s4();
	}

	var _port = null;

	function _handleMessage(message, port)
	{
		if (message.target == _getCurrentEnvironment().Name)
		{
			if (message.result)
			{
				_returnResult(message, port);
			}
			else
			{
				if (message.func)
					_executeFunc(message, port);
			}
		}
		else
		{
			// This should only occur on the background!
			port.postMessage(message);
		}
	}

	function _executeFunc(message, port)
	{
		var args = message.args;
		if (message.isAsync)
		{
			args = args || [];
			var uid = _generateGuid();
			var callback = function (result) {
				port.postMessage({ id: message.id, source: _getCurrentEnvironment().Name, target: message.source, result: result });
			};
			args.push(callback);
		}
		var result = executeFunctionByName(message.func, window, args);
		if (!message.isAsync)
			port.postMessage({ id: message.id, source: _getCurrentEnvironment().Name, target: message.source, result: result });
	}

	function _returnResult(message, port)
	{
		var func = _callbacks[message.id];
		if(func != null)
			func(message.result);
		delete _callbacks[message.id];
	}

	var _page = _page || function () {

		function _establishConnection() {
			var id = chrome.runtime.id;
			_port = chrome.runtime.connect(id);
			_port.onMessage.addListener(_handleMessage);
		};

		return {
			Name: "page",
			EstablishConnection: _establishConnection
		};
	}();

	function _callFunc (target, namespaces, args, callback, isAsync) {
		isAsync = !!isAsync;
		var funcName = "chrome." + namespaces.join(".");
		var callbackId = _generateGuid();
		_assignCallback(callbackId,callback);
		_port.postMessage({ id: callbackId, source: _getCurrentEnvironment().Name, target: target, func: funcName, args: args, isAsync: isAsync });
	}

	/* Implementation for content script */
	var _content = _content || function () {

		function _establishConnection() {
			_port = chrome.runtime.connect();
			_port.onMessage.addListener(_handleMessage);
		};

		// Inject linked file
		function _injectLinkedFile(fn) {
			var script = document.createElement('script');
			script.src = fn;
			document.body.appendChild(script);
		}

		// Inject function
		function _injectScript(fn) {
			var script = document.createElement('script');
			script.innerHTML = '(' + fn.toString() + ')();';
			document.body.appendChild(script);
		}

		// Pass object
		function _passObject(name, value) {
			var script = document.createElement('script');
			var isObject = typeof value === "object" ? '' : '"';
			script.innerHTML = name + "=" + isObject + value + isObject + ";";
			document.body.appendChild(script);
		}

		// Inject some CSS
		function _injectCss(css) {
			var element = document.createElement('style');
			element.innerHTML = css.toString();
			document.head.appendChild(element);
		}

		return {
			Name: "content",
			InjectLinkedFile: _injectLinkedFile,
			InjectScript: _injectScript,
			PassObject: _passObject,
			InjectCss: _injectCss,
			EstablishConnection: _establishConnection
		};
	}();

	var _background = _background || function () {
		var _portContent = null;
		var _name = "background";

		function _establishConnection() {
			chrome.runtime.onConnectExternal.addListener(_onConnectedExternal);
			chrome.runtime.onConnect.addListener(_onConnected);
		};

		function _onConnectedExternal(port) {
			_port = port;
			_port.onMessage.addListener(_messageRecieved);
		}

		function _onConnected(port) {
			_portContent = port;
			_portContent.onMessage.addListener(_messageRecieved);
		}

		function _messageRecieved (message, port) {
			if (message.target == "content")
				port = _portContent;
			if (message.target == "page")
				port = _port;
			_handleMessage(message, port);
		}

		return {
			Name: _name,
			EstablishConnection: _establishConnection
		};
	}();

	var _environments = {
		page: _page,
		content: _content,
		background: _background
	};

	function _getCurrentEnvironment() {
		if (chrome) {
			if (chrome.tabs)
				return _environments.background;
			if (chrome.i18n)
				return _environments.content;
		}
		return _environments.page;
	}

	function _injectPrerequisites() {
		// In order to set up a connection from the page to our content script we need to know the chrome extension ID
		if (_getCurrentEnvironment() == _environments.content) {
			_content.PassObject("chrome.runtime.id", chrome.runtime.id);
			_content.EstablishConnection();
		}
		else if (_getCurrentEnvironment() == _environments.page) {
			circularify.utils.wait(function () {
				return chrome.runtime.id;
			}, _page.EstablishConnection);
		} else
		{
			_background.EstablishConnection();
		}
	};

	function _assignCallback(name, func)
	{
		_callbacks[name] = function(args)
		{
			var arr = [];
			arr.push(args);
			func.apply(this, arr);
		};
	}

	// API namespaces:
	var _runtime = _runtime || function () {
		var _namespaces = (_namespaces || []).concat["runtime"];

		return {
			id: function(ns) {_callFunc("background", ["runtime", "id"], null, ns);},
			lastError: function(ns) {_callFunc("background", ["runtime", "lastError"], null, ns);}
		};
	}();

	// Initialize
	_injectPrerequisites();

	return {
		runtime: _runtime,
		i18n: {
			getMessage: function (messageName, substitutions, ns) {_callFunc("content", ["i18n", "getMessage"], [messageName, substitutions], ns);},
			getUILanguage: function (ns) {_callFunc("content", ["i18n", "getUILanguage"], [messageName, substitutions], ns);},
			getAcceptLanguages: function (ns) {_callFunc("content", ["i18n", "getAcceptLanguages"], null, ns, true);},
			detectLanguage: function (text, ns) {_callFunc("content", ["i18n", "detectLanguage"], [text], ns, true);}
		},
		notifications: {
			create: function (notificationId, options, ns) {_callFunc("background", ["notifications", "create"], [notificationId, options], ns);}
		}
	};
}();

// Observer pattern, uses publisher - subscriber model
circularify.mailoffice = circularify.mailoffice || function() {
	
	var _receipients = [];
	
	function _subscribe(receipient) {
		circularify.mailoffice.receipients.push(receipient);
	};

	function _unubscribe(receipient) {
		var index = circularify.mailoffice.receipients.indexOf(receipient);
		
		if(~index) {
			this.receipients.splice(index, 1);
		}
	};
	
	function _sendMailman() {		
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

circularify.exts = circularify.exts || function() {

	var _installed = [];

	return {
		installed: _installed
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