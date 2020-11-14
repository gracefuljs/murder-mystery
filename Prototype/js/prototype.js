//For Prototyping Purposes
function generateLocationsOptions(elem, locationList){
	if(elem.options.length <= 0){
		locationList.forEach( (location) => {
			let option = document.createElement("option");
			option.text = location.name;
			option.value = location.name;
			elem.add(option);
		});
	}
}

function changeHandler(locations, locationList){
	newRoom = locations.options[locations.selectedIndex].value;

	navigateTo(newRoom, locationList);

};


function displayMysteryDetails(crimeData, suspectList, locationList){
	let {location, culpritIndex, weapon, motive} = crimeData;
	let details = document.getElementById("mystery-details");
	let locations = document.getElementById("location-selection");
	let locationsContainer = document.getElementById("location-selection-container");
	let rooms = [...locationList];

	locationsContainer.classList.remove("hidden");

	changeHandler = changeHandler.bind(null, locations, locationList);

	locations.removeEventListener("change", changeHandler, true);

	details.innerHTML = `In the ${location}, Suspect ${culpritIndex + 1} killed the victim with a ${weapon} because of ${motive}.`;

	generateLocationsOptions(locations, locationList);
	
	locations.addEventListener("change", changeHandler, true);

};


