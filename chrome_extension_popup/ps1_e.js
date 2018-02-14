

console.log("ps1_e called 4");

var gCtr  =0;
/**
 * profile json is define in script execution on run_popup.js*/



if ( isDefined(profileJson) ) {
	getPersonalization(profileJson);
}


//test changes(1)
// download JSON skin in url, and personalise page based on the settings in it  
function getPersonalization(url) {
	if(!isDefined(url)){
		return;
	}
	consoleLog("ps1_e called: ");
	//load json skin (profile) and run it
	makeCorsRequest(url);
}
// Make the actual CORS request.
function makeCorsRequest(url) {

	var xhr = createCORSRequest('GET', url);
	if (!xhr) {
		alert('CORS not supported');
		return;
	}
	// Response handlers.
	xhr.onload = function () {
		var text = xhr.responseText;
		//parse JSON
		var jsonSkin = JSON.parse(text);
		//make global variable
		window.profile = jsonSkin;
		//run settings
		personalizePage(jsonSkin);
	};
	xhr.onerror = function () {
		consoleLog("looks like the browser doesn't support CORS. Alternatives include using a proxy or JSONP.");
	};
	xhr.send();
}

// Create the XHR object.
function createCORSRequest(method, url) {
	var xhr = new XMLHttpRequest();
	if ("withCredentials" in xhr) {
		// XHR for Chrome/Firefox/Opera/Safari.
		xhr.open(method, url, true);
	} else if (typeof XDomainRequest != "undefined") {
		// XDomainRequest for IE.
		xhr = new XDomainRequest();
		xhr.open(method, url);
	} else {
		// CORS not supported.
		xhr = null;
	}
	return xhr;
}

/**
 * personalise page based on the settings in the JSON object recieved
 */
function personalizePage(profile) {

	//read the popup changes from the profile and apply them
	editPopup(profile);
	consoleLog("personalize page called for profile: " + profile.name);

	//add classes that are relevant to tooltip changes
	addTooltipCssClasses();
	if ( isDefined(profile.css)) {

	//read the global css changes from the profile and apply them
		personalizeCSS(profile.css);
	}
	if ( isDefined(profile.tagNames)) {
	//read the tagname(like 'a' or 'p' or 'img') changes from the profile and apply them to relevant elements
		personalizeTagnames(profile.tagNames);
	}
	if ( isDefined(profile.attributes)) {
		//read the attributes (like aui-destination = "home" ) from the profile and apply them to relevant elements
		personalizeAttributes(profile.attributes);
	}
	if ( isDefined(profile.scopes) && isDefined(profile.scopes.itemtypes) ) {
		//read the scope changes from the profile and apply them to relevant elements (itemtype/prop).
		//Scopes mean nested changes, relevant attribute inside some other attribute's scope
		//todo: make generic
		personalizeItemScopes(profile.scopes.itemtypes);
	}
	if ( isDefined(profile.scopes) && isDefined(profile.scopes.autocomplete) ) {
		//read the scope changes from the profile and apply them to relevant elements (like autocomplete).
		//Scopes mean nested changes, relevant attribute inside some other attribute's scope
		personalizeAutocomplete(profile.scopes.autocomplete);
	}
	if( isDefined(profile.simplification)){
		consoleLog("simplification level: "+simplificationLevel);
		var simplificationLevel = profile.simplification;
		//read the simplification level from the profile and hide relevant elements
		personalizeSimplification(simplificationLevel); 
	}
	if(isDefined(profile["aui-distraction"])){
		consoleLog("aui-distraction: "+profile["aui-distraction"]);
		//check for elemts that are considered as distractions by the profile and treat them accordingly
		personalizeDistraction();
	}
}

/**
 * read the popup changes from the profile and apply them
 * @param {*} profile 
 */
function editPopup(profile){
	consoleLog("athena icon: edit popup called"  ) ;
	var athenaIcon = profile["athena-icon"];
	if(!isDefined(athenaIcon)){
		return;
	}
	consoleLog("athena icon is defined: "+athenaIcon) ;
	$("[athena-icon]").each(function(index){
		$( "#"+$(this).attr("id")+" img").remove();
		var iconSettings = athenaIcon[$(this).attr("athena-icon")];
		consoleLog("athena icon = "+$(this).attr("athena-icon") +" url in profile is:: "+iconSettings.Symbol.url ) ;
		applySettingsOnElement($(this),iconSettings);		
	});
}
/**
 * read the simplification level from the profile and hide elements with lower simplification.
 * @param {*} simplificationLevel 
 */
