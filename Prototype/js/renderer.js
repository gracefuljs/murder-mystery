/*-----------------------------------Layer-----------------------------------------------*/
const Layer = () => {
	return ({
	_body: new PIXI.Container(),
	_background: null,
	_width: 900,
	_height: 600,
})};


/*Screen Layers*/
class Screen{
	constructor(){
		this._layers = {
			background: Layer(),
			character: Layer(),
			gui: Layer()
		};

		this._state = "default";
	}

	getLayer(layerName){
		return this._layers[layerName]._body
	}

};

const GameScreen = new Screen();

//Layer Functions
const getScreenLayer = (layerName) => GameScreen.getLayer(layerName);
const addToScreen    = (layerName, item) => getScreenLayer(layerName).addChild(item);
const clearScreen    = (layerName) => {layerName.children = []};


/*-----------------------------------GUI-----------------------------------------------*/

class GUIComponent{
	constructor(x, y, width, height){
		this._body = new PIXI.Container();
		this._background = getDefaultBackground();
		this._width = width;
		this._height = height;
		this._x = x;
		this._y = y;

		this._body.addChild(this._background);
	};

	getWindow(){
		return this._body
	};

	getDefaultBackground(){
		let bg = new PIXI.Graphics();
		bg.lineStyle(2, 0x4A86C1, 1);
		bg.beginFill(0x162047, 0.75);
		bg.drawRect(this._x, this._y, this._width, this._height);
		bg.endFill();

		return bg
	};

	defaultTextStyle(){
		return {fontSize:30, fill:"#ffffff"}
	};
}

//Dialogue needs a graphic and text. The text needs to be dynamic. The dialogue box also needs to fade in and out. 
//Nothing else needs to change.

class DialogueBox{
	constructor(width, height){
		this._body = new PIXI.Container();
		this._background = null;
		this._width = width;
		this._height = height;
		this._text = new PIXI.Text("");


		this._body.interactive = true;
		this._body.on("click", () =>{this.onClick()});

	};

	setBackground(x, y, width, height, fillColor, LineColor){
		let bg = new PIXI.Graphics();
		bg.lineStyle(2, LineColor, 1);
		bg.beginFill(fillColor, 0.75);
		bg.drawRect(x, y, width, height);
		bg.endFill();

		this._background = bg;
		//this._background.visible = false;
		this._body.addChild(this._background);
		this._body.addChild(this._text);
	};

	getWindow(){
		return this._body
	};

	updateWindow(){
		this._body.removeChildren();
		this._body.addChild(this._background, this._text);
	};

	show(text){
		let processedText = this.processText(text);
		this._text = new PIXI.Text(processedText, {size:30, fill:"#ffffff"});
		this._text.x = 60;
		this._text.y = 385;
		this.updateWindow()
		this._body.visible = true;
	};

	hide(){
		this._body.visible = false;
	};

	onClick(){};

	characterWidth = 6;

	processText(text){

		let totalAllowedCharacters = parseInt(this._width / this.characterWidth);
		let processedLine = "";

		let splitLine = text.split(" ").reduce((currentLine, currentWord) => {
			let line = currentLine + " " + currentWord;

			if(line.length < totalAllowedCharacters){
				currentLine = line
			}

			else{
				processedLine += currentLine + "\n";
				currentLine = currentWord
			};

			return currentLine

		}, "");

		return (processedLine += splitLine).trim()

	}

	
};



/*------------Choice Box----------------*/
class ChoiceContainer{
	constructor(){
		this._body = new PIXI.Container();
		this._width = 300;
		this._height = 310;
		this._x = 550;
		this._y = 50;
		this._padding = 10;
		this._background = this.defaultBackgroundStyle();
		this._choices = [];

		this._body.addChild(this._background);

		this._body.interactive = true;
	};

	getWindow(){
		return this._body
	};
	
	addChoice(text, clickFunction){
		let width = this._width - ( this._padding * 2 );
		let choiceCount = this._choices.length;
		let margin = (choiceCount > 0) ? 10 : 0;
		let y = this._y + ( 50 * choiceCount ) + this._padding + (margin * choiceCount);
		let x = this._x + this._padding;

		let newChoice = new Choice(text, x, y, width, 50);
		newChoice.onClick = clickFunction;
		this._choices = [...this._choices, newChoice];
		this.updateChoices();
	};

	updateChoices(){
		this._body.removeChildren();
		this._body.addChild(this._background);
		this._body.addChild(...this._choices.map(choice=>choice._body));
	};

	defaultBackgroundStyle(){
		let bg = new PIXI.Graphics();
		bg.lineStyle(2, 0x4A86C1, 1);
		bg.beginFill(0x162047, 0.75);
		bg.drawRect(this._x, this._y, this._width, this._height);
		bg.endFill();

		return bg
	};

	show(){
		this._body.visible = true;
	}

	hide(){
		this._body.visible = false;
	};
}

/*The ChoiceBox- choice boxes are children of the choice containers.
They act as buttons that, when clicked, execute a particular function.*/
class Choice{
	constructor(text, x, y, width, height){
		this._body = new PIXI.Container();
		this._width = width;
		this._height = height;
		this._x = x;
		this._y = y;
		this._padding = 10;
		this._background = this.defaultBackgroundStyle();
		this._textStyle = this.defaultTextStyle();
		this._text = this.drawText(text);

		this._body.interactive = true;
		this._body.buttonMode  = true;
		this._body.on("click", ()=>{this.onClick()})

		this._body.addChild(this._background);
		this._body.addChild(this._text);
	};

	defaultTextStyle(){
		return {fontSize:30, fill:"#ffffff"}
	};

