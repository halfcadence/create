//move a dom element
let moveThing = function(thing,x,y){
   let position = {};
   position.left = x;
   position.top = y;
   $(thing).offset(position);
};
Modules.client.moveThing = moveThing;
