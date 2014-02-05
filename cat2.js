;(function() {
	
	//you can declare global variables
	var curSensor = 0; 
	var curActuator = 0;
	var instance;  //global jsPlumb instance

	var $sensorForm;
	var sensorFormCreated = false; 
	var $actuatorForm; 
	var actuatorFormCreated = false; 


	//actuator Pins
	var actuatorPins = [
		{	
			id: 0, 
			name: "13",
			enabled: false
		},
		{
			id: 1,
			name: "12", 
			enabled: false
		},
		{	
			id: 2, 
			name: "~11",
			enabled: false
		},
		{
			id: 3,
			name: "~10", 
			enabled: false
		},
		{	
			id: 4, 
			name: "~9",
			enabled: false
		},
		{
			id: 5,
			name: "8", 
			enabled: false
		},
		{	
			id: 6, 
			name: "4",
			enabled: false
		},
		{
			id: 7,
			name: "~6", 
			enabled: false
		},
		{	
			id: 8, 
			name: "~5",
			enabled: false
		},
		{
			id: 9,
			name: "~3", 
			enabled: false
		},

	];

	//designated sensor pins
	var sensorPins = [
		{	
			id: 0, 
			name: "A0",
			enabled: false
		},
		{
			id: 1,
			name: "A1", 
			enabled: false
		},
		{	
			id: 2, 
			name: "A2",
			enabled: false
		},
		{
			id: 3,
			name: "A3", 
			enabled: false
		},
		{	
			id: 4, 
			name: "A4",
			enabled: false
		},
		{
			id: 5,
			name: "A5", 
			enabled: false
		},
		{	
			id: 6, 
			name: "A6",
			enabled: false
		},
		{
			id: 7,
			name: "~6", 
			enabled: false
		},
		{	
			id: 8, 
			name: "~5",
			enabled: false
		},
		{
			id: 9,
			name: "~3", 
			enabled: false
		}
	];


	//setting up JSPlumb 
	jsPlumb.ready(function() {			

		// list of anchor point
		// format x,y,dx,dy where dx and dy are the curve angles. (up to 9 points possible)
		var sourceAnchors = [
			[ 1, 0.25, 0.25, 0 ],
			[ 1, 0.5, 0, 0 ],
			[ 1, 0.75, .25, 0 ]			
		];

		var targetAnchors = [
			[ 0, 0.25, -0.25, 0 ],
			[ 0, 0.5, 0, 0 ],
			[ 0, 0.75, -.25, 0 ]			
		];
        
        
        instance = jsPlumb.getInstance({
        	// set default anchors.  the 'connect' calls below will pick these up, and in fact setting these means
        	// that you also do not need to supply anchor definitions to the makeSource or makeTarget functions. 
            Anchors : [ sourceAnchors, targetAnchors ],
        	// drag options
        	DragOptions : { cursor: "pointer", zIndex:2000 },
			// default to blue at source and green at target
			EndpointStyles : [{ fillStyle:"#bbb" }, { fillStyle:"#888" }],
			// blue endpoints 7 px; green endpoints 11.
			Endpoints : [ ["Dot", { radius:9 } ], [ "Dot", { radius:9 } ] ],
			// default to a gradient stroke from blue to green.  for IE provide all green fallback.
			PaintStyle : {
            	gradient:{ stops:[ [ 0, "#ddd" ], [ 1, "#555" ] ] },
            	strokeStyle:"#555",
            	lineWidth:10
        	},
        	Container:"source-target-demo"
        });

		// click listener for the enable/disable link.
        jsPlumb.CurrentLibrary.bind(document.getElementById("enableDisableSource"), "click", function(e) {
			var state = instance.toggleSourceEnabled("sourceWindow1");
			this.innerHTML = (state ? "disable" : "enable");
			e.stopPropagation();
			e.preventDefault();
		});

        // bind to a connection event, just for the purposes of pointing out that it can be done.
		instance.bind("connection", function(i,c) { 
			console.dir(i.connection); 
			//addSensor(); 
			//Seth - to add websocket code here
		});

        // get the list of ".actuatorWindow" elements.            
		var actuatorWindow = jsPlumb.getSelector(".actuatorWindow");
		// make them draggable
		//instance.draggable(actuatorWindow);

		//do the same thing for the sensor windows
		var sensorWindow = jsPlumb.getSelector(".sensorWindow")
		//instance.draggable(sensorWindow);

        // suspend drawing and initialise.
        instance.doWhileSuspended(function() {

	        // make 'window1' a connection source. notice the filter parameter: it tells jsPlumb to ignore drags
			// that started on the 'enable/disable' link on the blue window.
			instance.makeSource(sensorWindow, {
				//anchor:sourceAnchors,		// you could supply this if you want, but it was set in the defaults above.							
				filter:function(evt, el) {
					var t = evt.target || evt.srcElement;
					return t.tagName !== "A";
				},
				isSource:true
			});			
	        
			// configure the .actuator windows as targets.
			instance.makeTarget(actuatorWindow, {
				//anchor:"TopCenter",				// you could supply this if you want, but it was set in the defaults above.					
				dropOptions:{ hoverClass:"hover" },
                uniqueEndpoint:true
			});	

	        // and finally connect a couple of small windows, just so its obvious what's going on when this demo loads.           
	        //instance.connect({ source:"sourceWindow1", target:"targetWindow1" });
	        //instance.connect({ source:"sourceWindow2", target:"targetWindow2" });			
		});
		
		//Build out the UI 
		addButtons(); 
	});	
	
	//adds a sensor and actuator button to the frame
	var addButtons = function() {
		//add addSensor button
		var $butSensors = $("<div>", {id: "butSensors", class: "plusButton"});
		$butSensors.css({"top":"98%","left":"15%","position":"absolute"});
		$butSensors.append("+ sensor"); 
		$butSensors.click(function(){
		 		if(!sensorFormCreated) { 
		 			createSensorForm();
		 		} else {
		 			toggleSensorForm(); 
		 		}
			}); 
		$("#source-target-demo").append($butSensors);
		//add a hover to the button
		$butSensors.hover(function(){
  			$butSensors.css("background-color","#eee");
  			$butSensors.css("cursor","pointer");
 			 },function(){
  			$butSensors.css("background-color","#ccc");
		});
		//add actuator button
		var $butActuator = $("<div>", {id: "butActuator", class: "plusButton"});
		$butActuator.css({"top":"98%","left":"60%","position":"absolute"});
		$butActuator.append("+ actuator"); 
		$butActuator.click(function(){ addActuator(curActuator); }); 
		$("#source-target-demo").append($butActuator);
		//add a hover to the button
		$butActuator.hover(function(){
  			$butActuator.css("background-color","#eee");
  			$butActuator.css("cursor","pointer");
 			 },function(){
  			$butActuator.css("background-color","#ccc");
		});
	}

	//generates a form which we can show and hide from the data elements 
	var createSensorForm = function() {
		$sensorForm = $("<div>", {id: "sensorSelect", class: "popDiv"});
		$sensorForm.append("<b>SENSORS</b><br>(pin numbers)<br>"); 

		sensorPins.forEach(function(entry) {
    		$input = $("<input>", {type: "checkbox", name: entry.name, value:entry.id, checked: entry.enabled });
    		$sensorForm.append($input); 
    		$sensorForm.append(entry.name + "<br>");
		});
		$("#source-target-demo").append($sensorForm); 
		sensorFormCreated = true; 
	}

	var toggleSensorForm = function() {
		$sensorForm.toggle(500); 
	}

	var addActuator = function(pin) {
		console.log(actuatorPins[pin].name); 
		curActuator++; 
	}

	//adding a function that appends a new element to the DOM
	var addSensor = function(pin) {
		console.info("addSensor function was called...");
		
		//example using strait Javascript
		/*
		var element = document.createElement("div");
    	element.appendChild(document.createTextNode('D4'));
    	element.setAttribute('class','window actuatorWindow');
    	element.setAttribute('id','targetWindow4');
		element.setAttribute('style','top:20%; position:relative; left:40%; margin:20px;');
	   	document.getElementById('source-target-demo').appendChild(element); 
	   	*/

	   	//using JQuery (more versitle, less verbose, harder to read) - MAKES SURE ITS CROSS PLATFORM
	   	var curID = "digital" + curSensor; //unique ID for each element 
		var $div = $("<div>", {id: curID, class: "window actuatorWindow"}); //assign attributes to an element
		//$div.click(function(){ console.info("clicked the new div"); }); //add an event function
		$div.css({"top":"20%","position":"relative","left":"40%","margin":"20px"}); //modify css
		$div.append("<b>D"+ curSensor + "</b>"); curSensor++; 
		$("#source-target-demo").append($div);  //selecting a specific ID

		//adding jPlumb functionality to the new instance
		instance.makeTarget($div, {
			dropOptions:{ hoverClass:"hover" },
            uniqueEndpoint:true
		});
    	
	}




})();

