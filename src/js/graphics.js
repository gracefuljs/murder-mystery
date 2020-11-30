import * as PIXI from 'pixi.js';


//-------------------Base Class---------------------------
export class GUIComponent{
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

export class DialogueBox{
	constructor(width, height){
		this._body = new PIXI.Container();
		this._background = null;
		this._width = width;
		this._height = height;
		this._text = new PIXI.Text("");

		this.characterWidth = 6;


		this._body.interactive = true;
		this._body.on("click", () => {this.onClick()});

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
export class ChoiceContainer{
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
export class Choice{
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


export class CharacterSprite{
	constructor(){
		this._body = null;
	};

	show(){
		this._body.visible = true;
	};

	hide(){
		this._body.visible = false;
	};

	setPosition(x, y){
		this._body.x = x;
		this._body.y = y;
	};

	showAt(x, y){
		this.setPosition(x, y);
		this.show();
	};
}