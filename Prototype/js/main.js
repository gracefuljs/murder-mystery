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
    {name: "tending to the horses", reqParticipants:1, room:["stable"]},
    {name: "idle", reqParticipants:1, room:["any"]},
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
	constructor(name, gender){
		this.name = name;
		this.gender = gender;

		this.mysteryData = {};
	};
};

class Suspect extends Character{
	constructor(name, gender){
		super(name, gender);
		this.isMurderer = false;
		this.statements = {
			alibi:[],
			motive:[],
			weapon:[]
		};
	}

	getStatement(type){
		return this.statements[type][0]
	}
}

class Location{
	constructor(name){
		this.name = name;
		this.occupants = [];
	};
};

const generateRandomGender = () => {
	let rand = Math.floor(Math.random() * 2);
	return (rand === 0) ? "Male" : "Female"
}

//Helper Functions. Will use a proper library later.
const randomItem = (arr) => arr[ Math.floor( Math.random() * arr.length ) ];



//Some initializations
const generateLocationObjects = () => allLocations.map( (locationName) => new Location(locationName) );


//Contruct Suspect Data
const generateBlankSuspectData = () => ({location: null, activity: null, motive: null, weapon:null});

//Generate the Data and return it
const generateLocationData = (suspect, locationList) => {
	let location = randomItem(locationList);
	
	if(location.occupants.length > 1){

		return generateLocationData(suspect, locationList);
	}

	else {
		return location
	}
}

//Apply the Returned Data
const applyLocationData = (suspect, locationList) => {
	let location = generateLocationData(suspect, locationList);

	suspect.mysteryData.location = location;
	location.occupants.push(suspect);
	return suspect
};

//Activity Data has 2 Parts, each must be handled seperately. The activity itself, and the partner.

//Filters
let potentialParticipants = (location) => location.occupants.filter( (occupant) => occupant.mysteryData.activity === null );
let validRoomActivities   = (activity) => activity.room.includes(location.name) || activity.room.includes("any");
let validParticipantActivities = (activity, location) => activity.reqParticipants <= potentialParticipants(location).length;

const generateActivity = (suspect)  => {
	let location = suspect.mysteryData.location;
	let validActivities = allActivities.filter( validRoomActivities ).filter( (activity) => validParticipantActivities(activity, location) );
	
	return randomItem(validActivities)
}


const applyActivityData = (suspect) => {

	let location = suspect.mysteryData.location;
	let partner  = location.occupants.find(occupant => occupant.mysteryData.activity && 
													   occupant.mysteryData.activity.reqParticipants === 2)
													   || null;
	
	if(partner){
		suspect.mysteryData.activity = partner.mysteryData.activity;
		suspect.mysteryData.partner  = partner;
		partner.mysteryData.partner  = suspect;
	}

	else{
		suspect.mysteryData.activity = generateActivity(suspect);
		suspect.mysteryData.partner  = null;
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
		let suspect = new Suspect( `Suspect ${i + 1}`, generateRandomGender() );
		suspect.mysteryData = Object.assign(suspect.mysteryData, generateBlankSuspectData());		
		suspectList.push(suspect);
	};

	//Temporarily remove the culprit from the suspects list, as well as all of the data that can only be applied to it.
	let culprit = suspectList.splice(culpritIndex, 1)[0];
	culprit.isMurderer = true;
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
		victim: new Character("Victim", generateRandomGender()),
		culpritIndex: Math.floor( Math.random() * TOTAL_SUSPECTS ),
		motive: randomItem(allMotives),
		location: randomItem(allLocations),
		weapon: randomItem(allWeapons),
	};

	return obj
};


//Create a new mystery
function generateMystery(){

	//Game initializations that will be added to its own function at a later date
	let locationObjects = generateLocationObjects(allLocations);

	//Begin mystery generation...
	let crimeData   = generateCrimeData();
	let suspectList = createSuspectList(crimeData, locationObjects);
	generateAllStatements(suspectList, locationObjects, crimeData);
	
	let {culpritIndex, motive, location, weapon} = crimeData;
	displayMysteryDetails(culpritIndex, motive, location, weapon, suspectList);

	
};


//Generate Statements
class Statement{
	constuctor(isTruth, saying){
		this.saying = saying;
		this.isTruth = isTruth;
		this.needsValidation = false;
	}
}

//This function will get more and more complex as the game gets more complex, but for now, all that the game needs to worry about is whether 
//or not the person is the killer.
const isSuspectLying = (suspect) => suspect.isMurderer;

const otherOccupants = (suspect, mysteryData) => {
	let {location, partner} = mysteryData;
	return location.occupants.filter(occupant => occupant !== partner && occupant !== suspect)
}

const generateAlibiStatement = (suspect, mysteryData, locationObjects) => {
	let {location, activity, partner} = mysteryData;
	let others = otherOccupants(suspect, mysteryData);
	if( others.length <= 1 && suspect.isMurderer ){others = []};
	
	let locationStatement = `I was in the ${location.name}`;
	let activityStatement = (activity.name === "idle") ? "" : ` ${activity.name}`;
	let partnerStatement  = (partner == null) ? '' : ` with ${partner.name}`;

	let statement = locationStatement + activityStatement + partnerStatement + "."
	if(location.occupants.length < 2){statement += " There's no one who can vouch for me."};
	if(others.length > 0){statement += ` ${others[0].name} was also there with me.`}

	return statement
};

