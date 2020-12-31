import { Location, initializeLocations } from "./locations.js";
import { generateAllStatements } from "./DataGeneration/statement_generator.js";
import { generateCrimeData, createSuspectList, generateLocationObjects, allLocations } from "./DataGeneration/data_generator.js";
import { Renderer, assignSuspectGraphics, DialogueScene } from "./renderer";
import { displayMysteryDetails } from './prototype';

class Game{
	constructor(){
		this.renderer = new Renderer(900, 600, "suspect-details");
		this.renderer.initialize();

		this.dialogueScene = new DialogueScene(this.renderer.screen);
	};

	init(){
		//For prototyping purposes only. Remove when applicable.
		let generateMystery = this.generateNewMystery.bind(this);
		document.getElementById("display-details").addEventListener("click",  generateMystery);
	};

	generateNewMystery(){
		console.log("Mystery Generated!");

		//Game initializations that will be added to its own function at a later date
		let locationObjects = generateLocationObjects(allLocations);

		//Begin mystery generation...
		let crimeData   = generateCrimeData();
		let suspectList = createSuspectList(crimeData, locationObjects);
		generateAllStatements(suspectList, locationObjects, crimeData);
		
		let {culpritIndex, motive, location, weapon} = crimeData;
		

		//After the data has been generated, turn all of it into game objects. 
		//Game objects include rooms, characters, physical clues
		//all of these objects will have images attached to them;
		let rooms = initializeLocations(allLocations, suspectList, crimeData, game.renderer.sprites)
		

		let startingRoom = rooms.find((location) => location.isMurderLocation);

		console.log("Generating new mystery...");

		this.assignSuspectGraphics(suspectList, this.renderer.sprites);
		navigateTo(startingRoom.name, rooms);

		//For debugging purposes. Remove when necessary.
		displayMysteryDetails(crimeData, suspectList, rooms);
		let locations = document.getElementById("location-selection");
		let startingIndex = Array.from(locations.options).map(option => option.value).indexOf(startingRoom.name);
		locations.selectedIndex = startingIndex;
	};

	assignSuspectGraphics(suspectList, spriteDict){

		suspectList.forEach( (suspect) => {
			let genderTag = (suspect.gender === "Male") ? "m" : "f";
			let suspectNumber = suspect.name.charAt(suspect.name.length - 1);
			let url = genderTag + "_suspect" + suspectNumber;
			
			suspect.graphic = spriteDict["elves"][url];
			suspect.graphic.interactive = true;
			suspect.graphic.buttonMode  = true;
			suspect.graphic.on("pointerdown", () => {
				let msg = `Hello, I'm ${suspect.name}!`;
				this.dialogueScene.openDialogue(suspect);
				this.dialogueScene.showDialogueBox(msg);

				event.stopPropagation();});
		});
	};

	compileGameData(){};
};

let game = new Game();
game.init();

let dialogueScene = new DialogueScene(game.renderer.screen);
//Create a new mystery
let currentRoom = new Location("The Ether");

// //The Mystery Object.
class Mystery{
	constructor(victim, culprit, motive, weapon){
		this.victim   = null;
		this.culprit  = null;
		this.motive   = motive;
		this.weapon   = weapon;
		this.suspects = [];
		this.rooms    = [];

		this.currentRoom = null;
	};

	init(){
		this.currentRoom = new Location("The Ether");
	}

	navigateToRoom(roomName, roomList){
		if(this.currentRoom.name !== roomName){
			let oldRoom = this.currentRoom;
			
			this.currentRoom = roomList.find((location) => location.name === roomName);
			
			if(oldRoom.graphic) oldRoom.graphic.visible = false;
			hideOccupants(oldRoom);
			dialogueScene.close();
			
			displayOccupants(currentRoom);
			
			if(currentRoom.graphic) currentRoom.graphic.visible = true;
		};
	};
};

function displayOccupants(room){
	let occupants = room.occupants;

	let x = 0;
	let y = 0;
	let buffer = 10;

	occupants.forEach( (occupant) => {
		if(occupant.graphic){
			occupant.graphic.visible = true;
			occupant.graphic.x = x;
			occupant.graphic.y = y;

			x = x + occupant.graphic.width + buffer;
		}
	});
};

function hideOccupants(room){
	let occupants = room.occupants;

	occupants.forEach( (occupant) => {
		if(occupant.graphic){
			occupant.graphic.visible = false
		};
	})
};

export function navigateTo(roomName, roomList){
	if(currentRoom.name !== roomName){
		let oldRoom = currentRoom;
		currentRoom = roomList.find((location) => location.name === roomName);
		if(oldRoom.graphic) oldRoom.graphic.visible = false;
		hideOccupants(oldRoom);
		dialogueScene.close();
		displayOccupants(currentRoom);
		if(currentRoom.graphic) currentRoom.graphic.visible = true;
	};
};


//Make locations that the player can move around to. Suspects do not move from room to room.
//Rooms have a name, whether or not it is the murder room, a background image and a list of people and physical objects
//That's about it...

//Characters have a name, race, gender, personality, image and list of statements.
//Their images are based on their race and gender
//Clicking on them opens a list of statements
//Clicking on a list of statements opens up a statement that was pre-generated based on their personality.

//At the start of the game when the rooms are populated, the murder victim is placed in the murder room first, then this room is excluded from
//having any more occupants
//Up to three people can be in a room at a time
//If two people like each other, then they are more than likely to be in the same room together.
