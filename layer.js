dojo.provide("DemoImageResize.layer");

//register module path for this Demo
dojo.registerModulePath("DemoImageResize","../../DemoImageResize"); 

/* put all of the dojo.requires for your demo here */
dojo.require("DemoImageResize.init");

dojo.require("dojo.Stateful");
dojo.require("dijit.form.NumberTextBox");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");

var image_init = {
        "initialWidth"    : 1024, 
        "initialHeight"   : 768,    
        "isPreserveRatio" : true
      };

var image;

function imageModel(args){
 	function _bindValue(targetProp, source_prop, converterFn){
		return image.watch(source_prop, function(prop, oldValue, newValue){
			var convertedValue = converterFn(newValue);
			if(convertedValue != image.get(targetProp)){
				image.set(targetProp, convertedValue);
			}
		});
	};

	function _absolute2RelativeWidth(newValue){			
		var rel = newValue * 100.0 / image.get("initialWidth");
		return rel;
	};
  
	function _absolute2RelativeHeight(newValue){			
		var rel = newValue * 100.0 / image.get("initialHeight");
		return rel;
	};
	
	function _relative2AbsoluteWidth(newValue){			
		var abs = newValue * image.get("initialWidth") / 100;
		return abs;
	};
	
	function _relative2AbsoluteHeight(newValue){			
		var abs = newValue * image.get("initialHeight") / 100;
		return abs;
	};
	
	function _copyProperty(newValue){			
		return newValue;
	};
		
  	var props = {
  			"initialWidth"    : 2100,  // default value
            "initialHeight"   : 1500,  // default value  

            "absoluteWidth"   : 0,
            "absoluteHeight"  : 0,

            "isPreserveRatio" : true,

            "relativeWidth"   : 0,
            "relativeHeight"  : 0
    };
  	  	  	    
	var image = new dojo.Stateful();
	
	image.set(props); 	// set up properties and default values...
	image.set(args);	// override with input args

	image.set("absoluteWidth", image.get("initialWidth"));
	image.set("absoluteHeight", image.get("initialHeight"));
	image.set("relativeWidth", 100);
	image.set("relativeHeight", 100);

	// relative Width = f(abs Width)
	_bindValue("relativeWidth", "absoluteWidth", _absolute2RelativeWidth);

	// relative Height = f(abs Height)
	_bindValue("relativeHeight", "absoluteHeight", _absolute2RelativeHeight);

	// abs Width = f(relative Width)
	_bindValue("absoluteWidth", "relativeWidth", _relative2AbsoluteWidth);

	// abs Height = f(relative Height)
	_bindValue("absoluteHeight", "relativeHeight", _relative2AbsoluteHeight);

	image.watch("isPreserveRatio", function (prop, oldValue, newValue){
		if(!newValue){
			image.watchRelativeHeight.unwatch();
			image.watchRelativeWidth.unwatch();
		}else{
			image.watchRelativeHeight = _bindValue("relativeWidth", "relativeHeight", _copyProperty);
			image.watchRelativeWidth = _bindValue("relativeHeight", "relativeWidth", _copyProperty);
		}
	});

	// if preserveRatio then relative Width = relative Height and vice versa
	if(image.get("isPreserveRatio")){
		image.watchRelativeHeight = _bindValue("relativeWidth", "relativeHeight", _copyProperty);
		image.watchRelativeWidth = _bindValue("relativeHeight", "relativeWidth", _copyProperty);
	};
	return image;
};

function bindModel2TextField(modelItem, modelProp, controlId){
	var control = dijit.byId(controlId);
	if(!modelItem || !control){return;};
		
	modelItem.watch(modelProp, function( prop, oldValue, newValue){
		control.set("value", newValue);  
	});
	
	control.watch("value", function( prop, oldValue, newValue){
		if(newValue != undefined){
			modelItem.set(modelProp, newValue);  
		}
	});
	
	// set up initial control value...
	control.attr("value", modelItem.get(modelProp));
};

function bindModel2Button(modelItem, modelProp, controlId){
	var control = dijit.byId(controlId);
	if(!modelItem || !control){return;};
		
	modelItem.watch(modelProp, function(prop, oldValue, newValue){
		if(newValue != control.checked){
			control.attr("value", newValue);  
		}
	});
	
	dojo.connect(control, "onClick", function(e){
	modelItem.set("isPreserveRatio", !modelItem.get("isPreserveRatio"));  
	});
	
	// set up initial control value...
	control.set("value", modelItem.get(modelProp));
};

function dataBind(){
	image_init.initialHeight = document.theImage.height;
	image_init.initialWidth = document.theImage.width;
	image = imageModel(image_init);

	bindModel2TextField(image, "initialHeight",  "initialHeight");
	bindModel2TextField(image, "initialWidth",   "initialWidth");
	bindModel2TextField(image, "absoluteHeight", "absoluteHeight");
	bindModel2TextField(image, "absoluteWidth",  "absoluteWidth");
	bindModel2TextField(image, "relativeHeight", "relativeHeight");
	bindModel2TextField(image, "relativeWidth",  "relativeWidth");

	bindModel2Button(image, "isPreserveRatio", "preserveRatio");

	
	image.watch("absoluteHeight", function (prop, oldValue, newValue){
		document.theImage.height = newValue;
	});
	image.watch("absoluteWidth", function (prop, oldValue, newValue){
		document.theImage.width = newValue;
	});
};
