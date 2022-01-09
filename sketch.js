//expanding on 
//Daniel Shiffman
//https://www.youtube.com/watch?v=HyK_Q5rrcr4
//2D maze generation tutorial

//extending the idea ideas:
//construct an extended dimensional situation with 
//maze planes in front of/behind other maze planes 
//that are all connected like the corresponding x,y cells 
//are connected from plane to plane so
//top, right, bottom, left, in, out
//all or stored in the same 1D grid array
//just do the math to get to the desired maze room
//the size of 1 maze plane would be cols * rows
//the size of the entire 3D maze would be cols * rows * innieouties

//logic to draw the various rooms when the time is right
//modified the search algorithm to do 3D
//of course can go 4D, 5D, etc but how to visually represent...

//for 3D how to signify that there is an in or out passage available
//use specific colors to mark cells as having the ability to go in/out to other rooms (mazes)
//I suppose you could implement the ability to rotate the perspective of the maze 90 degrees inward or outward
//the maze would need to be redrawn 2D based on the perspective of the current x coordinate
//so that x coordinate would be the plane that you would display when rotated 90 degrees
//taking into consideration all of the paths/walls from this new perspective
//figure out the math for the rotations...

//trying file io stuff, but running this in the browser, so don't think file io is accessible...
//const fs = require('fs'); //file io library, get error in browser prob becuase it's the browser

//global variables
var cols, rows;
//var w = 40; //width of cell
var w = 80; //width of cell
var grid = []; //all of the cells in the entire 3D maze, size is cols * rows * innieouties
var current; //current cell that the algorithm is currently at
var stack = []; //used for backtracking when a dead end is encountered
var innieouties = 4; //the 3rd dimension
var current_maze_plane = 0; 
var num_cells_in_a_maze_plane; //cols * rows
var the_sequence = []; //just saving the sequence for reference as the maze is constructed
var finished_building_mazes = false; //to trigger doing other stuff after maze is constructed
var sleep_time = 2000; //time in milliseconds to wait to show next maze plane after maze is constructed

function setup() {
	//createCanvas(windowWidth, windowHeight);
	createCanvas(800, 800);
	//I guess that width and height are already known as keywords for the canvas sizes
	cols = floor(width / w); 
	rows = floor(height / w);
	num_cells_in_a_maze_plane = cols * rows;
	frameRate(80); //control speed (frames per second)

	//keep all of the cells, even for different maze planes, 
	//in the same 1D grid array and do the math
	//the math:
	//size of 1 maze plane is cols * rows
	//the size of the entire 3D maze is cols * rows * innieouties
	for(let k = 0; k < innieouties; k++){
		for(let j = 0; j < rows; j++){
			for(let i = 0; i < cols; i++){
				let cell = new Cell(i, j, k);
				grid.push(cell);
			}
		}
	}
	/*
	//2D version
	for(var j = 0; j < rows; j++){
		for(var i = 0; i < cols; i++){
			var cell = new Cell(i, j);
			grid.push(cell);
		}
	}
	*/
	//specify start cell COULD BE ANY CELL
	current = grid[0];
	current_maze_plane = 0;
}

