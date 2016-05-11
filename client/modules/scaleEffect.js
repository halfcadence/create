//does the window minimizing "scale effect" on div
//to or from the specified location
let scaleEffectIn = function(div, startX, startY, endX, endY) {
  scaleFactor = Session.get("scaleFactor");
  $(div).height('0px');
  $(div).width('0px');
  $(div).css('top', startX);
  $(div).css('left', startY);
  $(div).width('0px');
  $(div).animate({
    height: scaleFactor*300 + 'px',
    width: scaleFactor*500 + 'px',
    left: endX + 'px',
    top: endY + 'px',
  }, 200, function(){
  });
}

Modules.client.scaleEffectIn = scaleEffectIn;
