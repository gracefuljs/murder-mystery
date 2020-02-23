//Game Constants
const TOTAL_SUSPECTS = 6;

//Components of the Game
const activeMystery = null;

//Temporary static data for testing purposes
const allLocations = [ "kitchen", "parlor", "study", "ballroom", "dining room", "stable"];
const allMotives   = [ "jealousy", "revenge", "money", "spurned love", "blackmail", "supression" ];
const allWeapons   = [ "knife", "pistol", "statuette", "sword", "hammer" ];

//Activities are different. They have special properties that determine whether or not they will be used
const allActivities = [
    {name: "sweeping", reqParticipants: 1, room: ["any"]},
    {name: "washing dishes", reqParticipants: 1, room: ["kitchen"]},
    {name: "straightening up", reqParticipants: 1, room: ["parlor", "study", "ballroom", "dining room"]},
    {name: "chatting", reqParticipants: 2, room: ["any"]},
    {name: "having a snack", reqParticipants: 1, room: ["dining room"]},
    {name: "idle", reqParticipants:1, room:["any"]}
];


//Object Classes
class Mystery{
	constructor(victim, culprit, motive, weapon){
		this.victim  = null;
		this.culprit = null;
		this.motive  = motive;
		this.weapon  = weapon;
		this.suspects = [];
	};
};

class Character{
	constructor(name){
		this.name = name;

		this.mysteryData = {};
	};
};

class Location{
	constructor(name){
		this.name = name;
		this.occupants = [];
	};
};


//Helper Functions. Will use a proper library later.
const randomItem = (arr) => arr[ Math.floor( Math.random() * arr.length ) ];



//Some initializations
const generateLocationObjects = () => allLocations.map( (locationName) => new Location(locationName) );


//Contruct Suspect Data
const generateBlankSuspectData = () => ({location: null, activity: null, motive: null, weapon:null});

const applyLocationData = (suspect, locationList) => {
	let location = randomItem(locationList);
	
	if(location.occupants.length > 1){

		return applyLocationData(suspect, locationList);
	}

	else {

		suspect.mysteryData.location = location;
		location.occupants.push(suspect);
		return suspect
	}
};

const applyActivityData = (suspect) => {
	let location = suspect.mysteryData.location;
	let partner  = location.occupants.find(occupant => occupant.mysteryData.activity && occupant.mysteryData.activity.reqParticipants === 2);
	
	//Filters
	let potentialParticipants = (location) => location.occupants.filter( (occupant) => occupant.mysteryData.activity === null );
	let validRoomActivities   = (activity) => activity.room.includes(location.name) || activity.room.includes("any");
	let validParticipantActivities = (activity) => activity.reqParticipants <= potentialParticipants(location).length;
	
	if(partner){
		suspect.mysteryData.activity = partner.mysteryData.activity
	}
	
	else{
		
		let validActivities = allActivities.filter( validRoomActivities ).filter( validParticipantActivities );
		suspect.mysteryData.activity = randomItem(validActivities)
	}

	return suspect
};

const applyMotiveData = (suspect, motiveList) => {
	let motiveIndex = Math.floor(Math.random() * motiveList.length);
	
	suspect.mysteryData.motive = motiveList[motiveIndex];
	motiveList.splice(motiveIndex, 1);

	return suspect
};

const applyWeaponData = (suspect) => {
	suspect.mysteryData.weapon = randomItem(allWeapons);

	return suspect
};

const applyCulpritData = (culprit, motive, location, weapon) => {
	let activity = {name: "murder", reqParticipants: 1, room: ["any"]};
	culprit.mysteryData = Object.assign({}, {activity, motive, location, weapon})

	return culprit 
};

const createSuspectList = (crimeData, locationList) => {
	let suspectList = [];
	let {culpritIndex, motive:murderMotive, location:murderLocation, weapon} = crimeData;

	for(let i = 0; i < TOTAL_SUSPECTS; i++){
		let suspect = new Character(`Suspect ${i + 1}`);
		suspect.mysteryData = Object.assign(suspect.mysteryData, generateBlankSuspectData());		
		suspectList.push(suspect);
	};

	//Temporarily remove the culprit from the suspects list, as well as all of the data that can only be applied to it.
	let culprit = suspectList.splice(culpritIndex, 1)[0];
	applyCulpritData(culprit, murderMotive, locationList.find( location => location.name === murderLocation), weapon)


	let usableMotives   = [...allMotives].filter( (motive) => motive !== murderMotive );
	let usableLocations = [...locationList].filter( (location) => location.name === location );

	//Each section will have their own algorithm so they can be handled seperately.
	suspectList = suspectList.map( (suspect) => applyLocationData(suspect, locationList) )
							 .map( (suspect) => applyActivityData(suspect) )
							 .map( (suspect) => applyMotiveData(suspect, usableMotives) )
							 .map( (suspect) => applyWeaponData(suspect) );

	suspectList.splice(culpritIndex, 0, culprit)

	return suspectList
};

const generateCrimeData = () => {
	let obj = {
		victim: new Character("Victim"),
		culpritIndex: Math.floor( Math.random() * TOTAL_SUSPECTS ),
		motive: randomItem(allMotives),
		location: randomItem(allLocations),
		weapon: randomItem(allWeapons),
	};

	return obj
};

//For Prototyping Purposes
function displayMysteryDetails(culpritIndex, motive, location, weapon, suspectList){
	let details = document.getElementById("mystery-details");
	details.innerHTML = `In the ${location}, Suspect ${culpritIndex + 1} killed the victim with a ${weapon} because of ${motive}.`

	displaySuspectDetails(suspectList);
};

function displaySuspectDetails(suspectList){
	let suspectDetails = document.getElementById("suspect-details");
	
	let report = suspectList.reduce((str, suspect) => {
		let {activity, location, motive, weapon} = suspect.mysteryData;
		let data = `${suspect.name}'s activity was ${activity.name} in the ${location.name}. Their motive is ${motive} and they were seen holding a ${weapon}`;
		str = str + `<li>${data}</li>`;

		return str
	}, "")

	suspectDetails.innerHTML = `<ul>${report}</ul>`;
};

//Create a new mystery
function generateMystery(){

	//Game initializations that will be added to its own function at a later date
	let locationObjects = generateLocationObjects(allLocations);

	//Begin mystery generation...
	let crimeData   = generateCrimeData();
	let suspectList = createSuspectList(crimeData, locationObjects);
	
	let {culpritIndex, motive, location, weapon} = crimeData;
	displayMysteryDetails(culpritIndex, motive, location, weapon, suspectList);
};



//Create clues from the "Truth"
//--do the murderer last, since their lie depends on everyone else's truth.
//--construct a testimony for their alibi using their location and their activity
//--construct their motive
//--construct their weapon
//--construct the murderer's lies based on everyone else's truth

//Test the mystery to make sure it's winnable

//Apply all of these facts to a new mystery