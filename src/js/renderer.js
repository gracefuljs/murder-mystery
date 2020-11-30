import * as PIXI from 'pixi.js';
import * as Graphics from './graphics';


//---------------------------Screen-------------------------
class Screen{
	constructor(){
		this._layers = {};
		this._state  = "default";
	};

	createLayer(layerName){
		if(!this._layers[layerName]){
			this._layers[layerName] = new PIXI.Container();
		};
	};

	getLayer(layerName){
		return this._layers[layerName]
	};

	addTo(layerName, item){
		this.getLayer(layerName).addChild(item)
	};

	clearLayer(layerName){
		this.getLayer.children = [];
	}

};


/*-----------------------------------------Scenes------------------------------------------------*/
class Scene{
	constructor(parentScreen){
		this.parentScreen = parentScreen;
		this.init()
	};

	init(){};
	open(){};
	close(){};
};



export class DialogueScene extends Scene{
	constructor(parentScreen){
		super(parentScreen);
	};

	init(parentScreen){
		this.dialogueCharacter = null;
		this.createDialogueBox();
		this.createChoiceBox();
		this.dialogueBox.hide();
		this.choiceBox.hide();
		this.parentScreen = parentScreen;
	};

	createDialogueBox(){
		this.dialogueBox = new Graphics.DialogueBox(400, 200);
		this.dialogueBox.setBackground(50, 375, 800, 200, 0x162047, 0x4A86C1);
		this.parentScreen.addTo("gui", this.dialogueBox.getWindow());
	};

	createChoiceBox(){
		this.choiceBox = new Graphics.ChoiceContainer();
		this.choiceBox.addChoice("Alibi?", this.askAboutAlibi.bind(this));
		this.choiceBox.addChoice("Motive?", this.askAboutMotive.bind(this));
		this.choiceBox.addChoice("Suspicious?", this.askAboutSuspicious.bind(this));
		this.parentScreen.addTo("gui", this.choiceBox.getWindow());
	}

	openDialogue(character){
		this.dialogueCharacter = character;
		this.showDialogueBox();
		this.showChoiceBox();
	};

	showDialogueBox(text){
		let dialogue = text || "";
		this.dialogueBox.show(dialogue);
	};

	showChoiceBox(){
		this.choiceBox.show()
	};

	close(){
		this.dialogueCharacter = null;
		this.dialogueBox.hide();
		this.choiceBox.hide();
	};

	askAboutAlibi(){
		this.dialogueBox.show(this.dialogueCharacter.statements.alibi)
	};

	askAboutMotive(){
		this.dialogueBox.show(this.dialogueCharacter.statements.motive)
	};

	askAboutSuspicious(){
		this.dialogueBox.show(this.dialogueCharacter.statements.weapon)
	};


};

export class RoomScene extends Scene{

	constructor(){
		super();
	};

	init(){
		this.currentRoom = null;
	};