	defaultBackgroundStyle(){
		let bg = new PIXI.Graphics();
		bg.lineStyle(2, 0x4A86C1, 1);
		bg.beginFill(0x162047, 0.75);
		bg.drawRect(this._x, this._y, this._width, this._height);
		bg.endFill();

		return bg
	}

	updatetextStyle(styleObj){
		this._textStyle = styleObj;
	};

	getWindow(){
		return this._body
	};

	drawText(text){
		let textGraphic = new PIXI.Text(text, this._textStyle);
		textGraphic.x = this._x + this._padding;
		textGraphic.y = this._y + this._padding;

		return textGraphic
	}

	onClick(){};
}

/*-----------------------------------------Scenes------------------------------------------------*/
class Scene{
	constructor(){
		this.init()
	};

	init(){};
	open(){};
	close(){};
};



class DialogueScene extends Scene{
	constructor(){
		super();
	};

	init(){
		this.dialogueCharacter = null;
		this.createDialogueBox();
		this.createChoiceBox();
		this.dialogueBox.hide();
		this.choiceBox.hide();
	};

	createDialogueBox(){
		this.dialogueBox = new DialogueBox(400, 200);
		this.dialogueBox.setBackground(50, 375, 800, 200, 0x162047, 0x4A86C1);
		addToScreen("gui", this.dialogueBox.getWindow());
	};

	createChoiceBox(){
		this.choiceBox = new ChoiceContainer();
		this.choiceBox.addChoice("Alibi?", this.askAboutAlibi.bind(this));
		this.choiceBox.addChoice("Motive?", this.askAboutMotive.bind(this));
		this.choiceBox.addChoice("Suspicious?", this.askAboutSuspicious.bind(this));
		addToScreen("gui", this.choiceBox.getWindow());
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

class RoomScene extends Scene{

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



/*-----------------------------------------Game Data---------------------------------------------*/
let dialogueScene = new DialogueScene()

/*--------------------------------------Sprite Generation----------------------------------------*/
const sprites = {};



/*------------------------------Begin Prototyping Images----------------------------------------*/
const dummyImages = () => {
	let numbers = [1, 2, 3, 4, 5, 6];

	let url = (gender) => (num) => `assets/images/elves/${gender}_suspect${num}.jpg`;
	let females = numbers.map( url("f") );
	let males   = numbers.map( url("m") );

	return [...females, ...males, "assets/images/elves/bothelves.png"]
};

function assignSuspectGraphics(suspectList, spriteDict){

	suspectList.forEach( (suspect) => {
		let genderTag = (suspect.gender === "Male") ? "m" : "f";
		suspectNumber = suspect.name.charAt(suspect.name.length - 1);
		let url = genderTag + "_suspect" + suspectNumber;
		
		suspect.graphic = spriteDict["elves"][url];
		suspect.graphic.interactive = true;
		suspect.graphic.buttonMode = true;
		suspect.graphic.on("pointerdown", () => {onClick(suspect); event.stopPropagation();});
	});
};

function onClick(suspect){
	let msg = `Hello, I'm ${suspect.name}!`;
	dialogueScene.openDialogue(suspect);
	dialogueScene.showDialogueBox(msg);
};

function assignRoomGraphics(roomList, spriteDict){

	console.log(spriteDict["rooms"])
	roomList.forEach( (room) => {

		console.log(room);
		room.graphic = spriteDict["rooms"][room.imgURL];
	});

	console.log(roomList)
}

/*------------------------------End Prototyping Images----------------------------------------*/

//Lists of images
const locationBgs = () => ["ballroom", "diningroom", "kitchen", "parlor", "stable", "study"]
						  .map(imgName => "assets/images/rooms/" + imgName + ".jpg"); 


//The sprite's name is its filename.
const createSpriteName = (spriteResource) => {
	let start = spriteResource.name.lastIndexOf("/") + 1;
	let end   = spriteResource.name.lastIndexOf(".");
	let name  = spriteResource.name.slice(start, end);

	return name
};

const createSpriteType = (spriteResource) => {
	let end   = spriteResource.name.lastIndexOf("/") - 1;
	let start = spriteResource.name.lastIndexOf("/", end);
	let type  = spriteResource.name.slice(start + 1, end + 1);
	
	return type
};

const createSprite = (spriteResource) => {

	let newSprite = new PIXI.Sprite(spriteResource.texture);

	let oldHeight = newSprite.height;
	newSprite.height = app.view.height;
	newSprite.width  = (newSprite.height * newSprite.width) / oldHeight;
	newSprite.visible = false;

	return newSprite
}; 

/*-----------------------------------Main Rendering Processes-----------------------------------------------------*/

const container = document.getElementById("suspect-details");
const loader = PIXI.Loader.shared;

const app = new PIXI.Application({
	width: 900,
	height: 600
});

function init(loader, resources){
	app.stage.addChild( getScreenLayer("background") );
	app.stage.addChild( getScreenLayer("character") );
	app.stage.addChild( getScreenLayer("gui") );

	for(resource in resources){
		let entry = resources[resource];
		let name = createSpriteName(entry);
		let type = createSpriteType(entry);

		sprites[type] = sprites[type] || {};
		sprites[type][name] = createSprite(entry);

		let layer = ( type === "elves" ) ? "character" : "background";

		addToScreen(layer, sprites[type][name]);		
	};
};

container.appendChild(app.view);
loader
    .add(
    	dummyImages()
    )
    .add(
    	locationBgs()
    	)
    .load(init)

///Main Renderer

function Renderer(){
	let app = null;
}
