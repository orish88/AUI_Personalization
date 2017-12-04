alert("background js called");
chrome.browserAction.onClicked.addListener(function(tab) {
	alert("func in background js called");


	chrome.tabs.executeScript(tab.id, {
        file: "jquery.js"
    }, function() {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
        }
    });
    chrome.tabs.executeScript(tab.id, {
        file: "ps1.js"
    }, function() {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
        }
    });
});