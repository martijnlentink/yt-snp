/*!
 * This is an application developed by Circularify
 */
var circularify = circularify || {};

circularify.core = circularify.core || (function () {
	var _jsCorePath = "js/core/";
	var _jsPath = "js/";
	var _cssPath = "js/";

	var _events = {
		"circReady": "circReady",
		"extRegistered": "extRegistered",
		"circConnectionRequested": "circConnectionRequested"
	};

	return {
		files: {
			modules: _jsCorePath + "modules.js",
			ytapi: _jsCorePath + "ytapi.js"
		},
		directories: {
			js: _jsPath,
			css: _cssPath
		},
		events: _events
	};
})();

// Observer pattern, uses publisher - subscriber model
circularify.mailoffice = circularify.mailoffice || (function() {
	
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
})();

// Circularify Utils Class
circularify.utils = circularify.utils || (function() {
	// Store all occured custom circularify events
	_occuredCoreEvents = [];

	/**
	 * Function for filling the _occuredCoreEvents queue
	 *
	 * @method     _eventTriggered
	 * @param      {event}  ev      Event that occured
	 */
	var _eventTriggered = function (ev) {
		_occuredCoreEvents.push(ev);
	}

	for (var ev in circularify.core.events) {
		window.addEventListener(ev, _eventTriggered);
		document.addEventListener(ev, _eventTriggered);
	}

	/**
	 * Retrieve events that occured earlier on
	 *
	 * @method     _getTriggeredEvent
	 * @param      {String}  eventName   The name of the event
	 * @param      {Object}  conditions  An object containing fields to be matched with the CustomEvent.detail
	 * @return     {Event}  The event that matched your parameters
	 */
	function _getTriggeredEvent(eventName, conditions) {
		checkEvents:
		for(var idx in _occuredCoreEvents) {
			var ev = _occuredCoreEvents[idx];
			if (ev.type == eventName) {
				if (typeof conditions !== 'undefined' && ev.detail)
				{
					for (var conIdx in conditions)
						if (ev.detail[conIdx] != conditions[conIdx])
							continue checkEvents;
				}
				return ev;
			}
		}
		return null;
	}

	/**
	 * Checks whether an event already occured if so executes the function
	 * Otherwise subscribes to the event
	 *
	 * @method     _executeOrSubscribe
	 * @param      {String}    eventName    The name of the event
	 * @param      {Function}  func         A function to execute
	 * @param      {Object}    conditions   An object containing event conditions
	 * @param      {Object}    environment  An environment on which the addEventListener is called
	 */
	function _executeOrSubscribe(eventName, func, conditions, environment) {
		environment = environment || document;
		var ev = _getTriggeredEvent(eventName, conditions);
		if (ev)
			func(ev);
		else
			environment.addEventListener(eventName, func);
	}
	
	/**
	 * Wait for target, then perform action
	 *
	 * @method     _wait
	 * @param      {Function}  target  Target to wait for
	 * @param      {Function}    action  Action to perform when ready
	 */
	function _wait(target, action) {
		setTimeout(target() ? action : function () { _wait(target, action)}, 100);
	}
	
	/**
	 * Merge two object into a new one
	 *
	 * @method     _mergeObjects
	 * @param      {Object}  obj1    The first object
	 * @param      {Object}  obj2    The second object
	 * @return     {Object}  The third object containing both properties of the first and second
	 */
	function _mergeObjects(obj1,obj2){
		var obj3 = {};
		for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
		for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
		return obj3;
	};

	/**
	 * Generates a random string of x length
	 *
	 * @method     _randString
	 * @param      {number}  x       Length of the string
	 * @return     {string}  A randomized string
	 */
	function _randString(x){
	    var s = "";
	    while(s.length<x&&x>0){
	        var r = Math.random();
	        s+= String.fromCharCode(Math.floor(r*26) + (r>0.5?97:65));
	    }
	    return s;
	}
	
	/**
	 * HTML escapes a string
	 *
	 * @method     _htmlEscape
	 * @param      {String}  str     String to escape
	 * @return     {String}  The HTML escaped version of the input
	 */
	function _htmlEscape(str) {
		return String(str)
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}

	/**
	 * Unescapes HTML string
	 *
	 * @method     _htmlUnescape
	 * @param      {String}  value   The HTML escaped string
	 * @return     {String}  The unescaped string
	 */
	function _htmlUnescape(value){
		return String(value)
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&amp;/g, '&');
	}
	
	/**
	 * Move an item in array to new index
	 *
	 * @method     _moveItem
	 * @param      {Array}   array      Array to perform the action on
	 * @param      {Number}  old_index  The current index
	 * @param      {number}  new_index  The target index
	 * @return     {Array}   Array with spliced items
	 */
	function _moveItem (array, old_index, new_index) {
		if (new_index >= this.length) {
			var k = new_index - array.length;
			while ((k--) + 1) {
				array.push(undefined);
			}
		}
		array.splice(new_index, 0, array.splice(old_index, 1)[0]);
		return array;
	};

	/**
	 * Check if a version number is greater than the given required version
	 *
	 * @method     _checkMinVersion
	 * @param      {String}   requirement     String version number minimal
	 * @param      {String}   versionToCheck  String version number actual
	 * @return     {boolean}  boolean indicating if the version is at least the given version
	 */
	function _checkMinVersion(requirement, versionToCheck) {
		if (requirement == versionToCheck)
			return true;

		var reqSplit = requirement.split('.');
		var verSplit = versionToCheck.split('.');
		for (var i = reqSplit.length - 1; i >= 0; i--) {
			if (verSplit.length > i && reqSplit[i] < verSplit[i])
				return true;
		};
		return false;
	}
	
	return {
		checkMinVersion: _checkMinVersion,
		executeOrSubscribe: _executeOrSubscribe,
		alreadyTriggered: function (eventName, conditions) { return !!_getTriggeredEvent(eventName, conditions); },
		mergeObjects: _mergeObjects,
		randomString: _randString,
		htmlEscape: _htmlEscape,
		htmlUnescape: _htmlUnescape,
		arrayMoveItem: _moveItem,
		wait: _wait
	}

})();

