import { randomItem } from "./utils";

class Location{
	constructor(name, imgURL, isMurderLocation){
		this.name = name;
		this.imgURL = imgURL || null;
		this.isMurderLocation = isMurderLocation || false;
		this.graphic = null;

		this.occupants = [];
		this.objects = [];
	}

	setGraphic(graphic){
		this.graphic = graphic;
	}
};

//Preparing Location Game Objects
const generateLocationGameObjects = (locationList) =>  
	[...locationList].map( (locationName) => new Location(locationName, locationName.toLowerCase().replace(/\s+/g, '') ));


const getMurderLocationFromData = (locationGameObjects, murderLocationName) => locationGameObjects.find( (location) => location.name == murderLocationName );


const assignMurderLocation = (locationObject) => {  
	locationObject.isMurderLocation = true;
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


function assignRoomGraphics(roomList, spriteDict){

	roomList.forEach( (room) => {

		room.setGraphic(spriteDict["rooms"][room.imgURL]);
	});
};



//-----------Putting it all together-------------------//
function initializeLocations(locationList, suspectList, crimeData, spriteDict){

	let rooms = generateLocationGameObjects(locationList);
	assignRoomGraphics(rooms, spriteDict);

	let {victim, location} = crimeData;
	let murderLocation = getMurderLocationFromData(rooms, location);
	assignMurderLocation(murderLocation)
	
	populateLocations(rooms, victim, suspectList);

	return rooms
};

export {
	Location,
	generateLocationGameObjects,
	getMurderLocationFromData,
	assignMurderLocation,
	initializeLocations
}