function draw() {
	if(!finished_building_mazes){
		the_sequence.push(current); //just saving the sequence of cells visited
		background(51);
		//show the current maze plane
		for(let i = (current_maze_plane * num_cells_in_a_maze_plane); i < ((current_maze_plane + 1) * num_cells_in_a_maze_plane); i++){
			grid[i].show();
		}

		current.visited = true; //mark cell as visited
		current.highlight(160, 160, 160); //highlight current cell, arg is rgb
		//current.highlight(255, 128, 0); //highlight current cell, arg is rgb

		print_stack();

		//returns a random neighbor if valid (defined) and not visited
		let next = current.checkNeighbors(); 

		//if next is not undefined
		if(next){
			next.visited = true;
			stack.push(current); //push current to the stack before advancing to next cell
			removeWalls(current, next);
			current = next;
			current_maze_plane = current.k; //k is the 3rd dimension which maze plane the cell is in
			console.log("current_maze_plane: " + current_maze_plane);
		}
		//reaches here if no available neighboring cells to explore that haven't been visited yet
		else if(stack.length > 0){ //check that stack is not empty
			console.log("pop it");
			current = stack.pop();
			//console.log(current);
		}
		else{
			//so if no next AND stack is empty, then must have returned to the very beginning and every cell has been visited
			//control reaches here and stops (well it doesn't stop execution, but there's no where else to go, so it doesn't move any more)
			console.log("the sequence:");
			print_cell_seq_no_newline(the_sequence);

			//go to else statement and draw each maze in succession
			finished_building_mazes = true;
			current_maze_plane = 0;
			//noLoop(); //stops the draw() loop
		}

	}
	else{
		//draw each maze plane
		if(current_maze_plane < innieouties){
			background(51);
			for(let i = (current_maze_plane * num_cells_in_a_maze_plane); i < ((current_maze_plane + 1) * num_cells_in_a_maze_plane); i++){
				grid[i].show();
			}

			sleep(sleep_time); //wait before showing next maze plane
			console.log("current_maze_plane: " + current_maze_plane);
			current_maze_plane++;
		}
		else{
			console.log("done");
			noLoop();
			console.log("something after noLoop()");
			print_maze_as_graph_input();

			//SAVE GRAPH (well output it to console to copy/paste to file)
			//just need cols, rows, innieouties
			//then all of the walls array for each cell of grid array
			//can know the cell index by its index in the grid array and can do the math to convert to i, j, k values
			//so guess you really just need (to be able to read back in later to create same maze)
			//cols
			//rows
			//innieouties
			//true falses prob comma separated 1s and 0s FOR EACH CELL on a new line
			print_maze_as_dims_then_all_cells_walls();

		}
	}

}

function sleep(milliseconds) {
	const date = Date.now();
	let currentDate = null;
	do {
	  currentDate = Date.now();
	} while (currentDate - date < milliseconds);
}

function print_stack(){
	console.log("stack size: " + stack.length);
	/*
	for(let a = 0; a < stack.length; a++){
		console.log(stack[a].i + ", " + stack[a].j);
	}
	*/
}

function print_cell_seq_no_newline(arr){
	let sequence_str = "";
	for(let a = 0; a < arr.length; a++){
		sequence_str = sequence_str + "(" + arr[a].i + ", " + arr[a].j + ", " + arr[a].k + "), "; 
	}

	console.log(sequence_str);
}

//can take the output from print_maze_as_graph_input and use as input file for 
//gcc graph_main.c graph_matrix_messing_6.c twoD_arrays.c
//./a.exe < the_input.txt
//and will output 
//all possible paths through the maze, 
//the path that BFS takes through the maze,  
//the path that DFS takes through the maze,
//a topological sort of the maze
//can convert the cell #s to 3D coordinates to be able to visually follow and walk through the maze easier since grid just stores all of the cells in a 1D array
//with f/School/CSE_3315_Theoretical_CS/code/Messing/misc_functions.cpp string convert_num_to_howev_many_dims_of_whatev_sizes(int num_to_convert, vector <int> dim_sizes)
function print_maze_as_graph_input(){
	//maze representation is an undirected graph 
	//because every wall removal removes the corresponding wall from the adjacent cell and so could go back and forth
	//since undirected, and starting from smaller index cell to larger index cell,
	//don't need to check top, left, out because they would have already been taken care by evaluating a previous cell
	//so just check bottom, right, inn
	let entire_graph_str = "0\n" + cols * rows * innieouties + " 1\n0\n";
	for(let a = 0; a < cols * rows * innieouties; a++){
		let i = grid[a].i;
		let j = grid[a].j;
		let k = grid[a].k;
		let bottom = grid[index(i, j + 1, k)];
		let right = grid[index(i + 1, j, k)];
		let inn = grid[index(i, j, k + 1)];

		if(bottom && !grid[a].walls[2]){
			let edge_str = a + " " + index(bottom.i, bottom.j, bottom.k);
			entire_graph_str = entire_graph_str + "1\n";
			entire_graph_str = entire_graph_str + edge_str + "\n";
		}
		if(right && !grid[a].walls[1]){
			let edge_str = a + " " + index(right.i, right.j, right.k);
			entire_graph_str = entire_graph_str + "1\n";
			entire_graph_str = entire_graph_str + edge_str + "\n";
		}
		if(inn && !grid[a].walls[5]){
			let edge_str = a + " " + index(inn.i, inn.j, inn.k);
			entire_graph_str = entire_graph_str + "1\n";
			entire_graph_str = entire_graph_str + edge_str + "\n";
		}

	}
	entire_graph_str = entire_graph_str + "6\n5\n";
	console.log(entire_graph_str);
}

