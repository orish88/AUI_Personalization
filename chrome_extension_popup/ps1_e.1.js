
// getPersonalization('https://rawgit.com/orish88/AUI_Personalization/master/profiles/profile1.json');

console.log("ps1_e called 2");

var gCtr  =0;
getPersonalization(profileJson);

//test changes(1)
// download JSON skin in url, and personalise page based on the settings in it  
function getPersonalization(url) {
	console.log("ps1_e called 3");
	// alert("get personalization called");
	// var script = 'document.body.style.backgroundColor="Yellow";';
	// chrome.tabs.executeScript({
	// 	code: script
	//   });
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
		console.log("looks like the browser doesn't support CORS. Alternatives include using a proxy or JSONP.");
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

//personalise page based on the settings in the JSON object recieved
function personalizePage(profile) {

	// alert("personalizee page called");

	console.log("personalize page called for profile: " + profile.name);
	addTooltipCssClasses();
	if ( isDefined(profile.css)) {
		personalizeCSS(profile.css);
	}
	if ( isDefined(profile.tagNames)) {
		personalizeTagnames(profile.tagNames);
	}
	if ( isDefined(profile.attributes)) {
		personalizeAttributes(profile.attributes);
	}

	if ( isDefined(profile.scopes) && isDefined(profile.scopes.itemtypes) ) {
		personalizeItemScopes(profile.scopes.itemtypes);
	}
	if ( isDefined(profile.scopes) && isDefined(profile.scopes.autocomplete) ) {
		personalizeAutocomplete(profile.scopes.autocomplete);
	}
	if( isDefined(profile.simplification)){
		console.log("simplification level: "+simplificationLevel);
		var simplificationLevel = profile.simplification;
		personalizeSimplification(simplificationLevel); 
	}
	if(isDefined(profile["aui-distraction"])){
		console.log("aui-distraction: "+profile["aui-distraction"]);
		personalizeDistraction();
	}
}

function personalizeSimplification(simplificationLevel) {
	console.log("simplification level: "+simplificationLevel);
	var simplificationValue = simplicficationFromStringToInt(simplificationLevel);
	var simplificationElements = document.querySelectorAll('[AUI-simplification]');
	simplificationElements.forEach(element=>{
		if(simplicficationFromStringToInt( element.getAttribute("AUI-simplification") ) > simplificationValue ){
			console.log("element "+element+ " hidden: ");
			element.hidden = true;
			$(element).attr("aria-hidden","true");
		}
	});
}
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

function personalizeAutocomplete(autocomplete) {
	console.log("personalize Autocomplete called");
	var elementsWithItemtype = document.querySelectorAll('[autocomplete = "on" ]');
	var elementsWithItemtypeList = [...elementsWithItemtype]; //convert nodelist to array
	elementsWithItemtypeList.forEach(element => {
			personalizeNamesInsideAutocomplete(element);
	});
}
function personalizeNamesInsideAutocomplete(elementWithAutoComplete) {

	console.log("personalize autocomplete for " + elementWithAutoComplete + " called");

	var elementsWithName = elementWithAutoComplete.querySelectorAll('input[name]:not([autocomplete="off"])');
	var elementsWithNameList = [...elementsWithName];
	console.log("elements with name list size: " + elementsWithNameList.length);
	elementsWithNameList.forEach(element => {
		console.log("personalize autocomplete name element - in loop before call: element: " + element + " ");
		personalizeAutoCompleteNameElement(element);
	});

}

function personalizeAutoCompleteNameElement(elementWithName){
	var nameVal = elementWithName.getAttribute("name");
	console.log("personalize autocomplete element. nameVal: " +nameVal +" called");
	//todo: take the itemtype value and apply its settings to the ekement its declared on) 
	var changeAttrVal = window.profile.scopes.autocomplete["on"].names[nameVal];

	if (isDefined(changeAttrVal)) {
		console.log("auticomplete name- changeAttrVal.inherits: "+changeAttrVal.inherits);
		applySettingsOnElement(elementWithName, changeAttrVal);
	}
}

//itemtypes
function personalizeItemScopes(itemtypes) {
	console.log("personalize itemScopes called");

	var elementsWithItemtype = document.querySelectorAll('[itemtype]');
	var elementsWithItemtypeList = [...elementsWithItemtype]; //convert nodelist to array
	elementsWithItemtypeList.forEach(element => {
		personalizeItempropsInsideType(element);
	});
}

function personalizeItempropsInsideType(elementWithItemtype) {

	var typeVal = elementWithItemtype.getAttribute("itemtype");
	console.log("personalize itemprop inside type( "+typeVal+") " +elementWithItemtype+" called");
	if (isDefined(typeVal)) {
		var elementsWithItemprop = elementWithItemtype.querySelectorAll('[itemprop]');
		var elementsWithItempropList = [...elementsWithItemprop];
		console.log("elements with item propr list size: "+elementsWithItempropList.length);
		elementsWithItempropList.forEach(element => {
			console.log("personalize itemprop element - in loop before call:  val: ("+typeVal+") element: " +element+" ");
			personalizeItempropElement(element, typeVal);
		});
	}
}

function personalizeItempropElement(element, typeVal) {
	var propVal = element.getAttribute("itemprop");
	console.log("personalize itemprop element. typeval: "+typeVal+",proprVal "+propVal +" called");
	//todo: take the itemtype value and apply its settings to the ekement its declared on) 
	var changeAttrVal = window.profile.scopes.itemtypes[typeVal].itemprops[propVal];
	if (isDefined(changeAttrVal)) {
		console.log("itemprop- changeAttrVal.inherits: "+changeAttrVal.inherits);
		applySettingsOnElement(element, changeAttrVal);
	}
}

function personalizeTagnames(tagnames) {
	console.log("personalize tagnames called: " + tagnames);
	var tagnameList = Object.keys(tagnames);
	tagnameList.forEach(tagname => {
		console.log("tagname key: " + tagname);
		personalizeTagname(tagnames[tagname]);
	});
}

function personalizeTagname(tagname) {
	console.log("personalize tagname called on: " + tagname.name);
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
	console.log("css settings css file: " + cssFile);

	if (isDefined(cssFile)) {
		var linkIndex = cssSettings.linkIndex;
		addCSSFile(cssFile, parseInt(linkIndex));
		console.log("add new css called: " +cssFile);
	}
	var cssBodySettings = profile.css.cssSettings;
	if (isDefined(cssBodySettings)) {
		console.log("set body css called on " + cssBodySettings);
		setCSS(document.body, cssBodySettings);
	}
	// setCSS("hidden",[
	// 	{
	// 		"propertyName": "display",
	// 		"value": "none"
	// 	}
	// ]);

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
	console.log("new version personalizeAttribute called on: " + attribute.global_settings.name);

	var attributeName = attribute.global_settings.name;
	//iterate over all elements with field 'attribute.name' in the DOM
	var elementsWithAttr = document.querySelectorAll('[' + attributeName + ']');
	elementsWithAttr.forEach(element => {
		var attrValName = element.getAttribute(attributeName);
		console.log("attr: " + attributeName + "= attrValName: " + attrValName);
		var attrVal = attribute[attrValName];
		personalizeAttributeValue(element, attrVal);

	});
}

function personalizeAttributeValue(element, attrVal) {
	if (!isDefined(attrVal)) {
		console.log("illegal attribute value " + attrVal + " in " + element);
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
	if(isDefined(attrVal.type)){
		var isType = false;
		var elementType = element.tagName.toUpperCase();


		//check if relevant type:
		for(var i=0; i < attrVal.type.length; i++){
			var type = attrVal.type[i];
			if(type.startsWith("not")){
				if(type.length < 5 ){
					continue;
				}
				type = type.substring(4);
				if(type.toUpperCase() === elementType){
					console.log("in for: change revoked due to type missmatch:\neleType: "+elementType+"\ntype: "+type+"\nval: "+attrVal.name);
					return;
				}
			}else
			if(type.toUpperCase() === elementType){
				isType = true;
				break;
			}	
		}
		if(!isType){
			console.log("change revoked due to type missmatch:\neleType: "+elementType+"\ntype: "+type+"\nval: "+attrVal.name);
			return;
		}

	}
	if (isDefined(attrVal.inherits)) {
		console.log("inherits called on element: "+element+" with attr val: "+attrVal.name);
		var attributeName = attrVal.inherits.attributeName;
		var attributeValue = attrVal.inherits.attributeValue;
		console.log("inherits: attrname: "+attributeName+" attrVal: "+attributeValue );
		var inheritedAttrVal = window.profile.attributes[attributeName][attributeValue];
		applySettingsOnElement(element, inheritedAttrVal);

	} else {

		var settings = attrVal;
		console.log("apply settings: " + settings + " on: " + element);
		//apply css changes:

		if (isDefined(settings.css)) {
			var styleSettings = settings.css;
			setCSS(element, styleSettings);
		}
		//change text and symbol:
		insertImage(element,settings);

		// if (isDefined(settings.tooltip)) {
		// 	element.title = settings.tooltip;
		// }
		// add/change shortcut (accesskey)
		if (isDefined(settings.shortcut)) {
			element.accessKey = settings.shortcut;
		}
	}
}


function scaleImage(element, img, name, scaleType, inner) {
	console.log("scale image called on: " + img);

	//TODO: check inner and finish this for ALL SCENARIOS
	//inner can be:
	// "" if no text
	// elelment.innerHtml 
	// settings.text
	
	if (scaleType === "none") {
		console.log("inside scaletype none: "+name);

		var sizeCoefficient = 1;		
		switch(inner){
			case "":
			element.innerHTML = "";				
			break;
			case element.innerHTML:
				sizeCoefficient = 2;
				break;
			default:
				console.log("problem: default reached on scaleType none");
				return;
		}
		
		// $(img).on('load', function () {
			var css;

			console.log("name: " + name + "\nh: " + $(img).height() + "\nw: " + $(img).width() + "\neh: " + $(element).height() + "\new: " + $(element).width());
			var mHeight = $(element).height();
			var mWidth = sizeCoefficient*$(element).width();
			css = { width: mWidth, height: mHeight };
			$(img).css(css);
			if( sizeCoefficient > 1 ){
				$(element).width( sizeCoefficient * $(element).width() );
			}		
		// });
	}
	// else if(scaleType === "cssClass") {
	// 	$(img).appendTo(element);
	// }else{ //fixed dims
	// 	$(img).appendTo(element);
	// }
}

function insertImage(element, settings) {
	if (isDefined(settings.Symbol) && isDefined(settings.Symbol.url)) {

		// if (isDefined(settings.text)) {
		// 	$(element).html(settings.text);
		// }
		var mHeight = $(element).height();
		var mWidth = $(element).width();

		console.log("inside insert image");
		var newImg = document.createElement('img');
		newImg.setAttribute("src", settings.Symbol.url);
		// if (isDefined(settings.tooltip)) {
		// 	newImg.title = settings.tooltip;
		// }
		if (isDefined(settings.Symbol.css_class)) {
			newImg.setAttribute("class", settings.Symbol.css_class);
		} else if (isDefined(settings.Symbol.height) && isDefined(settings.Symbol.height)) {
			$(newImg).css({ height: settings.Symbol.height, width: settings.Symbol.width });
		} else {
			$(newImg).css({ height: $(element).height(), width: 'auto' });
			// $(newImg).css( { height:'200%' , width:'200%' });			
		}
		if (!isDefined(settings.Symbol.replacetext)) {
			//TODO: what should be the default?
			$(newImg).appendTo(element);
		} else {
			if ( settings.Symbol.replacetext === "replace") {
				$(element).html('');
				$(newImg).appendTo(element);
			} else if (  settings.Symbol.replacetext === "tooltip" ){
				console.log("image tooltip called for: "+settings.name);
				altAddToolTip(element,newImg,settings);
			}else if(  settings.Symbol.replacetext === "before" ){
				if (isDefined(settings.text)) {
					$(element).html(settings.text);
				}
				$(newImg).insertBefore(element);
			}
		}
		console.log(settings.name + " settings:\ninner: " + element.innerHTML + "\nimage sizes are: h:" + $(newImg).height() + " w:" + $(newImg).width());
	}
}
// function addToolTip(element, imgOuterHtml) {
// 	element.setAttribute('title', imgOuterHtml);
// 	$(element).tooltip({
// 		"animated": "fade",
// 		"placement": "top",
// 		"html": true
// 	});

// 	// if(isDefined(window.profile.global_settings.tooltip_settings))
// 	// $(element).tooltip(window.profile.global_settings.tooltip_settings);
// }

function altAddToolTip(element, newImg,settings) {

	var ctrStr = "" + gCtr++;
	var divId = 'div' + ctrStr;
	var spanId = 'span' + ctrStr;
	var divStr = '<div id="' + divId + '" </div>';
	// element.insertBefore(span,null);
	// $(span).insertBefore(element);

	$(element).wrap(divStr);
	var div = document.getElementById(divId);

	$(div).addClass("tooltip_parent");

	var span = document.createElement("span");
	// div.appendChild(span);
	$(span).appendTo(div);
	// span.setAttribute("id", spanId);
	$(span).attr("id",spanId);

	$(element).attr("aria-describedby",spanId);


	$(newImg).appendTo(span);
	// span.appendChild(newImg);
	$(span).attr("role", "tooltip");
	// $(span).append('<p>p text</p>');
	$(span).addClass("tooltip");


	$(element).mouseover(function () {
		console.log("mouseover span called");
		showImg(span);
		// $(newImg).show();
	});
	$(span).mouseleave(function () {
		console.log("mouseleave span called");
		if (!($(element).is(":focus"))) {
			hideImg(span);
		}
	});

	positionSpan(span,element);
	// var oldElem = element;
	// element = div;
	$(element).attr("tabindex","0");	
	/*add text to the span */
	if(isDefined(settings.tooltip)){
		var p = document.createElement("p");
		$(p).html(settings.tooltip);
		$(p).appendTo(span);
	}

	$(document).ready(function () {
		console.log("on ready hide image called: " + spanId);
		hideImg(span);
	});
	$(element).mouseover(function () {
		console.log("mouseover called");
		showImg(span);
		// $(newImg).show();
	});
	$(element).mouseleave(function () {
		console.log("mouseleave called");
		if (!($(element).is(":focus"))) {
			hideImg(span);
		}
	});

	$(element).focus(function () {
		console.log("focus called");
		showImg(span);
	});
	$(element).blur(function () {
		console.log("focusout called");
		// if ($(element + ':hover').length != 0) {
			hideImg(span);
		// }
	});

	$(document.body).keydown(function (ev) {

		if (isKeys(ev,settings.shortcut)) {
			// showImg(span);
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
	$(img).addClass("hidden");
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


function addTooltipCssClasses(){
	// createCssClass(".tooltip,.arrow:after",'  background:yellow; ');
	createCssClass('.tooltip',
	'background:black; '+
	'font-size:14px;'+
	'font-weight:regular;'+
	'position:absolute;'+
	// 'top:40px;'+
	// 'right:20%;'+
	// 'left:100%;'+
	'overflow:visible;'+
	'padding:10px 20px;'+
	'color:#fff;'+
	'-webkit-border-radius:7px;'+
	'-moz-border-radius:7px;'+
	'border-radius:7px;'+
	'-webkit-background-clip:padding-box;'+
	'-moz-background-clip:padding;'+
	'background-clip:padding-box;'+
	// 'margin-bottom: 20%;'+
	'text-align:center;'+
	'text-decoration:none;'+
	'box-shadow:0 0 3px #000;'+
	'z-index:99999999;');
	createCssClass('.tooltip_parent',
	"position:relative;");
	createCssClass('[aria-hidden="true"]', 'display: none');
	createCssClass('[aria-hidden="false"]', 'display: block');
	createCssClass('a:focus, a:active', 'text-decoration: underline;');
	
}
function createCssClass(className,propertiesStr){
	var style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = className+' { '+propertiesStr+' }';
	document.getElementsByTagName('head')[0].appendChild(style);
	// document.getElementById('someElementId').className = ;
}


// function defineKeyboardShortcut(elm, span, keys){
// 	console.log("define shortcut: "+span.id+": "+keys);
// 	$(elm).keydown(function (ev) {
// 		if (isKeys(ev,keys)) {
// 			showImg(span);
// 			ev.preventDefault();
// 			return false;
// 		}
// 	});

// }
function isKeys(event,keys){
	console.log("is keys called: "+event.which+" : "+keys);
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
		var offset = $(element).offset();
	
		// top_offset = element.offsetTop;
		// left_offset = element.offsetLeft;
		// span.style.top = "" +element.getBoundingClientRect().top + "px";
		// span.style.left = ""+element.getBoundingClientRect().left +"px";
		console.log("*****************************************************************",span.style.top,);
		console.log('Element is ' + top_offset + ' vertical pixels from <body>');
		console.log('Element is ' + left_offset + ' horizontal pixels from <body>');
		console.log("bodyRect: top: "+bodyRect.top+" left: "+bodyRect.left);
		console.log("elemRect: top: "+elemRect.top+" left: "+elemRect.left);
	
		span.style.top = elemRect.top;
		span.style.left = elemRect.left;
		// var p = $(span).position();
		console.log("span left: "+offset.left+" top: "+offset.top);
		console.log("span: ",span," element:",element);
	
	}
// function positionSpan(span,element){

// 	// var addToTop = -1.5*element.height;
// 	// var addToLeft = -500;
// 	var bodyRect = document.body.getBoundingClientRect();
//     var elemRect = element.getBoundingClientRect();
// 	var top_offset = elemRect.top - bodyRect.top;
// 	var left_offset = elemRect.left - bodyRect.left;
// 	var offset = $(element).offset();

// 	top_offset = element.offsetTop;
// 	left_offset = element.offsetLeft;
// 	span.style.top = "" +element.getBoundingClientRect().top + "px";
// 	span.style.left = ""+element.getBoundingClientRect().left +"px";
// 	console.log("*****************************************************************",span.style.top,);
// 	console.log('Element is ' + top_offset + ' vertical pixels from <body>');
// 	console.log('Element is ' + left_offset + ' horizontal pixels from <body>');
// 	console.log("bodyRect: top: "+bodyRect.top+" left: "+bodyRect.left);
// 	console.log("elemRect: top: "+elemRect.top+" left: "+elemRect.left);

// 	// span.style.top = elemRect.top;
// 	// span.style.left = elemRect.left;
// 	// var p = $(span).position();
// 	console.log("span left: "+offset.left+" top: "+offset.top);
// 	console.log("span: ",span," element:",element);

// }

function personalizeDistraction() {

	/*animations, auto-starting, moving, ad, message, chat , overlay, popup
Auto-changing (logs) third-party, offer ( includes suggestions). */

	var distStr = window.profile["aui-distraction"];
	console.log("personalize distraction called. distStr: "+distStr);
	if (!isDefined(distStr)) {
		return;
	}
	if (distStr === "all") {
		$("[aui-distraction]").each(function (index) {
			console.log("distraction element: "+$(this).html());
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
