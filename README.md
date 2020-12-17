# Murder Mystery

Just a quick little game written in Javascript, or at least the prototype for it anyway. It will soon be used to play with <a href="http://www.live2d.com/en/">Live2d's</a> SDK for Javascript.

For now, it will be a rudimentary spot the liar type of game with a simple, procedurally generated mystery. Character traits and personalities will also be procedually generated, but their appearances will be hard-coded for the time being. The game will be rendered via Pixi.js and will feature full-motion, original Live2d models.

Notes will be tracked in the Wiki tab. The <a href="https://gracefuljs.github.io/murder-mystery/">current prototype</a> is a very simple graphical demonstration of generating mystery details. There is no win or lose scenario as of yet.

## Recent Changes  
* Added rudimentary graphics and basic implementation of a rendering engine.
* Fixed a bug that caused the data generator to crash if a suspect had only itself to provide suspicious behavior for.

## Upcoming Tasks
* Adding more physical evidence in order to corroborate other testimonies. 
* Mobile Support
* Refining the data generator to support more complicated mystery data
* Implement character personalities to flavor text
* Implement character relationships to add complexity  
* Integrate Live2d SDK
* Implement procedurally generated character appearances