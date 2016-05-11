let shake = function(div) {
  var interval = 100;
  var distance = 10;
  var times = 2;

  for (var iter = 0; iter < (times + 1) ; iter++) {
    $(div).animate({
        left: ((iter % 2 == 0 ? distance : distance * -1))
    }, interval);
  }
  $(div).animate({ left: 0 }, interval);
}

Modules.client.shake = shake;