function personalizeSimplification(simplificationLevel) {
	consoleLog("simplification level: "+simplificationLevel);
	var simplificationValue = simplicficationFromStringToInt(simplificationLevel);
	var simplificationElements = document.querySelectorAll('[AUI-simplification]');
	simplificationElements.forEach(element=>{
		if(simplicficationFromStringToInt( element.getAttribute("AUI-simplification") ) > simplificationValue ){
			consoleLog("element "+element+ " hidden: ");
			element.hidden = true;
			$(element).attr("aria-hidden","true");
		}
	});
}
/**
 * convert simplification level from string to int
 * @param {*} simplificationString 
 */
function simplicficationFromStringToInt(simplificationString){
	var simplificationValue = 1;
	switch (simplificationString) {
		case "critical":
			simplificationValue = 1;
			break;
		case "high":
			simplificationValue = 2;
			break;
		case "medium":
			simplificationValue = 3;
			break;
		case "low":
			simplificationValue = 4;
			break;	
	}
	return simplificationString;
}

/**
 * check for elements with autcomplete and inside their scope checj for elements with relevant 'name' values and apply changes.
 * todo: make generic(for scope changes)
 * @param {*} autocomplete 
 */
function personalizeAutocomplete(autocomplete) {
	consoleLog("personalize Autocomplete called");
	var elementsWithItemtype = document.querySelectorAll('[autocomplete = "on" ]');
	var elementsWithItemtypeList = [...elementsWithItemtype]; //convert nodelist to array
	elementsWithItemtypeList.forEach(element => {
			personalizeNamesInsideAutocomplete(element);
	});
}
function personalizeNamesInsideAutocomplete(elementWithAutoComplete) {

	consoleLog("personalize autocomplete for " + elementWithAutoComplete + " called");

	var elementsWithName = elementWithAutoComplete.querySelectorAll('input[name]:not([autocomplete="off"])');
	var elementsWithNameList = [...elementsWithName];
	consoleLog("elements with name list size: " + elementsWithNameList.length);
	elementsWithNameList.forEach(element => {
		consoleLog("personalize autocomplete name element - in loop before call: element: " + element + " ");
		personalizeAutoCompleteNameElement(element);
	});

}

function personalizeAutoCompleteNameElement(elementWithName){
	var nameVal = elementWithName.getAttribute("name");
	consoleLog("personalize autocomplete element. nameVal: " +nameVal +" called");
	//todo: take the itemtype value and apply its settings to the ekement its declared on) 
	var changeAttrVal = window.profile.scopes.autocomplete["on"].names[nameVal];

	if (isDefined(changeAttrVal)) {
		consoleLog("auticomplete name- changeAttrVal.inherits: "+changeAttrVal.inherits);
		applySettingsOnElement(elementWithName, changeAttrVal);
	}
}

//same as autocomplete, scoped changes
function personalizeItemScopes(itemtypes) {
	consoleLog("personalize itemScopes called");

	var elementsWithItemtype = document.querySelectorAll('[itemtype]');
	var elementsWithItemtypeList = [...elementsWithItemtype]; //convert nodelist to array
	elementsWithItemtypeList.forEach(element => {
		personalizeItempropsInsideType(element);
	});
}

function personalizeItempropsInsideType(elementWithItemtype) {

	var typeVal = elementWithItemtype.getAttribute("itemtype");
	consoleLog("personalize itemprop inside type( "+typeVal+") " +elementWithItemtype+" called");
	if (isDefined(typeVal)) {
		var elementsWithItemprop = elementWithItemtype.querySelectorAll('[itemprop]');
		var elementsWithItempropList = [...elementsWithItemprop];
		consoleLog("elements with item propr list size: "+elementsWithItempropList.length);
		elementsWithItempropList.forEach(element => {
			consoleLog("personalize itemprop element - in loop before call:  val: ("+typeVal+") element: " +element+" ");
			personalizeItempropElement(element, typeVal);
		});
	}
}

