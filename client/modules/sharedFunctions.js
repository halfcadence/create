//move a dom element
let moveThing = function(thing,x,y){
   let position = {};
   position.left = x;
   position.top = y;
   //we have $(thing).stop().offset to prevent buildup
   //but it had the side effect of canceling genie effect animations and stuff
   //leaving cards at size 0
   $(thing).offset(position);
};


//sets the z index... TODO: refactor so z index is consistent across clients
let setZIndex = function(thing, index){
   $(thing).css('z-index', index);
};

//turns a pixel location into a percentage
let getHorizontalPercentage = function(locationX) {
  return locationX/Session.get('clientWidth');
}
let getVerticalPercentage = function(locationY) {
  return locationY/Session.get('clientHeight');
}

//turns a percentage location into pixels
let getHorizontalScaledLocation = function(locationX) {
  return locationX * Session.get('clientWidth');
}
let getVerticalScaledLocation = function(locationY) {
  return locationY * Session.get('clientHeight');
}

Modules.client.getHorizontalPercentage = getHorizontalPercentage;
Modules.client.getVerticalPercentage = getVerticalPercentage;
Modules.client.getHorizontalScaledLocation = getHorizontalScaledLocation;
Modules.client.getVerticalScaledLocation = getVerticalScaledLocation;
Modules.client.setZIndex = setZIndex;
Modules.client.moveThing = moveThing;
