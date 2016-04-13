//move a dom element
let moveThing = function(thing,x,y){
   // for some reason peps moved by this function
   // accept mouse events
   console.log("moving to " + x + ", " + y);
   let position = {};
   position.left = x;
   position.top = y;
   $(thing).offset(position);
   $(thing).finish();
};

//sets the z index... TODO: refactor so z index is consistent across clients
let setZIndex = function(thing, index){
   $(thing).css('z-index', index);
};

Modules.client.setZIndex = setZIndex;
Modules.client.moveThing = moveThing;