//cols
//rows
//innieouties
//true falses comma separated 1s and 0s FOR EACH CELL on a new line
function print_maze_as_dims_then_all_cells_walls(){
	let all_of_the_cells_walls = cols + "\n" + rows + "\n" + innieouties + "\n";
	for(let i = 0; i < grid.length; i++){
		let walls_output_str = "";
		for(let j = 0; j < grid[i].walls.length; j++){
			if(j == grid[i].walls.length - 1){
				if(grid[i].walls[j]){
					walls_output_str = walls_output_str + "1";
				}
				else{
					walls_output_str = walls_output_str + "0";
				}

			}
			else{
				if(grid[i].walls[j]){
					walls_output_str = walls_output_str + "1,";
				}
				else{
					walls_output_str = walls_output_str + "0,";
				}
			}
		}
		all_of_the_cells_walls = all_of_the_cells_walls + walls_output_str + "\n";
	}	
	
	console.log(all_of_the_cells_walls);


	//get error in browser prob becuase it's the browser
	//fs.writeFile('Output.txt', data, (err) => {
//
	//	// In case of a error throw err.
	//	if (err) throw err;
	//});

}

function index(i, j, k){
	//just printing
	//console.log("i: " + i + " j: " + j + " k: " + k);
	//check for out of bounds and return -1 if so to signify not valid
	if(i < 0 || j < 0 || i > cols - 1 || j > rows - 1 || k < 0 || k > innieouties - 1){
		return -1;
	}
	return i + (j * cols) + (k * num_cells_in_a_maze_plane);
	//return i + (j * cols); //2D version
}

