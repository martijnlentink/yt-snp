/* Code borrowed from YoutubeCenter to re-enable SPF */

function spfFix() {

	var con = console;
	var uw = window;

	function defineLockedProperty(obj, key, setter, getter) {
		  if (typeof obj !== "object") obj = {};
		  if (typeof Object.defineProperty === "function") {
			Object.defineProperty(obj, key, {
			  get: getter,
			  set: setter
			});
			return obj;
		  } else { // Should never occur in Chrome
			obj.__defineGetter__(key, getter);
			obj.__defineSetter__(key, setter);
			return obj;
		  }
		}
		
		var convertToArray = function(list){
		  var arr = [], i, len = list.length;
		  for (i = 0; i < len; i++) {
			arr.push(list[i]);
		  }
		  return arr;
		};
		
	(function(){
		  function SPFEnabled(objects) {
			defineLockedProperty(this, "enabled", function(value){ }, function(){
			  return enabled;
			});
			for (key in objects) {
			  if (key === "enabled") continue;
			  if (objects.hasOwnProperty(key)) {
				this[key] = objects[key];
			  }
			}
		  }
		  function SPFState() {
			defineLockedProperty(this, "config", function(cfg){
			  var key;
			  for (key in cfg) {
				if (cfg.hasOwnProperty(key)) {
				  config[key] = cfg[key];
				}
			  }
			}, function(){
			  return config;
			});
		  }
		  function SPFConfig() {
			var i;
			for (i = 0; i < events.length; i++) {
			  configFunctions[events[i]] = (function(event){
				return function(){
				  try {
					var args = arguments;
					con.log("[SPF] " + event, args);
					
					inProgress = true;
					
					try { args = callListenerCallbacks(event, "before", args) || args; } catch (e) { con.error(e); }
					try { if (_ytconfig[event]) args = _ytconfig[event].apply(uw, args) || args; } catch (e) { con.error(e); }
					if (event === "navigate-processed-callback") inProgress = false;
					try { args = callListenerCallbacks(event, "after", args) || args; } catch (e) { con.error(e); }
				  } catch (e) {
					con.error(e);
				  }
				};
			  })(events[i]);
			  
			  defineLockedProperty(this, events[i], (function(event){
				return function(func) { _ytconfig[event] = func; };
			  })(events[i]), (function(func){
				return function(){ return func; };
			  })(configFunctions[events[i]]));
			}
		  }
		  function transformArguments(args) {
			var a = convertToArray(args);
			if (a.length > 1) {
			  a[1] = ytcenter.spfPackages(a[1]);
			}
			return a;
		  }
		  function transformArgumentsBack(args) {
			var a = convertToArray(args);
			if (a.length > 1 && a[1] && a[1].getPackages) {
			  a[1] = a[1].getPackages();
			}
			return a;
		  }
		  function callListenerCallbacks(event, mode, args) {
			try {
			  if (!listeners[event]) return; // No attached listeners to the specific event.
			  var i;
			  
			  args = transformArguments(args);
			  
			  for (i = 0; i < listeners[event].length; i++) {
				if (listeners[event][i].mode !== mode) continue; // Needs to be the exact same mode.
				args = listeners[event][i].callback.apply(null, args) || args;
			  }
			  
			  return transformArgumentsBack(args);
			} catch (e) {
			  con.error(e);
			}
		  }
		  function isConfigEvent(key) {
			var i;
			for (i = 0; i < events.length; i++) {
			  if (events[i] === key) return true;
			}
			return false;
		  }
		  var enabled = true, events = [
			"navigate-error-callback",
			"navigate-part-processed-callback",
			"navigate-part-received-callback",
			"navigate-processed-callback",
			"navigate-received-callback",
			"navigate-requested-callback"
		  ], configFunctions = {}, listeners = {}, _ytconfig = {}, config = new SPFConfig(), state = new SPFState(), inProgress = false;
		  
		  // Locking "_spf_state".
		  try {
			uw._spf_state = state;
			defineLockedProperty(uw, "_spf_state", function(s){
			  var key;
			  for (key in s) {
				if (s.hasOwnProperty(key)) {
				  state[key] = s[key];
				}
			  }
			}, function(){
			  return state;
			});
		  } catch (e) {
			con.error(e);
		  }
		  
		  // Making sure that SPF is enabled.
		  uw.ytspf = new SPFEnabled(uw.ytspf);
		  
		  return {
			addEventListener: function(event, mode, callback){
			  event = "navigate-" + event + "-callback";
			  if (mode !== "before" && mode !== "after") throw "Unknown mode: " + mode;
			  if (!listeners[event]) listeners[event] = [];
			  listeners[event].push({mode: mode, callback: callback});
			},
			removeEventListener: function(event, mode, callback){
			  event = "navigate-" + event + "-callback";
			  if (mode !== "before" && mode !== "after") throw "Unknown mode: " + mode;
			  if (!listeners[event]) return;
			  var i;
			  for (i = 0; i < listeners[event].length; i++) {
				if (listeners[event][i].mode === mode && listeners[event][i].callback === callback) {
				  listeners[event].splice(i, 1);
				  return;
				}
			  }
			},
			disable: function(){
			  enabled = false;
			  if (uw.spf && uw.spf.dispose) uw.spf.dispose();
			},
			isEnabled: function(){ return enabled; },
			inProgress: function(){ return inProgress; }
		  };
		})();
		
	spf.init();
};