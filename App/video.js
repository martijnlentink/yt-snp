document.addEventListener("DOMContentLoaded", function(event) { 

console.log('test');
debugger;
var webview = document.getElementById('view');
webview.addEventListener('loadstop', function(e) {
webview.executeScript({ file: 'js/core/modules.js' }, function () {
      webview.executeScript({ file: 'js/webview.js' });
    }
);

});
webview.request.onHeadersReceived.addListener(
  function(details) {
      for (var i = details.responseHeaders.length - 1; i >= 0; i--) {
        if (details.responseHeaders[i].name.indexOf("frame") > -1)
          details.responseHeaders.splice(i, 1);
      };
      details.responseHeaders.push({"name": "Access-Control-Allow-Origin", value: "*"});
      details.responseHeaders.push({"name": "Referer", value: "https://youtube.com"});
      return {responseHeaders: details.responseHeaders};
    }, { urls: ["*://*.youtube.com/*"] }, ["blocking", "responseHeaders"]
  );

webview.request.onBeforeRequest.addListener(
  function(details) {
    if (details.url.indexOf("get_video_info") > -1)
    {
      return {redirectUrl: details.url.replace("&eurl", "&eurl=" + encodeURIComponent("https://youtube.com"))};
    }
  }
  , 
  { urls: ["*://*.youtube.com/*"]},
  ["blocking"]
);
});

function playVideo(url) {
  document.getElementById("view").navigate(url);
}
