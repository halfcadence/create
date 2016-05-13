//does the window minimizing "scale effect" on div
//to or from the specified location
let scaleEffectIn = function(div, startX, startY, endX, endY) {
  scaleFactor = Session.get("scaleFactor");


  //starting css
  $(div).height(scaleFactor*300 + 'px');
  $(div).width(scaleFactor*500 + 'px');
  $(div).height('0px');
  $(div).width('0px');
  $(div).css('top', startX);
  $(div).css('left', startY);
  $(div).width('0px');


  //animation
  $(div).animate({
    height: scaleFactor*300 + 'px',
    width: scaleFactor*500 + 'px',
    left: endX + 'px',
    top: endY + 'px',
  }, 200, function(){
    //reset style so that media query will still resize div
    $(div).css('height', '');
    $(div).css('width', '');
  });
}

Modules.client.scaleEffectIn = scaleEffectIn;