function personalizeItempropElement(element, typeVal) {
	var propVal = element.getAttribute("itemprop");
	consoleLog("personalize itemprop element. typeval: "+typeVal+",proprVal "+propVal +" called");
	//todo: take the itemtype value and apply its settings to the ekement its declared on) 
	var changeAttrVal = window.profile.scopes.itemtypes[typeVal].itemprops[propVal];
	if (isDefined(changeAttrVal)) {
		consoleLog("itemprop- changeAttrVal.inherits: "+changeAttrVal.inherits);
		applySettingsOnElement(element, changeAttrVal);
	}
}
/**
 * iterate over this attribute in the profile, and check for elements that has it and also
 * @param {*} tagnames 
 */
function personalizeTagnames(tagnames) {
	consoleLog("personalize tagnames called: " + tagnames);
	var tagnameList = Object.keys(tagnames);
	tagnameList.forEach(tagname => {
		consoleLog("tagname key: " + tagname);
		personalizeTagname(tagnames[tagname]);
	});
}

function personalizeTagname(tagname) {
	consoleLog("personalize tagname called on: " + tagname.name);
	if (isDefined(tagname.name)) {
		var elementsWithTagname = document.getElementsByTagName(tagname.name);
		var elementsWithTagnameList = Array.prototype.slice.call(elementsWithTagname);
		elementsWithTagnameList.forEach(element => {
			applySettingsOnElement(element, tagname);
		});
	}
}
/**
 * apply page css settings
 * @param {*} cssSettings 
 */
function personalizeCSS(cssSettings) {

	//personalize css:
	var cssFile = cssSettings.cssFileLink;
	consoleLog("css settings css file: " + cssFile);

	if (isDefined(cssFile)) {
		var linkIndex = cssSettings.linkIndex;
		addCSSFile(cssFile, parseInt(linkIndex));
		consoleLog("add new css called: " +cssFile);
	}
	var cssBodySettings = profile.css.cssSettings;
	if (isDefined(cssBodySettings)) {
		consoleLog("set body css called on " + cssBodySettings);
		setCSS(document.body, cssBodySettings);
	}

}


//change css file
function addCSSFile(cssFile, cssLinkIndex) {

	var newlink = document.createElement("LINK");
	// var oldlink = document.getElementsByTagName("link").item(cssLinkIndex);
	// var newlink = document.createElement("link");36
	newlink.setAttribute("rel", "stylesheet");
	newlink.setAttribute("type", "text/css");
	newlink.setAttribute("href", cssFile);
	// document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
	document.getElementsByTagName("head")[0].appendChild(newlink);
}



/**
 * iterate over the attributes in the profile and change the relevant elements in the DOM 
 * according to the value and settings.
 * @param {*} attributes 
 */
function personalizeAttributes(attributes) {
	if (isDefined(attributes)) {
		var attrList = Object.keys(attributes);
		attrList.forEach(attributeName => {
			personalizeAttribute(attributes[attributeName]);
		});
	}
}
/**
 * change settings for all element in the DOM that have certain attribute
 * @param {*} attribute 
 */
function personalizeAttribute(attribute) {
	if ( !isDefined(attribute.global_settings)|| !isDefined(attribute.global_settings.name) ) {
		return;
	}
	consoleLog("new version personalizeAttribute called on: " + attribute.global_settings.name);

	var attributeName = attribute.global_settings.name;
	//iterate over all elements with field 'attribute.name' in the DOM
	var elementsWithAttr = document.querySelectorAll('[' + attributeName + ']');
	elementsWithAttr.forEach(element => {
		var attrValName = element.getAttribute(attributeName);
		consoleLog("attr: " + attributeName + "= attrValName: " + attrValName);
		var attrVal = attribute[attrValName];
		personalizeAttributeValue(element, attrVal);

	});
}

function personalizeAttributeValue(element, attrVal) {
	if (!isDefined(attrVal)) {
		consoleLog("illegal attribute value " + attrVal + " in " + element);
		return;
	}
	applySettingsOnElement(element, attrVal);
}
/**
 * apply settings(inside attrVal) on elements- includes inheritance!
 * @param {*} element 
 * @param {*} attrVal 
 */
