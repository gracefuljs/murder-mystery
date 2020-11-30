import {randomInt, randomItem, generateRandomGender} from "../utils.js";

//Game Constants
const TOTAL_SUSPECTS = 6;


//Temporary static data for testing purposes
const allLocations = [ "kitchen", "parlor", "study", "ballroom", "dining room", "stable"];
const allMotives   = [ "jealousy", "revenge", "money", "spurned love", "blackmail", "hiding a secret" ];
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


//Object creation
const generateSuspectObject  = (name, gender) => ({name, gender, isMurderer:false, mysteryData:{}});
const generateLocationObject = (name) => ({name, occupants:[]});

//Contruct Suspect Data
const generateBlankSuspectData = () => ({location: null, activity: null, motive: null, weapon:null});

//Some initializations
const generateLocationObjects = () => allLocations.map( (locationName) => generateLocationObject(locationName) );
const generateSuspectObjects  = (suspectCount) => {
	let list = []

	for(let i = 0; i < suspectCount; i++){
		let suspect = generateSuspectObject( `Suspect ${i + 1}`, generateRandomGender() );
		suspect.mysteryData = Object.assign(suspect.mysteryData, generateBlankSuspectData());		
		list.push(suspect);
	};

	return list
};

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
	let validActivities = allActivities.filter( validRoomActivities )
									   .filter( (activity) => validParticipantActivities(activity, location) );
	
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

//-------------------Putting it all together-------------------------

const createSuspectList = (crimeData, locationList) => {
	let suspectList = generateSuspectObjects(TOTAL_SUSPECTS);
	let {culpritIndex, motive:murderMotive, location:murderLocation, weapon} = crimeData;

	//Temporarily remove the culprit from the suspects list, as well as all of the data that can only be applied to it.
	let culprit = suspectList.splice(culpritIndex, 1)[0];
	culprit.isMurderer = true;
	applyCulpritData(culprit, murderMotive, locationList.find( location => location.name === murderLocation), weapon)


	let usableMotives   = [...allMotives  ].filter( (motive) => motive !== murderMotive );
	let usableLocations = [...locationList].filter( (location) => location.name === location );

	//Each section will have their own algorithm so they can be handled seperately.
	suspectList = suspectList.map( (suspect) => applyLocationData(suspect, locationList) )
							 .map( (suspect) => applyActivityData(suspect) )
							 .map( (suspect) => applyMotiveData(suspect, usableMotives) )
							 .map( (suspect) => applyWeaponData(suspect) );

	suspectList.splice(culpritIndex, 0, culprit);

	suspectList = suspectList.map( (suspect) => Object.assign({}, suspect, {statements:{alibi:[], motive:[], weapon:[]}}));

	return suspectList
};

const generateCrimeData = () => {
	return {
		victim: {name:"Victim", gender:generateRandomGender()},
		culpritIndex: Math.floor( Math.random() * TOTAL_SUSPECTS ),
		motive: randomItem(allMotives),
		location: randomItem(allLocations),
		weapon: randomItem(allWeapons),
	};
};

export {
	createSuspectList,
	generateLocationObjects,
	generateCrimeData,
	generateSuspectObject,
	generateLocationObject,
	generateBlankSuspectData,
	allLocations,
	allMotives,
	allWeapons,
	allActivities,
	validRoomActivities
}