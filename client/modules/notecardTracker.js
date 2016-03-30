//start tracking cursors
let startNotecardTracker = () => {
  //track cursors MongoDB
  let cards = Cards.find();
  let cardsHandle = cards.observeChanges({
    added: function (id, fields) {
      let arguments = {};
      arguments.locationX = fields.locationX;
      arguments.locationY = fields.locationY;
      arguments.title = fields.title;
      arguments.body = fields.body;
      arguments.body2 = fields.body2;
      arguments.cost = fields.cost;
      arguments.priority = fields.priority;
      Modules.client.drawNoteCard(id, arguments);
    },
    changed: function(id, fields) {
      //console.log("moving to" + fields.locationX + ", " + fields.locationY);
      if (fields.locationX  !== undefined || fields.locationY !== undefined)
        moveThing(document.getElementById(id),fields.locationX, fields.locationY);
      if (fields.title !== undefined)
        $(document.getElementById(id)).children('.titleText').val(fields.title);
      if (fields.body !== undefined)
        $(document.getElementById(id)).children('.bodyText').val(fields.body);
      if (fields.body2 !== undefined)
        $(document.getElementById(id)).children('.bodyText2').val(fields.body2);
      if (fields.cost !== undefined)
        $(document.getElementById(id)).children('.cost').val(fields.cost);
      if (fields.priority !== undefined)
        $(document.getElementById(id)).children('.priority').val(fields.priority);
    },
    removed: function (id) {
      removeThing(document.getElementById(id));
    }
  });
};

let moveThing = function(thing,x,y){
   //for some reason animate doesn't go to the right position
   //$(thing).animate({ left: x, top: y}, "fast", 'linear', {queue: false});
   let position = {};
   position.left = x;
   position.top = y;
   console.log("moving to " + position.left + ", " + position.top);
   $(thing).offset(position);
};

let removeThing = function(thing){
   $(thing).remove();
};

Modules.client.startNotecardTracker = startNotecardTracker;