function applySettingsOnElement(element, attrVal) {

	/*check if element is of relevant type (from profile)  */
	if(isDefined(attrVal.type)){
		var isType = false;
		var elementType = element.tagName.toUpperCase();


/**
 * document the json
 */

		//check if relevant type:
		for(var i=0; i < attrVal.type.length; i++){
			var type = attrVal.type[i];
			if(type.startsWith("not")){
				if(type.length < 5 ){
					continue;
				}
				type = type.substring(4);
				if(type.toUpperCase() === elementType){
					consoleLog("in for: change revoked due to type missmatch:\neleType: "+elementType+"\ntype: "+type+"\nval: "+attrVal.name);
					return;
				}
			}else
			if(type.toUpperCase() === elementType){
				isType = true;
				break;
			}	
		}
		if(!isType){
			consoleLog("change revoked due to type missmatch:\neleType: "+elementType+"\ntype: "+type+"\nval: "+attrVal.name);
			return;
		}

	}
	/*check if attribute value inherits from a different value in the profile  */
	if (isDefined(attrVal.inherits)) {
		consoleLog("inherits called on element: "+element+" with attr val: "+attrVal.name);
		var attributeName = attrVal.inherits.attributeName;
		var attributeValue = attrVal.inherits.attributeValue;
		consoleLog("inherits: attrname: "+attributeName+" attrVal: "+attributeValue );
		var inheritedAttrVal = window.profile.attributes[attributeName][attributeValue];
		applySettingsOnElement(element, inheritedAttrVal);

	} else {

		var settings = attrVal;
		consoleLog("apply settings: " + settings + " on: " + element);
		
		//apply field changes: 
		//todo: changee name to : attribute values
		applyAttributeValuesChanges(element,settings);

		//apply css changes:
		if (isDefined(settings.css)) {
			var styleSettings = settings.css;
			setCSS(element, styleSettings);
		}
		//change text and symbol:
		insertImage(element,settings);

		// add/change shortcut (accesskey)
		if (isDefined(settings.shortcut)) {
			element.accessKey = settings.shortcut;
		}
	}
}

/**
 * get img from the settings if exists and insert it to the element, 
 * insertion way determined by profile(symbol_insertion_type)
 * @param {*} element 
 * @param {*} settings 
 */

function insertImage(element, settings) {
	if (isDefined(settings.Symbol) && isDefined(settings.Symbol.url)) {

		// var mHeight = $(element).height();
		// var mWidth = $(element).width();

		consoleLog("inside insert image");
		var newImg = document.createElement('img');
		newImg.setAttribute("src", settings.Symbol.url);
		addBorderToImg(newImg);
		if (isDefined(settings.Symbol.css_class)) {
			consoleLog("inside css_class: "+settings.name);
			newImg.setAttribute("class", settings.Symbol.css_class);
		} else if (isDefined(settings.Symbol.height) && isDefined(settings.Symbol.width)) {
			consoleLog("inside h/w: "+settings.name);
			$(newImg).css({ height: settings.Symbol.height, width: settings.Symbol.width });
		} else {
			consoleLog("inside auto size: "+settings.name+"-element height: "+ $(element).height());
			$(newImg).css({ height: $(element).height()*2, width: 'auto' });
		}
		if (!isDefined(settings.Symbol.symbol_insertion_type)) {
			consoleLog("inside undefined symbol_insertion_type: "+settings.name+" id:"+$(element).attr("id"));
			//TODO: what should be the default?
			var label = $('[for="'+$(element).attr("id")+'"]');	
			/**
			 * check the "for" attr for the id of the element to add in image to.
			 */

			if(isDefined(label[0])){
				$(newImg).prependTo(label[0])
			}else{
				$(element).prepend("&nbsp;");
				$(newImg).prependTo(element);
			}
		} else {
			if (settings.Symbol.symbol_insertion_type === "replace") {
				consoleLog("inside symbol_insertion_type === replace: " + settings.name);
				$(element).html('');
				$(newImg).appendTo(element);
			} else if (settings.Symbol.symbol_insertion_type === "tooltip") {
				consoleLog("image tooltip called for: " + settings.name);
				altAddToolTip(element, newImg, settings);
			} else if (settings.Symbol.symbol_insertion_type === "before") {
				consoleLog("inside symbol_insertion_type === before: " + settings.name);
				if (isDefined(settings.text)) {
					$(element).html(settings.text);
				}
				var label = $('[for="' + $(element).attr("id") + '"]');
				if (isDefined(label[0])) {
					consoleLog("with label: " + settings.name);
					// $("  ").prependTo(label[0])
					$(newImg).prependTo(label[0])
				} else {
					// $("  ").prependTo(element);
					$(newImg).insertBefore(element);
				}
			}
		}
		consoleLog(settings.name + " settings:\ninner: " + element.innerHTML + "\nimage sizes are: h:" + $(newImg).height() + " w:" + $(newImg).width());
	}
}
function addBorderToImg(img){
	$(img).css({"background-color":"white","border":"#000000 3px outset"/*,"padding":"10%"*/});
}

