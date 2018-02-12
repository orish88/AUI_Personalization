

/*Personalize the popup*/ 
var curProfileJson = "https://rawgit.com/orish88/AUI_Personalization/master/profiles/test_profile5.json";
getPersonalization(curProfileJson);

document.addEventListener('DOMContentLoaded', () => {

	var bt = document.getElementById("bt_personalize_page");
	bt.addEventListener('click', () => {
		curProfileJson = document.getElementById("input_enter_profile_url").value;
		reloadPage(curProfileJson);
	});

	document.getElementById("bt_personalize_page_test_profile1").addEventListener('click', () => {		
		curProfileJson = "https://rawgit.com/orish88/AUI_Personalization/master/profiles/test_profile5.json"; 
		reloadPage(curProfileJson);
	});

	document.getElementById("bt_personalize_page_test_profile2").addEventListener('click', () => {
		curProfileJson = "https://rawgit.com/orish88/AUI_Personalization/master/profiles/test_profile4.json"; 
		reloadPage(curProfileJson);
	});


	/*reload the page, then run personalization(currently just run personalization)*/
	function reloadPage(profleJsonUrl) {
		personalize(profleJsonUrl);
		// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		// 	chrome.tabs.update(tabs[0].id, {url: tabs[0].url},function(){
		// 		personalize(profleJsonUrl);
		// 	});
		// });
	}
/**
 * personalize the page
 */
	function personalize(profileJsonUrl) {
		// getPersonalization(profileJsonUrl);
		chrome.tabs.executeScript(null, { file: "jquery.js" }, function () {
			chrome.tabs.executeScript(null, {
				code: 'console.log("bt pressed"); var profileJson ="' + profileJsonUrl + '";'
			}, function () {
				chrome.tabs.executeScript(null, { file: "ps1_e.js" });
			});

		});
	}
});