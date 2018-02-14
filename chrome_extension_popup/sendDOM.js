console.log("***********sendDom called*******************8");
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	// If the received message has the expected format...
    console.log("inside msg listener");
    if (msg.text === 'report_back') {
		// Call the specified callback, passing
		// the web-page's DOM content as argument
        // sendResponse(document.all[0].outerHTML);
        sendResponse(document);
	}
});