(function (ns) {
	// Callbacks
	_callbacks = {};
	// The port we talk to
	var _port = null;
	var _pageInstances = {};
	// Sometimes we want to talk to a port that isn't inintialized yet
	// So we create a queue that can be emptied when we're ready
	var _initQueue = [];

	/**
	 * Searches for function and tries to execute it in the given context
	 * Otherwise tries to return it as a property
	 *
	 * @method     _executeFunctionByName
	 * @param      {string}    functionName  The name of the function to execute
	 * @param      {Object}    context       The context where the function should be
	 * @param      {any[]}     args          The arguments to call on the function
	 * @return     {any}    The result of the function
	 */
	function _executeFunctionByName(functionName, context, args) {
	  var namespaces = functionName.split(".");
	  var func = namespaces.pop();
	  for(var i = 0; i < namespaces.length; i++) {
	    context = context[namespaces[i]];
	  }
	  var func = context[func];
	  console.log(functionName + " " + args.join());
	  if (typeof func === "function")
	  	return func.apply(this, args);
	  return func;
	}

	/**
	 * Generates a GUID-like string
	 * (The generation method is not really a GUID!)
	 *
	 * @method     _generateGuid
	 * @return     {string}  A GUID-like string
	 */
	function _generateGuid() {
	  function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000)
	      .toString(16)
	      .substring(1);
	  }
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	    s4() + '-' + s4() + s4() + s4();
	}

	/**
	 * Handle an incoming message from a port
	 *
	 * @method     _handleIncomingMessage
	 * @param      {object}  message  An object containing the message sent
	 * @param      {Port}    port     Chrome port to an other environment
	 */
	function _handleIncomingMessage(message, port)
	{
		if (message == null || typeof message == 'undefined')
			return;

		// Is the message for this environment - Handle it!
		if (message.target == _getCurrentEnvironment().name)
		{
			// If the message we get back is a result
			// We handle it as a result
			if (message.result)
			{
				_handleIncomingResult(message);
			}
			// Else we execute the function
			else
			{
				if (message.func)
					_executeFunctionInCurrentEnvironment(message, port);
			}
		}
		// Else - pass message to other environment
		else
		{
			// This should only occur on the background!
			_postMessage(port, message);
		}
	}

	/**
	 * Posts the message to the provided port
	 * queues the current message when port is not initialized yet
	 *
	 * @method     _postMessage
	 * @param      {<type>}  port     { description }
	 * @param      {<type>}  message  { description }
	 */
	function _postMessage(port, message) {
		if (port != null)
			port.postMessage(message);
		else
			_initQueue.push(message);
	}

	/**
	 * Execute function, requested elsewhere, here
	 * If the function was asynchronous the result is returned
	 *
	 * @method     _executeFunctionInCurrentEnvironment
	 * @param      {object}  message  Message to handle
	 * @param      {Port}    port     Port to post the result to
	 */
	function _executeFunctionInCurrentEnvironment(message, port)
	{
		var args = message.args;

		// Prepare a response message
		// The result will be set later
		var response = {
			id: message.id,
			source: _getCurrentEnvironment().name,
			target: message.source,
			instance: message.instance
		};

		// If the message waits for a callback
		if (message.isAsync)
		{
			args = args || [];
			var uid = _generateGuid();
			// Set callback, where the result is set
			var callback = function (result) {
				response.result = result;
				_postMessage(port, response);
			};
			args.push(callback);
		}

		var environment = _getCurrentEnvironment();
		var env = environment.name == "page" && message.target == "page" 
			? _pageInstances[message.instance]
			: environment;

		var result = _executeFunctionByName(message.func, message.func.startsWith("chrome") ? window : env, args);
		
		// If we run it synchronously we directly return via postMessage
		if (!message.isAsync)
		{
			response.result = result;
			_postMessage(port, response);
		}
	}

	/**
	 * Function returns a result back to the caller
	 * Gets the callback id and calls the result
	 *
	 * @method     _handleIncomingResult
	 * @param      {object}  message  Message with the incoming result
	 */
	function _handleIncomingResult(message)
	{
		var func = _callbacks[message.id];
		if(func != null)
			func(message.result);
		delete _callbacks[message.id];
	}
	
	/**
	 * Call a function independently of our environment via Omni
	 *
	 * @method     _callOmni
	 * @param      {string}    target      Target environment name: page | background | content | global (all other environments)
	 * @param      {string[]}  namespaces  The namespaces of the function to call
	 * 										- A single string means we are calling a custom function instead of a Chrome one
	 * @param      {object[]}  args        Array of arguments to pass
	 * @param      {Function}  callback    A function that serves as callback
	 * @param      {boolean}   isAsync     Is the current function going to run async
	 * @param      {string}    instance    Instance name, this is for contacting a page. 
	 * 									   When we call a page message we want to know which omni 
	 * 									   page object we want to connect to. Every Circularify.Omni.Register
	 * 									   is a new instance. This instance name is equal to the first parameter
	 */
	function _callOmni (target, namespaces, args, callback, isAsync, instance) {
		// Support for sending to all other targets - a broadcast message
		if (target == "global")
		{
			var envs = ["page", "content", "background"];
			envs.splice(envs.indexOf(_getCurrentEnvironment().name), 1);
			for (var idx in envs)
				_callOmni(envs[idx], namespaces, args, callback, isAsync, instance);

			return;
		}
		
		isAsync = !!isAsync;
		port = _port;

		// We assume, if we pass an object that we call a Chrome function
		// and a local function otherwise
		var funcName = typeof namespaces == "object" 
			? "chrome." + namespaces.join(".")
			: namespaces;

		var callbackId = 0;
		if (typeof callback !== "undefined" && callback)
		{
			callbackId = _generateGuid();
			_assignCallback(callbackId, callback);	
		}
		// If initialize this off of a page, we need to know the instance
		// we are calling from, and use that port
		if (_getCurrentEnvironment().name == 'page')
		{
			if (typeof instance === 'undefined')
				throw new Error('Something went wrong, we should have access to an instance');

			port = _pageInstances[instance]._port;
		}

		// We are to marshall our function call to another environment
		var message = {
			id: callbackId,  // The id we return to, this is for a callback
			source: _getCurrentEnvironment().name, // THe environment where the call is initialized
			target: target, // The target, where the function should be executed
			func: funcName, // The name of the function we are to call
			args: args, // The arguments we want to pass to the function
			isAsync: isAsync, // Flag that indicates wether the call is Async | This is currently unused
			instance: instance
		};

		// We want to execute a function that is defined in our own context
		if (target == _getCurrentEnvironment().name)
		{
			_executeFunctionInCurrentEnvironment(message);
		}
		// Check if we have a port to the other environments, this may be null just after page load
		else
			_postMessage(port, message);
	}

	// Register a new page instance upon the event
	window.addEventListener(circularify.core.events.circConnectionRequested, function (ev) {
		var omniId = ev.detail.id;
		var extensionId = ev.detail.extensionId;
		var version = ev.detail.version;

		var pageInstance = new PageInstance(extensionId);
		// Store the page instance in the lookup table
		_pageInstances[extensionId] = pageInstance;
		// Create the omni object
		ns.omni = ns.omni || {};
		// Set the omni to the named registration
		ns.omni[omniId] = _getExposure(extensionId);

		// Send event that omni is ready on the page
		var ev = new CustomEvent(circularify.core.events.extRegistered, {
			detail: {
				id: omniId,
				version: version,
				extensionId: extensionId
			}
		});
		window.dispatchEvent(ev);
	});

	/**
	 * PageInstance class definition
	 *
	 * @class
	 * @param      {string}  connectionId  Id of the chrome extension it connects to
	 * @return     {Object}  Page instance module
	 */
	function PageInstance (connectionId) {
		var _analyticsInit = false;
		var _gaName = circularify.utils.randomString(10);

		// Connect to the extension background from the page
		var _port = chrome.runtime.connect(connectionId);
		_port.onMessage.addListener(_handleIncomingMessage);
		_injectAnalytics();

		/**
		 * Inject the analytics on the page if it doesn't exists
		 *
		 * @method     _injectAnalytics
		 */
		function _injectAnalytics() {
			if (typeof circAnalytics !== 'undefined')
				return;

			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','https://www.google-analytics.com/analytics.js', 'circAnalytics');
		}

		/**
		 * Initialize analytics
		 *
		 * @method     _initializeGA
		 * @param      {string}  code    The GA analytics code
		 */
		function _initializeGA(code) {
			circAnalytics('create', code, 'auto', _gaName);
			circAnalytics(_gaName + '.send', 'pageview');
			_analyticsInit = true;

			window.addEventListener("spfrequest", function (e) {
				circAnalytics(_gaName + '.send', 'pageview');
			});
		};

		/**
		 * Register an analytics event
		 *
		 * @method     _registerEvent
		 * @param      {string}  category  Category
		 * @param      {string}  label     Analytics label
		 * @param      {number}  value     Analytics value
		 */
		function _registerEvent(category, label, value)
		{
			circularify.utils.wait(function () {return _analyticsInit;}, function () {
				category = category || 'Circularify';
				circAnalytics(_gaName + '.send', 'event', category, label, value);	
			});
		}

		return {
			name: "page",
			connectionId: connectionId,
			registerEvent: _registerEvent,
			initializeAnalytics: _initializeGA,
			_port: _port
		};
	}

	/* Implementation for content script */
	var _content = _content || function () {

		/**
		 * The initialization on the content
		 *
		 * @method     _initialize
		 */
		function _initialize() {
			// Create modules on the page
			_injectScript(circularify.core.files.modules);
			// Connect content to the background script
			try
			{
				_port = chrome.runtime.connect();
				_port.onMessage.addListener(_handleIncomingMessage);
			}
			catch (e)
			{
				console.error(e);
			}
		};

		/**
		 * Inject a javascript file or function into the page
		 *
		 * @method     _injectScript
		 * @param      {any}  fn      Filename or function to pass to the page
		 */
		function _injectScript(fn) {
			var isFile = typeof fn !== 'function' && fn.endsWith(".js");
			var script = document.createElement('script');

			if (isFile)
				script.src = chrome.runtime.getURL(fn);
			else
			{
				var params = Array.prototype.slice.call(arguments, 1);
				script.innerHTML = '(' + fn.toString() + ')("' + params.join('","') +'");';
			}

			document.body.appendChild(script);
		}

		/**
		 * Pass an object to the page
		 *
		 * @method     _passObject
		 * @param      {string}  name    name
		 * @param      {string}  value   value
		 * @deprecated I don't think we'll use this function ever again
		 */
		function _passObject(name, value) {
			var script = document.createElement('script');
			var isObject = typeof value === "object" ? '' : '"';
			script.innerHTML = name + "=" + isObject + value + isObject + ";";
			document.body.appendChild(script);
		}

		/**
		 * Inject CSS (file) to the page
		 *
		 * @method     _injectCss
		 * @param      {string}  css     A filename or CSS-string
		 */
		function _injectCss(css) {
			// CSS always contains a '{' character! A filename doesn't
			var isFile = css.indexOf('{') == -1;
			var element;
			if (isFile)
			{
				css = chrome.extension.getURL(css);
				element = document.createElement('link');
				element.setAttribute('rel', 'stylesheet');
				element.setAttribute('type', 'text/css');
				element.setAttribute('href', css);
			}
			else
			{
				element = document.createElement('style');
				element.innerHTML = css.toString();
			}
			
			document.head.appendChild(element);
		}

		function __registerExtension(id, extensionId) {
			// We need to pass our extension ID in order to contact the page to the background
			var manifest = chrome.runtime.getManifest();
			_injectScript(function (eventName, id, extensionId, version) {
				setTimeout(function () {
				console.debug(eventName);
				var ev = new CustomEvent(eventName, {
					detail: {
						id: id,
						version: version,
						extensionId: extensionId
					}
				});
				window.dispatchEvent(ev);}, 1000);
			}, circularify.core.events.circConnectionRequested, id, chrome.runtime.id, manifest.version);
		}

		return {
			name: "content",
			injectScript: _injectScript,
			passObject: _passObject,
			injectCss: _injectCss,
			initialize: _initialize,
			_registerExtension: __registerExtension
		};
	}();

	/* The background environment */
	var _background = _background || function () {
		var _portContent = null;
		var _name = "background";

		function _initialize(identifier) {
			chrome.runtime.onConnectExternal.addListener(_onConnectedExternal);
			chrome.runtime.onConnect.addListener(_onConnected);
		};

		function _onDisconnect(port) {
			_port = null;
			_portContent = null;

			circularify.utils.wait(function () { return _port; }, _processInitialQueue);
			chrome.runtime.onConnect.addListener(_onConnected);
			chrome.runtime.onConnectExternal.addListener(_onConnectedExternal);
		}

		function _onConnectedExternal(port) {
			chrome.runtime.onConnectExternal.removeListener(_onConnected);
			_port = port;
			_port.onMessage.addListener(_messageRecieved);
		}

		function _onConnected(port) {
			chrome.runtime.onConnect.removeListener(_onConnected);
			_portContent = port;
			_portContent.onDisconnect.addListener(_onDisconnect);
			_portContent.onMessage.addListener(_messageRecieved);
		}

		function _messageRecieved (message, port) {
			if (message.target == "content")
				port = _portContent;
			if (message.target == "page")
				port = _port;
			_handleIncomingMessage(message, port);
		}

		return {
			name: _name,
			initialize: _initialize,
		};
	}();

	// Determine the current environemnt
	function _getCurrentEnvironment() {
		if (chrome) {
			if (chrome.tabs)
				return _background;
			if (chrome.i18n)
				return _content;
		}
		return {
			name: "page"
		};
	}

	function _assignCallback(name, func)
	{
		_callbacks[name] = function(args)
		{
			var arr = [];
			arr.push(args);
			func.apply(this, arr);
		};
	}

	function _processInitialQueue()
	{
		for (var i in _initQueue)
		{
			var currentMessage = _initQueue[i];
			_port.postMessage(currentMessage);
		}
		_initQueue = [];
	}

	// Gives a module that we can expose
	function _getExposure(inst) {
		return {
			register: function (name) { _callOmni("content", "_registerExtension", [name], null, false, inst) },
			page: {
				injectScript: function (filepath) { _callOmni("content", "injectScript", Array.prototype.slice.call(arguments, 0), null, false, inst) },
				injectCss: function (filepath) { _callOmni("content", "injectCss", [filepath.toString()], null, false, inst) },
			},
			runtime: {
				id: function() {_callOmni("background", ["runtime", "id"], null, false, inst);},
				lastError: function() {_callOmni("background", ["runtime", "lastError"], null, true, inst);}
			},
			analytics: {
				initialize: function (code) { _callOmni("page", "initializeAnalytics", [code], null, false, inst)},
				registerEvent: function (event, value, category) { _callOmni("page", "registerEvent", [event, value, category], null, false, inst)}
			},
			i18n: {
				getMessage: function (messageName, substitutions) {_callOmni("content", ["i18n", "getMessage"], [messageName, substitutions], null, false, inst);},
				getUILanguage: function () {_callOmni("content", ["i18n", "getUILanguage"], [messageName, substitutions], null, false, inst);},
				getAcceptLanguages: function () {_callOmni("content", ["i18n", "getAcceptLanguages"], null, true, inst);},
				detectLanguage: function (text) {_callOmni("content", ["i18n", "detectLanguage"], [text], true, inst);}
			},
			notifications: {
				create: function (notificationId, options) {_callOmni("background", ["notifications", "create"], [notificationId, options], null, false, inst);}
			}
		};
	}

	if (_getCurrentEnvironment().name !== "page")
	{
		// initialize
		_getCurrentEnvironment().initialize();
		// Wait for a reference to the port and then handle everything in the queue
		circularify.utils.wait(function () { return _port; }, _processInitialQueue);
		// For background and content we can reach omni at circularify.omni.
		// For the page this would be circularify.omni.{registerId}
		ns.omni = _getExposure(chrome.runtime.id);
	}
})(circularify);

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
})(circularify || {}, chrome);

// JavaScript extensions;
if (typeof String.prototype.endsWith === 'undefined') {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}

window.dispatchEvent(new Event(circularify.core.events.circReady));