/**
 * create tooltip with newImg and add to element
 * @param {*} element 
 * @param {*} newImg 
 * @param {*} settings 
 */
function altAddToolTip(element, newImg,settings) {

	var ctrStr = "" + gCtr++;
	var divId = 'div' + ctrStr;
	var spanId = 'span' + ctrStr;
	var divStr = '<div id="' + divId + '" </div>';
	$(element).wrap(divStr);
	var div = document.getElementById(divId);
	$(div).addClass("aui_tooltip_parent");
	var span = document.createElement("span");
	$(span).appendTo(div);
	$(span).attr("id",spanId);
	$(element).attr("aria-describedby",spanId);  //accessibility
	$(newImg).appendTo(span);
	$(span).attr("role", "tooltip"); //accessibility
	$(span).addClass("aui_tooltip");
	var oldElem = element;
	element = div;
	$(element).attr("tabindex","0");	
	/*add text to the span */
	if(isDefined(settings.tooltip)){
		var p = document.createElement("p");
		$(p).html(settings.tooltip);
		$(p).appendTo(span);
	}

	$(document).ready(function () {
		consoleLog("on ready hide image called: " + spanId);
		hideImg(span);
	});
	$(element).mouseover(function () {
		consoleLog("mouseover called");
		showImg(span);
	});
	$(element).mouseleave(function () {
		consoleLog("mouseleave called");
		if (!($(element).is(":focus"))) {
			hideImg(span);
		}
	});

	$(element).focus(function () {
		consoleLog("focus called");
		showImg(span);
	});
	$(element).blur(function () {
		consoleLog("focusout called");
			hideImg(span);
	});

	$(document.body).keydown(function (ev) {

		if (isKeys(ev,settings.shortcut)) {
			$(element).focus();
			ev.preventDefault();
			return false;
		}

		if (ev.which == 27) {
			hideImg(span);
			ev.preventDefault();
			return false;
		}
	});

	//todo: decide how to add with tooltip_settings

	// element.appendChild(span);

}

function hideImg(img){
	$(img).attr("aria-hidden", "true");
	$(img).addClass("hidden"); //accessibility old browser
}
function showImg(img){
	$(img).attr("aria-hidden", "false");
	$(img).removeClass("hidden");
}
/**
 * 
 set elements' CSS according to the settings in the JSON object recieved
 */
function setCSS(element, settings) {
	if (!isDefined(settings)) {
		return;
	}
	settings.forEach(settingPair => {
		if (isDefined(settingPair.propertyName)) {

			var propertyName = settingPair.propertyName;
			if (isDefined(settingPair.value)) {
				var value = settingPair.value;
				$(element).css(propertyName,value);
				// element.style[propertyName] = value;
			
				// $(element).css(propertyName, value);
			}
		}
	});
}

/**
 * add classes 
 * 
 * todo: make it generic and extendable, read fro mthe profile/different file
 */
function addTooltipCssClasses(){
	createCssClass('.aui_tooltip',
	// 'margin:auto;'+
	// 'text-align:center;'+
	'background:black; '+
	'font-size:14px;'+
	'font-weight:regular;'+
	'position:absolute;'+
	// 'top:40px;'+
	// 'right:20%;'+
	// 'left:100%;'+
	'overflow:visible;'+
	'padding:17px 17px 0px;'+
	'color:#fff;'+
	'-webkit-border-radius:7px;'+
	'-moz-border-radius:7px;'+
	'border-radius:7px;'+
	'-webkit-background-clip:padding-box;'+
	'-moz-background-clip:padding;'+
	'background-clip:padding-box;'+
	'margin-bottom: 20%;'+
	'text-align:center;'+
	'text-decoration:none;'+
	'box-shadow:0 0 3px #000;'+
	'z-index:99999999;'+
	// 'vertical-align:middle;'+
	// 'justify-content:center;'+
	// 'flex-direction: column;'+
	// 'margin-top:auto;margin-bottom:auto;'
	'align-items:center;'
	);
	createCssClass('.aui_tooltip_parent',
	"position:relative;");
	createCssClass('[aria-hidden="true"]', 'display: none;');
	createCssClass('[aria-hidden="false"]', 'display: block;');
	createCssClass('a:focus, a:active', 'text-decoration: underline;');
	// createCssClass('aui_tooltip_child',);
	// createCssClass('aui_tooltip_span',
	// 'vertical-align:center;'
	// 'display: flex;'+
	// 'align-items: center;'+
	// 'justify-content:center;'
	// );
	
}
function createCssClass(className,propertiesStr){
	var style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = className+' { '+propertiesStr+' }';
	document.getElementsByTagName('head')[0].appendChild(style);
	// document.getElementById('someElementId').className = ;
}



