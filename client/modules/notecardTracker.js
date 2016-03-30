//start tracking cursors
let startNotecardTracker = () => {
  //track cursors MongoDB
  let cards = Cards.find();
  let cardsHandle = cards.observeChanges({
    added: function (id, fields) {
      Modules.client.drawNoteCard(id);
    },
    changed: function(id, fields) {

    },
    removed: function (id) {
      removeThing(document.getElementById(id));
    }
  });
};

let removeThing = function(thing){
  //if (!$(thing).queue().length){
   $(thing).remove();
};

Modules.client.startNotecardTracker = startNotecardTracker;
