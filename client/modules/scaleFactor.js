let resizeTimer;
let startScaleFactor = function() {
  resize();
  $(window).resize(function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 100);
  });
}

let resize = function() {
  let clientWidth = document.documentElement.clientWidth;
  if (clientWidth <= 440) { //tiny
    Session.set('scaleFactor', .35);
  }
  else if (clientWidth < 1024) { //medium
    Session.set('scaleFactor', .5);
  }
  else if (clientWidth < 1440){
    Session.set('scaleFactor', .75); //wide
  }
  else {
    Session.set('scaleFactor', 1);
  }
  Session.set('clientWidth',document.documentElement.clientWidth); //viewport width
  Session.set('clientHeight',document.documentElement.clientHeight); //viewport width
  Modules.client.moveNoteCardsResponsively();
  Modules.client.moveCursorsResponsively();
};

Modules.client.getScaleFactor = function() { return scaleFactor};
Modules.client.startScaleFactor = startScaleFactor;