const generateFalseAlibi = (suspect, locationObjects, crimeData) => {
	let location = randomItem(locationObjects.filter( location => location.name != crimeData.location)); //a random location other than the murder location
	let validActivities = allActivities.filter(validRoomActivities).filter( (activity) => 
																				activity.reqParticipants <= location.occupants.length || 
																				activity.reqParticipants == 1); 
	
	let activity = randomItem(validActivities);
	let partner  = null;
	if(activity.reqParticipants > 1){
		partner = randomItem(location.occupants);
	}

	return generateAlibiStatement(suspect, {location, activity, partner}, locationObjects);
}

const generateMotiveStatment  = (selectedSuspect) => {
	return `I heard that ${selectedSuspect.name}'s motive is ${selectedSuspect.mysteryData.motive}.`
};

const generateWeaponStatement = (selectedSuspect) => {
	return `I saw ${selectedSuspect.name} holding a ${selectedSuspect.mysteryData.weapon}.`
};

function generateAllStatements(suspectList, locationObjects, crimeData){
	let suggestedMotives = [...suspectList];
	let weaponSightings  = [...suspectList];

	suspectList.forEach( (suspect, index) => {
		let validMotives = suggestedMotives.filter( (s) => s !== suspect );
		let validWeapons = suggestedMotives.filter( (s) => s !== suspect );

		let selectedMotive = validMotives.splice(Math.floor(Math.random() * validMotives.length) )[0];
		let selectedWeapon = validWeapons.splice(Math.floor(Math.random() * validWeapons.length) )[0];

		suspect.statements.alibi  = ( isSuspectLying(suspect) ) ? generateFalseAlibi(suspect, locationObjects, crimeData) : generateAlibiStatement(suspect, suspect.mysteryData);
		suspect.statements.motive = generateMotiveStatment(selectedMotive);
		suspect.statements.weapon = generateWeaponStatement(selectedWeapon);
		
	});
};


//For Prototyping Purposes
function displayMysteryDetails(culpritIndex, motive, location, weapon, suspectList){
	let details = document.getElementById("mystery-details");
	details.innerHTML = `In the ${location}, Suspect ${culpritIndex + 1} killed the victim with a ${weapon} because of ${motive}.`

	displaySuspectDetails(suspectList);
};

function sayStatement(elementId, suspect, statementType){
	let statement = suspect.statements[statementType];
	document.getElementById(elementId).value = statement; 
};

function generateSuspectProfile(suspect){
	let statement = suspect.statements.alibi;
	let {motive, weapon} = suspect.mysteryData;
	let {name, gender, isMurderer} = suspect;
	let id = name.replace(" ", "-")
	
	let elfImage = `assets/images/${suspect.gender.toLowerCase()}_elf.jpg`;
	let imgClass = (isMurderer) ? "class= 'murderer'" : "";

	let profileElement = document.createElement("div");
	profileElement.setAttribute("class", "elf-profile");

	let title = document.createElement("h2");
	let titleText = document.createTextNode(name);
	title.appendChild(titleText);

	let img = document.createElement("img");
	img.setAttribute("src", elfImage);
	img.setAttribute("class", imgClass);

	let container = document.createElement("div");
	container.setAttribute("class", "elf-profile-container");

	let buttonDiv = document.createElement("div");
	buttonDiv.setAttribute("class", "button-div");

	let alibiButton = document.createElement("input");
	alibiButton.setAttribute("type", "button");
	alibiButton.setAttribute("id", "${id}-alibi-button");
	alibiButton.setAttribute("value", "Where were you at the time of the murder?");
	alibiButton.addEventListener("click", () => {sayStatement(id, suspect, "alibi")});

	let motiveButton = document.createElement("input");
	motiveButton.setAttribute("type", "button");
	motiveButton.setAttribute("id", "${id}-motive-button");
	motiveButton.setAttribute("value", "Do you know who'd want the victim dead?");
	motiveButton.addEventListener("click", () => {sayStatement(id, suspect, "motive")});

	let weaponButton = document.createElement("input");
	weaponButton.setAttribute("type", "button");
	weaponButton.setAttribute("id", "${id}-weapon-button");
	weaponButton.setAttribute("value", "Did you see anything suspicious?");
	weaponButton.addEventListener("click", () => {sayStatement(id, suspect, "weapon")});

	let statementArea = document.createElement("input");
	statementArea.setAttribute("type", "text");
	statementArea.setAttribute("id", id);
	statementArea.setAttribute("class", "statement-area")

	profileElement.appendChild(title);
	profileElement.appendChild(container);
	container.appendChild(img);
	container.appendChild(buttonDiv);
	buttonDiv.appendChild(alibiButton);
	buttonDiv.appendChild(motiveButton);
	buttonDiv.appendChild(weaponButton);
	profileElement.appendChild(document.createElement("br"))
	profileElement.appendChild(statementArea)


	return profileElement
}

function displaySuspectDetails(suspectList){
	let suspectDetails = document.getElementById("suspect-details");
	suspectDetails.innerHTML = "";
	
	let profileList = "";
	suspectList.forEach( (suspect) => {
		let profile = generateSuspectProfile(suspect);
		suspectDetails.appendChild(profile)
	});
};