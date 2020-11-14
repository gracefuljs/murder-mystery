//The Mystery Object.
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

	navigateToRoom(room){
		if(this.currentRoom != room){
			this.currentRoom = room
		};
	}

	init(){
		this.currentRoom = null;
	}
};

class Location{
	constructor(name, imgURL, isMurderLocation){
		this.name = name;
		this.imgURL = imgURL || null;
		this.isMurderLocation = isMurderLocation || false;
		this.graphic = null;

		this.occupants = [];
		this.objects = [];
	};
}

//Create a new mystery
let currentRoom = new Location("The Ether");

function generateMystery(){

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
	let rooms = generateLocations(allLocations, location);
	populateLocations(rooms, crimeData.victim, suspectList);
	

	let startingRoom = rooms.find((location) => location.isMurderLocation);

	console.log("Generating new mystery...");

	displayMysteryDetails(crimeData, suspectList, rooms);
	assignSuspectGraphics(suspectList, sprites);
	assignRoomGraphics(rooms, sprites);
	navigateTo(startingRoom.name, rooms);

	//For debugging purposes. Remove when necessary.
	let locations = document.getElementById("location-selection");
	let startingIndex = Array.from(locations.options).map(option => option.value).indexOf(startingRoom.name);
	locations.selectedIndex = startingIndex;
	
};

function generateLocations(locationList, murderLocationName){
	let locations = [...locationList];

	locations = locations.map( (locationName) => new Location(locationName, locationName.toLowerCase().replace(/\s+/g, '') ));
	let murderLocation = locations.find( (location) => location.name == murderLocationName );
	murderLocation.isMurderLocation = true;

	return locations
	
};

function populateLocations(locationList, victim, suspectList){
	let suspects = [...suspectList];
	let awaitingSuspect = 0;

	while(awaitingSuspect < suspects.length){
		let chosenSuspect = suspects[awaitingSuspect];
		let chosenLocation = randomItem(locationList);

		if(!chosenLocation.isMurderLocation && chosenLocation.occupants.length < 3){
			chosenLocation.occupants.push(chosenSuspect);
			awaitingSuspect++
		}
	}

	let murderLocation = locationList.find( (location) => location.isMurderLocation );
	murderLocation.occupants.push(victim);
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

function navigateTo(roomName, roomList){
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
