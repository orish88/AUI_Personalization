


IMPORTANT!! : See DeveloperNotes for the definition of object-value

Profile.json structure:
{
    ***Global profile info:***
    "global_settings": {

        //profile Name:
        "name": "prof7",
        
        //profile description:
        "AUI:desc": "Orish-in-page simple demo file",
        
        /*global symbol insertion type- oprions:
             "tooltip" - symbols are inserted as a tooltip 
             "before" - symbols are inserted before element
             "after" -  symbols are inserted after element
             "replace" -  symbols replace current element content */   
        "symbol_insertion_type": "before",

        
        /*Global class to be added for all symbols(to determine size. class should be declared on the added css file!) */
        "global_added_image_css_class": "aui_header_images",
        
        //global height and width for symbols
        "global_added_image_height":"100px",
        "global_added_image_width":"100px",

        /*boolean to determine if you wish to use you own global settings for the tooltip
        true- use the settings specified on  "global_tooltip_settings" */
        false- use the default settings (determined in the code)
        "global_tooltip_settings_mode":"true",

        /* global css class attribute-value pairs to determine how the tooltip looks like */
        "global_tooltip_settings": {
                "background": "black",
                "font-size": "14px",
                "font-weight": "regular",
                "position": "absolute",
                "overflow": "visible",
                "padding": "17px 17px 0px",
                "color": "#fff",
                "-webkit-border-radius": "7px",
                "-moz-border-radius": "7px",
                "border-radius": "7px",
                "-webkit-background-clip": "padding-box",
                "-moz-background-clip": "padding",
                "background-clip": "padding-box",
                "margin-bottom": "20%",
                "text-align": "center",
                "text-decoration": "none",
                "box-shadow": "0 0 3px #000",
                "z-index": "99999999"
        }
    },


    ***CSS:***

    "css":{
        //If you have a css file you want to apply on the page:
        "cssFileLink": "https://...css_file_link_here.css",
        "linkIndex": the number of link in the webstie where the css is declared,usally "0",
        //If you want to add further css changes, outside the file:
        "cssSettings":[
            //additional css settings array with objects of the following format:
            {
                "propertyName":"some css property",
                "value": "some property value"
            }
            ...
        ]
    }

    ***Simplification:***
    
    //if you wish to control the importance 
    //of elements showing on the page, use this field:

    //add Simplification Level:
    "simplification": "lvl"
    // lvl can be:
    //      1. "critical" - only unmarked (no simplification field) and critical elements will show.
    //      2. "high"- only critical and high elements will show.
    //      3. "medium"- only critical high and medium elements will show.
    //      4. "low" - everything will show

    ***TagNames:***
    //If you wish to make the same changes to all elements of a certain tagname
    // in a page, use:

    "tagNames":{

        //tagname object value is of the following format (you may have multiple objects)
        "your_tagname":{ //new object value:
            "name": "your_tagname" //it's essential this value and the key will be the same.
            //rest see ***object value example***
        }

    }

    ***Attributes***
    
    // DOM elements may have certain attributes which you'd wish to change them according to
    // the attribute and it's value. i.e if a DOM elements has "aui-destination" = "home",
    // you might want your profile to have a object value ready to apply changes on that element.
    //You can decalre this object values under the "attributes" global key, in the following format:

    "attributes":{
        "attribute-name1"{

            //a place to put data that is global to this attribute name, regardless of the value.
            "global_settings":{
                "name": "attribute-name1"
                ...
            }

            //object values for possible values:
 
            "value1":    //(example- "home")
            {
                "name":"value1",
                //rest see ***object value example***
            },

            "value2":
            {
                "name":"value2",
                //rest see ***object value example***
            }
            ...more object values with values as keys

        },
        "attribute-name2":{...}
    }

    ***Scopes***
    //There are some special cases of multiple attribute dependency. 
    // You may wish to have a object value for certain attribute attr1 = "val1" while 
    // any val received in "attr2" = "val2" IN ANY ELEMENT UNDER THE attr1 scope,
    //will have its own object value.

    //So far the script supports the cases of "itemprop" under "itemtype" and "name" 
    // under "autocomplete" 
    //the object values will be decalred under global kry "scopes", in the folllowing format:

    "scopes":{
        "itemtypes": {
            "itemtype_value1": //usually of the format "http://schema.org/something"
            "itemprops":{

                "item_prop_value1":{ object value },
                "item_prop_value2":{ object value },
                ...
            },
            more itemtype values here...
        }
        "autocomplete":{
            "on" {
                "names":{
                    "name value1":{ object value},
                    ...
                }

            }
        }
    }



}


*** object value example ***
{
   "name": change_object_name("compose", in this example),
    "type": [
        //an array of tagnames that an element changed by this object will have
        // to fit in order for the changes to take place.
        //example1:
        "a","p" //this object value will only apply in elemts of tagname a or p.
        //example2
        "not a" //this object value will aplly in all elements except elements of tagname a.
                    
    ],
    "inherits": {
        "attributeName": "AUI-destination",
        "attributeValue": "home"
    },
    "shortcut": "SHIFT + C",
    "longdesc": "some element description",
    "tooltip": "this text will show when user hovers on the element",
    "text": "replace current text with this (empty = current text stays)",
    //add an image to the element
    "Symbol": {
        //add image to your element
        "url": "http://cdn4.iconfinder.com/data/icons/miu/22/common_new_edit_compose_-128.png",
        "replacetext": "true", //put true if you wish the image will show alone with no added text(yours or original), false otherwise.

        //supply info of image creator
        "creator": {
            "name": "",
            "url": ""
        }
        //image size settings:
        "width": "",
        "height": "",
        "margin": "",
        "padding": ""
    },
    "css":[
        //additional css settings array with objects of the following format:
        {
            "propertyName":"some css property",
            "value": "some property value"
        },
        ...
    ]
}


