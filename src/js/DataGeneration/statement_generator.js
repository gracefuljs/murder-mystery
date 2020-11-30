import {randomInt, randomItem, generateRandomGender} from "../utils.js";
import {allActivities, validRoomActivities} from "./data_generator";

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


//-------Utility Functions-------//
const isPartnerFilter = (self, checkedSuspect) => !self.partner || checkedSuspect.name == self.partner.name;
const isSelfFilter    = (self, checkedSuspect) => checkedSuspect.name !== self.name;



//--------Alibi Statement--------//
const otherOccupants = (suspect, mysteryData) => {
	let {location, partner} = mysteryData;
	
	return location.occupants.filter( occupant => isPartnerFilter(suspect, occupant) && isSelfFilter(suspect, occupant) )
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
	let validActivities = allActivities.filter(validRoomActivities)
									   .filter( (activity) => 
											activity.reqParticipants <= location.occupants.length || 
											activity.reqParticipants == 1); 
	
	let activity = randomItem(validActivities);
	let partner  = null;
	if(activity.reqParticipants > 1){
		partner = randomItem(location.occupants);
	}

	return generateAlibiStatement(suspect, {location, activity, partner}, locationObjects);
}


//
function distributeData(suspects, data){
	if(suspects.length !== data.length){
		throw("Suspect list and data list are not the same length.")
	};

	let suspectList = [...suspects];
	let dataList    = [...data];
	let newData     = [];

	suspectList.forEach((suspect, index) => {
		let validData = dataList.filter( (s) => isSelfFilter(suspect, s) );

		if(validData.length === 0 && index === suspectList.length - 1){
			let suspectToSwapIndex = randomInt(suspectList.length -1);
			let selectedData       = dataList[0];

			newData[index] = newData[suspectToSwapIndex];
			newData[suspectToSwapIndex] = selectedData
		}

		else{

			let selectedData = randomItem(validData);
		
			newData.push(selectedData);
			dataList = dataList.filter( (s) => isSelfFilter(selectedData, s) );
		}
	});

	return newData
}


//--------Motive Statement--------//
const generateMotiveStatment  = (selectedSuspect) => {
	return `I heard that ${selectedSuspect.name}'s motive is ${selectedSuspect.mysteryData.motive}.`
};



//--------Weapon Statement--------//
const generateWeaponStatement = (selectedSuspect) => {
	return `I saw ${selectedSuspect.name} holding a ${selectedSuspect.mysteryData.weapon}.`
};



//--------Putting it all together...--------//
function generateAllStatements(suspectList, locationObjects, crimeData){
	let suggestedMotives = distributeData(suspectList, suspectList);
	let weaponSightings  = distributeData(suspectList, suspectList);

	suspectList.forEach( (suspect, index) => {

		suspect.statements.alibi  = ( isSuspectLying(suspect) ) ? generateFalseAlibi(suspect, locationObjects, crimeData) : generateAlibiStatement(suspect, suspect.mysteryData);
		suspect.statements.motive = generateMotiveStatment(suggestedMotives[index]);
		suspect.statements.weapon = generateWeaponStatement(weaponSightings[index]); 
	});

};

export {
	generateAllStatements
}