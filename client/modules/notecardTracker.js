//start tracking cursors
let startNotecardTracker = () => {
  //track cursors MongoDB
  let cards = Cards.find();
  let cardsHandle = cards.observeChanges({
    added: function (id, fields) {
      let arguments = {};
      arguments.locationX = fields.locationX;
      arguments.locationY = fields.locationY;
      Modules.client.drawNoteCard(id, arguments);
    },
    changed: function(id, fields) {
      
    },
    removed: function (id) {
      removeThing(document.getElementById(id));
    }
  });
};

//TODO: refactor to shared module
let moveThing = function(thing,x,y){
  //if (!$(thing).queue().length){
   $(thing).animate({ top: y - 15, left: x - 15}, "fast", 'linear', {queue: false});
  //}
};

let removeThing = function(thing){
   $(thing).remove();
};

Modules.client.startNotecardTracker = startNotecardTracker;
