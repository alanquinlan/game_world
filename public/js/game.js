//var configGame = function() {

	var outputLog = document.getElementById('outputLog');


	// Default World Object
	var world = {
		cols: 10,
		rows: 10,
		block: 50,
		scale: 0,
		canvas: new fabric.Canvas('c', { selection: false }),
		classes: ["evo","food","wall"], // Types of classes in the world
		world_objects: [], // Array of all objects in the world
		init: function() {// Initialize the world grid

			this.world_objects = [];

			// Setup the scale divisor
			this.scale = this.block*this.rows;

			// Setup the canvas
			this.canvas.selection = false;
			this.canvas.setDimensions({
				width: this.cols*this.block,
				height: this.rows*this.block
			});

			// Setup the canvas grid
			for (var i = 0; i < (this.canvas.width /this.block); i++) {
				this.canvas.add(new fabric.Line([ i * this.block, 0, i * this.block, this.canvas.width], { stroke: '#ccc', selectable: false }));
				this.canvas.add(new fabric.Line([ 0, i * this.block, this.canvas.width, i * this.block], { stroke: '#ccc', selectable: false }));
			}

		},
		getWorldId: function(id) {// Include the grid objects
			return id+this.rows+this.cols;
		},
		addObject: function(new_object) {// Adds a new object to the world


			// Give the new object it's fabric body with a random location
			var new_body = new fabric.Rect({
				name: new_object.id,
				left:  Math.round(Math.floor(Math.random() * this.scale) / this.block) * this.block, 
				top: Math.round(Math.floor(Math.random() * this.scale) / this.block) * this.block, 
				width: new_object.width, 
				height: new_object.height, 
				fill: '#000000',
				selectable: false
			});


			// Set the cell the object is in
			new_object.cell = new_body.getLeft()/world.block + '-' + new_body.getTop()/world.block;

			// Config the new object based on it's class and dna
			switch(new_object.class) {
				case "evo":
					//new_body.set('fill', "#faa");
					new_body.set('fill', '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6));
					break;
				case "food":
					new_body.set('fill', "#74AACC");
					break;
				case "wall":
					break;
			}

			new_object.color = new_body.fill;

			// Set the init dna for the object
			new_object.init = window[new_object.class + '_dna'];


			// Give the new object it's unique world id
			if (this.world_objects.length > 0) {
				new_object.id = this.world_objects.length;
			}

			// Log the new object in the world
			this.world_objects.push(new_object);

			// Plase the new object's fabric body in the world
			this.canvas.add(new_body);

			// Initate the new objects life
			this.world_objects[new_object.id].init(this.world_objects[new_object.id]);

		},
		removeObject: function(id) {

			//var world_id = this.getWorldId(id);

			//this.canvas.remove( this.canvas.item(world_id) );

		},
		checkMove: function(id, direction) {

			var world_id = this.getWorldId(id);
			var coord = 0;

			// Setup the initial return
			var returnResult = {
				cell:"",
				top: this.canvas.item(world_id).getTop(),
				left: this.canvas.item(world_id).getLeft(),
				occupied: false,
				occupied_by: {}
			}

			// Calc the move
			switch(direction) {
				case "up":
					coord = this.canvas.item(world_id).getTop() - this.block;
					if (coord >= 0) {
						returnResult.top = coord;
					}
					break;
				case "down":
					coord = this.canvas.item(world_id).getTop() + this.block;
					if (coord < this.rows*this.cols) {
						returnResult.top = coord;
					}
					break;
				case "left":
					coord = this.canvas.item(world_id).getLeft() - this.block;
					if (coord >= 0) {
						returnResult.left = coord;
					}
					break;
				case "right":
					coord = this.canvas.item(world_id).getLeft() + this.block;
					if (coord < this.rows*this.cols) {
						returnResult.left = coord;
					}
					break;
			}

			returnResult.cell = returnResult.left/world.block + '-' + returnResult.top/world.block;



			// Check if occupied



			return returnResult;
		},
		doMove: function(id,coords) {

			var world_id = this.getWorldId(id);

			this.world_objects[id].cell = coords.cell;

			this.canvas.item(world_id).set("top", coords.top);
			this.canvas.item(world_id).set("left", coords.left);

			// Render the world changes
			this.canvas.renderAll();		

		}

	};


	






	// Initiate the world on page load to give the grid
	world.init();












	// Default World Object
	var world_object = {
		id: 0,
		name: "",
		age:0,
		life: 0,
		class: "",
		width: world.block,
		height: world.block,
		cell:0,
		color:"#000000",
		init: function() {

			// life behavior

		},
		end: function() {

			// death behavior
			writelog(this.name + ' Died!', this);

			world.removeObject(this.id);

		}
	};







	// Define the dna of the evo class
	evo_dna = function(evo) {

		writelog(evo.name + " Lives!", evo);

		// Define evo's movement capabilties
		var directions = ["up","down","left","right"];

		//evo.life = Math.floor(Math.random() * 10);
		evo.life = 10;

		(function myLoop (i) {
			setTimeout(function () {

				evo.life--;

				if (evo.life == 0) {

					evo.end();

				} else {

					var trymove = world.checkMove( evo.id, directions[Math.floor(Math.random() * 4)] );  

					world.doMove( evo.id, trymove );

					myLoop(); // Move again

				}
				
			}, 500)
		})();		

	};


	food_dna = function(food) {

		writelog(food.name + " Lives!", food);

		food.life = 9;

	};



	wall_dna = function(wall) {

		writelog(wall.name + " Lives!", wall);

		wall.life = 50;


	};





	function writelog(content, object) {
		if (typeof(object) == 'undefined') {
			outputLog.innerHTML = outputLog.innerHTML + content + "<br>";
		} else {
			outputLog.innerHTML = outputLog.innerHTML + '<span class="logblock" style="background-color:'+object.color+'"></span>' + content + "<br>";
		}
	}

	function clearlog(content) {
		outputLog.innerHTML = '';
	}





	function start_world() {

		world.canvas.clear();
		clearlog();
		world.init();


		// Create the first evo object
		var evo1 = Object.create(world_object);
		evo1.name = "evo1";
		evo1.class = "evo";
		world.addObject( evo1 );

		// Create the second evo object
		var evo2 = Object.create(world_object);
		evo2.name = "evo2";
		evo2.class = "evo";
		world.addObject( evo2 );

		// Create the first food object
		var food1 = Object.create(world_object);
		food1.name = "food1";
		food1.class = "food";
		world.addObject( food1 );

		// Create the second food object
		var food2 = Object.create(world_object);
		food2.name = "food2";
		food2.class = "food";
		world.addObject( food2 );


		// Create the first wall object
		var wall1 = Object.create(world_object);
		wall1.name = "wall1";
		wall1.class = "wall";
		world.addObject( wall1 );
	}

	document.getElementById("startBtn").onclick = function() {
		start_world();
	};


//}();