function Cell(i, j, k){
	this.i = i;
	this.j = j;
	this.k = k;
	//top, right, bottom, left, out, inn
	this.walls = [true, true, true, true, true, true];
	this.visited = false;

	this.checkNeighbors = function(){
		//neighbors are located at:
		//top: (i, j-1, k)
		//right: (i+1, j, k)
		//bottom: (i, j+1, k)
		//left: (i-1, j, k)
		//out: (i, j, k - 1)
		//in: (i, j, k + 1)
		let neighbors = [];
		//since returning -1 if out of bounds from index function
		//if any of the indexes below are -1 for grid
		//the value of whichever variable will be undefined and then can check for it
		let top = grid[index(i, j - 1, k)];
		let right = grid[index(i + 1, j, k)];
		let bottom = grid[index(i, j + 1, k)];
		let left = grid[index(i - 1, j, k)];
		let out = grid[index(i, j, k - 1)];
		let inn = grid[index(i, j, k + 1)];


		//checking if variable is not undefined (out of bounds) and not visited, 
		//then push as a possible option for the next cell to visit
		if(top && !top.visited){
			neighbors.push(top);
		}
		if(right && !right.visited){
			neighbors.push(right);
		}
		if(bottom && !bottom.visited){
			neighbors.push(bottom);
		}
		if(left && !left.visited){
			neighbors.push(left);
		}
		if(out && !out.visited){
			neighbors.push(out);
		}
		if(inn && !inn.visited){
			neighbors.push(inn);
		}

		//just printing
		//console.log("neighbors length: " + neighbors.length);
		//for(var t = 0; t < neighbors.length; t++){
		//	console.log(neighbors[t]);
		//}

		if(neighbors.length > 0){
			//chooses random available neighboring cells
			//perhaps interesting patterns could be found by modifying this to not be random
			//but some other complicated, but non random sequence 
			let r = floor(random(0, neighbors.length));
			return neighbors[r];
		}
		else{
			return undefined;
		}
	}

	this.highlight = function(red, green, blue){
		//drawing 2D maze plane, just need to know that, not drawing a z (k) value so don't need to know about that here
		let x = this.i * w;
		let y = this.j * w;
		noStroke();
		fill(red, green, blue);
		//fill(red, green, blue, 100);
		//fill(0, 0, 255, 100);
		rect(x, y, w, w);
	}

	this.show = function(){
		//x left/right y up/down
		let x = this.i * w;
		let y = this.j * w;
		//stroke(255);
		stroke(0);
		strokeWeight(7);
		//fill(255);
		if(this.walls[0]){
			line(x, y, x + w, y); //top wall
		}
		if(this.walls[1]){
			line(x + w, y, x + w, y + w); //right wall
		}
		if(this.walls[2]){
			line(x, y + w, x + w, y + w); //bottom wall
		}
		if(this.walls[3]){
			line(x, y, x, y + w); //left wall
		}
		//change color out or inn if there is no wall to signify no wall with color instead of line
		if(!this.walls[4] && this.walls[5]){ 
			//color the cell differently than others in the maze plane to signify ability to go OUT to adjacent maze plane
			this.highlight(0, 255, 0); //out color
			//fill(0, 255, 255);
		}
		else if(!this.walls[5] && this.walls[4]){ 
			//color the cell differently than others in the maze plane to signify ability to go IN to adjacent maze plane
			this.highlight(153, 51, 255); //inn color
			//fill(255, 0, 255);
		}
		//3rd distinct color for if both out and inn
		else if(!this.walls[4] && !this.walls[5]){
			//color the cell differently than others in the maze plane to signify ability to go IN/OUT to adjacent maze plane
			this.highlight(255, 128, 0); //out and inn color
		}

		//color visited cells, shows the paths not out/in just left right up down
		if(this.visited && this.walls[4] && this.walls[5]){
			noStroke();
			//fill(255, 0, 255, 100); //he calls alpha the last argument to fill...
			fill('magenta'); 
			rect(x, y, w, w);	
		}
	}
}

function removeWalls(a, b){
	let x = a.i - b.i; //x is difference between the 2 cells left/right values
	if(x === 1){
		a.walls[3] = false; //remove left wall from cell a
		b.walls[1] = false; //remove right wall from cell b
	}
	else if(x === -1){
		a.walls[1] = false; //remove right wall from cell a
		b.walls[3] = false; //remove left wall from cell b
	}
	
	let y = a.j - b.j; //y is difference between the 2 cells up/down values
	if(y === 1){
		a.walls[0] = false; //remove top wall from cell a
		b.walls[2] = false; //remove bottom wall from cell b
	}
	else if(y === -1){
		a.walls[2] = false; //remove bottom wall from cell a
		b.walls[0] = false; //remove top wall from cell b
	}
	
	let z = a.k - b.k; //z is difference between the 2 cells out/inn values
	if(z === 1){
		a.walls[4] = false; //remove out wall from cell a
		b.walls[5] = false; //remove inn wall from cell b
	}
	else if(z === -1){
		a.walls[5] = false; //remove inn wall from cell a
		b.walls[4] = false; //remove out wall from cell b
	}
}