	displayOccupants(){
		let occupants = this.currentRoom.occupants;

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

	hideOccupants(){
		let occupants = this.currentRoom.occupants;

		occupants.forEach( (occupant) => {
			if(occupant.graphic){
				occupant.graphic.visible = false
			};
		})
	};

	setRoom(room){
		this.currentRoom = room;
	};

	enterRoom(room){
		this.setRoom(room);

		this.displayRoom();
		this.displayOccupants();
	};

	displayRoom(){
		this.currentRoom.graphic.visible = true;
	};
}


// --------------------------------------Sprite Generation----------------------------------------

/*------------------------------Begin Prototyping Images----------------------------------------*/
const dummyImages = () => {
	let numbers = [1, 2, 3, 4, 5, 6];

	let url = (gender) => (num) => `assets/images/elves/${gender}_suspect${num}.jpg`;
	let females = numbers.map( url("f") );
	let males   = numbers.map( url("m") );

	return [...females, ...males, "assets/images/elves/bothelves.png"]
};

//Lists of rooms
const locationBgs = () => ["ballroom", "diningroom", "kitchen", "parlor", "stable", "study"]
						  .map(imgName => "assets/images/rooms/" + imgName + ".jpg");

export function assignSuspectGraphics(suspectList, spriteDict){

	suspectList.forEach( (suspect) => {
		let genderTag = (suspect.gender === "Male") ? "m" : "f";
		let suspectNumber = suspect.name.charAt(suspect.name.length - 1);
		let url = genderTag + "_suspect" + suspectNumber;
		
		suspect.graphic = spriteDict["elves"][url];
		suspect.graphic.interactive = true;
		suspect.graphic.buttonMode  = true;
		suspect.graphic.on("pointerdown", () => {onClick(suspect); event.stopPropagation();});
	});
};

function onClick(suspect){
	let msg = `Hello, I'm ${suspect.name}!`;
	dialogueScene.openDialogue(suspect);
	dialogueScene.showDialogueBox(msg);
};



// /*------------------------------End Prototyping Images----------------------------------------*/




// /*-----------------------------------Main Rendering Processes-----------------------------------------------------*/

export class Renderer{

	constructor(width, height, containerId){
		this.container = document.getElementById(containerId);

		this.app = new PIXI.Application({
			width: width,
			height: height
		});

		this.loader = PIXI.Loader.shared;
		this.sprites = {};
		this.screen  = null;

		this.container.appendChild(this.app.view);
	};

	preloadAssets(){
		let init   = this.initializeSprites.bind(this, this.loader.resources);
		let assets = this.compileAssets();

		this.loader
			.add(assets)
			.load(init)
	};

	compileAssets(){
		//For prototyping purposes only. Remove when applicable.
		return [...dummyImages(), ...locationBgs()]
	};

	createScreenLayer(layerName){
		if(!this.screen.getLayer(layerName)){
			
			this.screen.createLayer(layerName);
			this.app.stage.addChild(this.screen.getLayer(layerName));
		};
	}

	initializeScreen(){
		this.screen = new Screen();

		this.createScreenLayer("background");
		this.createScreenLayer("character");
		this.createScreenLayer("gui");

	};

	initialize(){
		this.initializeScreen();
		this.preloadAssets();
	};

	initializeSprites(resourceDict){

		for (let resource in resourceDict){
			this.createDictionaryEntry(resourceDict, resource);
		};

		this.addSpritesToScreen();

	};

	createDictionaryEntry(resourceDict, resource){
		let entry = resourceDict[resource];
		let name  = this.createSpriteName(entry);
		let type  = this.createSpriteType(entry);
		
		this.sprites[type] = this.sprites[type] || {};
		this.sprites[type][name] = this.createSprite(entry);

		return this.sprites[type][name]
	};

	//The sprite's name is its filename.
	createSpriteName({name}){
		let start = name.lastIndexOf("/") + 1;
		let end   = name.lastIndexOf(".");

		return name.slice(start, end)
	};

	createSpriteType({name}){
		let end   = name.lastIndexOf("/") - 1;
		let start = name.lastIndexOf("/", end);
		let type  = name.slice(start + 1, end + 1);
		
		return type
	};


	createSprite(spriteResource){

		let newSprite = new PIXI.Sprite(spriteResource.texture);

		let oldHeight = newSprite.height;
		newSprite.height = this.app.view.height;
		newSprite.width  = (newSprite.height * newSprite.width) / oldHeight;
		newSprite.visible = false;

		return newSprite
	}; 

	addSpritesToScreen(){
		const typeToLayer = {
			"elves": "character",
			"rooms": "background"
		};

		for(let type in this.sprites){
			let layer = typeToLayer[type];
			Object.keys(this.sprites[type]).forEach( (sprite) => {
				this.screen.addTo(layer, this.sprites[type][sprite]);
			}, this)
		};
	};

	createDialogueScene(){
		return new DialogueScene(this)
	}
};