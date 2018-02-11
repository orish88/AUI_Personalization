// alert("ps1_pi called");

var profileJson1 = "https://rawgit.com/orish88/AUI_Personalization/master/profiles/test_profile5.json";
getPersonalization(profileJson1);

document.addEventListener('DOMContentLoaded', () => {
	// alert("dom loaded 3");
	var bt = document.getElementById("bt_personalize_page");
	bt.addEventListener('click', () => {
		// alert("personalize page clicked 2");
		
		var urlInput = document.getElementById("input_enter_profile_url").value;
		reloadPage(urlInput);

		// if (urlInput == null || urlInput === "") {
		// 	alert("please enter a url of json profile, and press again.");
		// }

		// // chrome.tabs.executeScript(null, { file: "bootstrap.min.js" }, function () {
		// 	chrome.tabs.executeScript(null, { file: "jquery.js" }, function () {
		// 		chrome.tabs.executeScript(null, {
		// 			code: 'var profileJson ="' + urlInput + '";'
		// 		}, function () {
		// 			chrome.tabs.executeScript(null, { file: "ps1_e.js" });
		// 			// chrome.tabs.executeScript(tab.id, {file: 'content.js'});
		// 		});
		// 	});
		// // });
	});


	document.getElementById("bt_personalize_page_test_profile1").addEventListener('click', () => {
		// alert("personalize page clicked 2");
		//for popup:

		reloadPage("https://rawgit.com/orish88/AUI_Personalization/master/profiles/test_profile5.json");
		
		// getPersonalization("https://rawgit.com/orish88/AUI_Personalization/master/profiles/test_profile5.json");
		
		// chrome.tabs.executeScript(null, { file: "jquery.js" }, function () {
		// 	// chrome.tabs.executeScript(null, { file:  "bootstrap.min.js"}, function () {
		// 		chrome.tabs.executeScript(null, {
		// 			code: 'var profileJson ="https://rawgit.com/orish88/AUI_Personalization/master/profiles/test_profile5.json";'
		// 		}, function () {

		// 			chrome.tabs.executeScript(null, { file: "ps1_e.js" });
		// 			// chrome.tabs.executeScript(tab.id, {file: 'content.js'});
		// 		});
		// 	// });
		// });
	});

	document.getElementById("bt_personalize_page_test_profile2").addEventListener('click', () => {
		// alert("personalize page clicked 2");
		// chrome.tabs.executeScript(null, { file: "popper.js" }, function () {
			// chrome.tabs.executeScript(null, { file: "bootstrap.min.js" }, function () {


				reloadPage("https://rawgit.com/orish88/AUI_Personalization/master/profiles/test_profile4.json");
				//for popup:

				// getPersonalization("https://rawgit.com/orish88/AUI_Personalization/master/profiles/test_profile4.json");
				
				// chrome.tabs.executeScript(null, { file: "jquery.min.js" }, function () {
				// 	// chrome.tabs.executeScript(null, { file: "bootstrap.min.js" }, function () {
				// 		chrome.tabs.executeScript(null, {
				// 			code: 'var profileJson ="https://rawgit.com/orish88/AUI_Personalization/master/profiles/test_profile4.json";'
				// 		}, function () {

				// 			chrome.tabs.executeScript(null, { file: "ps1_e.js" });
				// 			// chrome.tabs.executeScript(tab.id, {file: 'content.js'});
				// 		});
				// 	// });
				// });

			// });
		// });
	});


	// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

	// 	chrome.tabs.executeScript(null, {
	// 		code: 'console.log("refresh listener called"); var profileJson ="https://rawgit.com/orish88/AUI_Personalization/master/profiles/test_profile4.json";'
	// 	}, function () {
	// 		chrome.tabs.executeScript(tabId, { file: "ps1_e.js" });
	// 	});

	// });

	function reloadPage(profleJsonUrl){


		personalize(profleJsonUrl);
		// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		// 	chrome.tabs.update(tabs[0].id, {url: tabs[0].url},function(){
		// 		personalize(profleJsonUrl);
		// 	});
		// });
	}

	function personalize(profileJsonUrl){
		// getPersonalization(profileJsonUrl);
		chrome.tabs.executeScript(null, { file: "jquery.js" }, function () {
				chrome.tabs.executeScript(null, {
					code: 'console.log("bt pressed"); var profileJson ="'+profileJsonUrl+'";'
				}, function () {
					chrome.tabs.executeScript(null, { file: "ps1_e.js" });
				});

		});
	}
});