//start tracking cursors
let startNotecardTracker = () => {
  //track cursors MongoDB
  let cards = Cards.find();
  let cardsHandle = cards.observeChanges({
    added: function (id, fields) {
      //set arguments
      let arguments = {};
      arguments.locationX = fields.locationX;
      arguments.locationY = fields.locationY;
      arguments.title = fields.title;
      arguments.body = fields.body;
      arguments.body2 = fields.body2;
      arguments.cost = fields.cost;
      arguments.priority = fields.priority;
      arguments.position = fields.position;
      arguments.zIndex = fields.zIndex;

      //draw the card
      Modules.client.drawNoteCard(id, arguments);
    },
    changed: function(id, fields) {
      if (fields.locationX  !== undefined || fields.locationY !== undefined)
        Modules.client.moveThing(document.getElementById(id),fields.locationX, fields.locationY);
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
      if (fields.groupId !== undefined)
        updateGroupIcons(fields.groupId);
      if (fields.zIndex !== undefined)
        $(document.getElementById(id)).css('z-index',fields.zIndex);
      /*
      if (fields.position !== undefined) {
        if (fields.position === "left")
          slide(id, "right");
        else //fields.position === "right"
          slide(id, "left");
      }
      */
    },
    removed: function (id) {
      removeThing(document.getElementById(id));
    }
  });
};

let updateGroupIcons = function(groupId){
   if (groupId === "") { // card was moved resulting in it being not in a group
     updateEmptyGroupIcons();
   }
   else {
     updateFilledGroupIcons(groupId);
   }
};

let updateEmptyGroupIcons = function() {
  let groupNames = Modules.client.getGroupNames();
  groupNames.forEach(function(name) {
    if (Cards.findOne({groupId:name}) === undefined) {// no card with the group id
      console.log(name + " is an empty group.");
      $('#' + name).removeClass('filled');
    }
  });
}

let updateFilledGroupIcons = function(groupId) {
  $('#' + groupId).addClass('filled');
}

let removeThing = function(thing){
   $(thing).remove();
};

//temporary way to access notecards
//TODO: refactor with data structure searchable by id
let slide = function(id, direction) {
  if (direction === "left") {
    $(document.getElementById(id)).children('.bodyText2').css('left', 0); //right element showing
  } else if (direction === "right") {
    $(document.getElementById(id)).children('.bodyText2').css('left', 500); //left element showing
  }
}

Modules.client.startNotecardTracker = startNotecardTracker;