function isKeys(event,keys){
	consoleLog("is keys called: "+event.which+" : "+keys);
	if(!isDefined(keys)){
		return false;
	}
	if(keys.indexOf("+") > -1){
		var arr = keys.split("+").map(function(item) {
			return item.trim();
		});
		if(checkModifier(arr[0],event) && event.which == arr[1].charCodeAt(0)){
			return true;
		}
		return false;
	}else{
		/*todo: FIX TO FIT MODIFIER KEYS like ctrl shift alt */
		return event.which == keys.charCodeAt(0);
	}
}

function isDefined(variable) {
	if (variable != null && variable != undefined && variable != "")
		return true;
	return false;

}

function checkModifier(modifierStr,event){

	if(modifierStr === "Shift" && event.shiftKey){
		return true;
	}
	if(modifierStr === "Ctrl" && event.ctrlKey){
		return true;
	}
	if(modifierStr === "Alt" && event.altKey){
		return true;
	}
	return false;
}

function positionSpan(span,element){

	// var addToTop = -1.5*element.height;
	// var addToLeft = -500;
	var bodyRect = document.body.getBoundingClientRect();
    var elemRect = element.getBoundingClientRect();
	var top_offset = elemRect.top - bodyRect.top;
	var left_offset = elemRect.left - bodyRect.left;
	consoleLog('Element is ' + top_offset + ' vertical pixels from <body>');
	consoleLog('Element is ' + left_offset + ' horizontal pixels from <body>');
	consoleLog("bodyRect: top: "+bodyRect.top+" left: "+bodyRect.left);
	consoleLog("elemRect: top: "+elemRect.top+" left: "+elemRect.left);

	span.style.top = elemRect.top;
	span.style.left = elemRect.left;
	var p = $(span).position();
	consoleLog("span left: "+p.left+" top: "+p.top);

	// span.style.top = top_offset + addToTop;
	// span.style.left = left_offset +addToLeft;
}

function personalizeDistraction() {

	/*animations, auto-starting, moving, ad, message, chat , overlay, popup
Auto-changing (logs) third-party, offer ( includes suggestions). */

	var distStr = window.profile["aui-distraction"];
	consoleLog("personalize distraction called. distStr: "+distStr);
	if (!isDefined(distStr)) {
		return;
	}
	if (distStr === "all") {
		$("[aui-distraction]").each(function (index) {
			consoleLog("distraction element: "+$(this).html());
			$(this).attr("aria-hidden", "true");
		});
		return;
	}
	var distractionsArray = distStr.split(",").map(function (item) {
		return item.trim();
	});

	distractionsArray.forEach(distractionType => {
		$("[aui-distraction='" + distractionType + "']").each(function (index) {
			$(this).attr("aria-hidden", "true");
		});
	});
}


function consoleLog(text){
	console.log(text);
}

/**
 * add field&value pairs (from the profile) to the element
 * @param {*} element 
 * @param {*} settings 
 */
function applyAttributeValuesChanges(element,settings){
	if(isDefined(settings["attribute_values_changes"])){
		console.log("apply attribute value changes called on: "+settings.name);
		var attributeValuesChanges = settings["attribute_values_changes"];
		var attributeValuesChangesKeyList = Object.keys(attributeValuesChanges);
		attributeValuesChangesKeyList.forEach(attrName=>{
			$(element).attr(attrName,attributeValuesChanges[attrName]);
		});
	}
}
