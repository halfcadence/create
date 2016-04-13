//move a dom element
let moveThing = function(thing,x,y){
   console.log("moving to " + x + ", " + y);
   let position = {};
   position.left = x;
   position.top = y;
   $(thing).offset(position);
   //hack hack hack
   $(thing).css('z-index', 100);
};

//sets the z index... TODO: refactor so z index is consistent across clients
let setZIndex = function(thing, index){
   $(thing).css('z-index', index);
};

Modules.client.setZIndex = setZIndex;
Modules.client.moveThing = moveThing;
