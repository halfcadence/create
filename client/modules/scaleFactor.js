let scaleFactor;
let resizeTimer;

let startScaleFactor = function() {
  resize();
  $(window).resize(function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 100);
  });
}

function resize() {
    let clientWidth = document.documentElement.clientWidth; //viewport width
    if (clientWidth <= 440) { //tiny
      Session.set('scaleFactor', .35);
    }
    else if (clientWidth < 1024) { //medium
      Session.set('scaleFactor', .5);
    }
    else {
      Session.set('scaleFactor', .75); //wide
    }
};

Modules.client.getScaleFactor = function() { return scaleFactor};
Modules.client.startScaleFactor = startScaleFactor;
