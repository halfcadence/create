//move a dom element
let moveThing = function(thing,x,y){
   let position = {};
   position.left = x;
   position.top = y;
   //we have $(thing).stop().offset to prevent buildup
   //but it had the side effect of canceling genie effect animations and stuff
   //leaving cards at size 0
   $(thing).offset(position);
   console.log("moving thing to " + x + ", " + y);
};


//sets the z index... TODO: refactor so z index is consistent across clients
let setZIndex = function(thing, index){
   $(thing).css('z-index', index);
};

Modules.client.setZIndex = setZIndex;
Modules.client.moveThing = moveThing;