//------------------------------SANDBOX-----------------------------------------------

/* //PLAYING  

	<select id="pins">
		<option name="13", value=13> xx </option>
		</select>

	$(option[name=myActuatorPinArray[0].name]).val()

	var whatIdIWantToFind = 13;
	var myFoundObject = _.find(myActuatorPinArray, function(obj){
		return obj.id == whatIdIWantToFind;
	});

	myFoundObject.enabled = true; 


 //playing with the structure of objects
		var MyObject = {
			"seth": "hello",
			dimitri: "hi"
		}
		console.log(MyObject.seth, MyObject.dimitri, MyObject["seth"], MyObject["dimitri"]);
		

		//$("#sourceWindow1").toggle();  //easily show and hide elements

    	//To do Monday: 
    	a) Create a function that will generate digital, function for analog
    	b) Create a form element with a list of elements that is on the page
    	c) Link the form click to the function
    	d) Modify the spacing of the elements based on when they are selected. 
    	e) Flex pins 2-6 on both sides of the list get grayed out on the list

    	//General TO DO
    	//a) add jplumb capabilities to the instance (use global)
		//b) figure out the touch compatability (see libs)
		//c) jquery syntax
		//d) websocket integration (article on AJAX)
		//e) add a button to trigger new instances
		//f) look at lists
		//g) look at bootstrap for moust over of each of the parts of the UI
		//h) Create a form element popup for selecting elements of the UI
*/
