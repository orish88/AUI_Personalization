// alert("ps1_pi called");
document.addEventListener('DOMContentLoaded', () => {
	// alert("dom loaded 3");
	var bt = document.getElementById("bt_personalize_page");
	bt.addEventListener('click', () => {
		// alert("personalize page clicked 2");

		var urlInput = document.getElementById("input_enter_profile_url").value;

		if (urlInput == null || urlInput === "") {
			alert("please enter a url of json profile, and press again.");
		}

		chrome.tabs.executeScript(null, { file: "bootstrap.min.js" }, function () {
			chrome.tabs.executeScript(null, { file: "jquery.js" }, function () {
				chrome.tabs.executeScript(null, {
					code: 'var profileJson ="' + urlInput + '";'
				}, function () {
					chrome.tabs.executeScript(null, { file: "ps1_e.js" });
					// chrome.tabs.executeScript(tab.id, {file: 'content.js'});
				});
			});
		});
	});


	document.getElementById("bt_personalize_page_test_profile1").addEventListener('click', () => {
		// alert("personalize page clicked 2");

		chrome.tabs.executeScript(null, { file: "jquery.js" }, function () {
			chrome.tabs.executeScript(null, { file:  "bootstrap.min.js"}, function () {
				chrome.tabs.executeScript(null, {
					code: 'var profileJson ="https://rawgit.com/orish88/AUI_Personalization/master/profiles/test_profile5.json";'
				}, function () {
					chrome.tabs.executeScript(null, { file: "ps1_e.js" });
					// chrome.tabs.executeScript(tab.id, {file: 'content.js'});
				});
			});
		});
	});

	document.getElementById("bt_personalize_page_test_profile2").addEventListener('click', () => {
		// alert("personalize page clicked 2");
		// chrome.tabs.executeScript(null, { file: "popper.js" }, function () {
			// chrome.tabs.executeScript(null, { file: "bootstrap.min.js" }, function () {
				chrome.tabs.executeScript(null, { file: "jquery.min.js" }, function () {
					chrome.tabs.executeScript(null, { file: "bootstrap.min.js" }, function () {
						chrome.tabs.executeScript(null, {
							code: 'var profileJson ="https://rawgit.com/orish88/AUI_Personalization/master/profiles/test_profile4.json";'
						}, function () {
							chrome.tabs.executeScript(null, { file: "ps1_e.js" });
							// chrome.tabs.executeScript(tab.id, {file: 'content.js'});
						});
					});
				});
			// });
		// });
	});
});