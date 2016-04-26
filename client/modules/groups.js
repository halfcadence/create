let currentGroupId =  ""; //hack so that removeAllFromGroup knows which groupId to target

let groupNames = ["leftCornerGroup", "topMiddleGroup", "rightCornerGroup", "bottomMiddleGroup", "trash"];

Template.application.events({ //events on the page body
  "click button.group#leftCornerGroup": function (event) {
    event.preventDefault(); //Prevent default browser form submit
    showGroupedCards("leftCornerGroup");
  },
  "click button.group#topMiddleGroup": function (event) {
    event.preventDefault();
    showGroupedCards("topMiddleGroup");
  },
  "click button.group#bottomMiddleGroup": function (event) {
    event.preventDefault();
    showGroupedCards("bottomMiddleGroup");
  },
  "click button.group#rightCornerGroup": function (event) {
    event.preventDefault();
    showGroupedCards("rightCornerGroup");
  },
  "click button.red": function (event) { //delete button
    event.preventDefault();
    showGroupedCards("trash");
  },
  "click button.removeall": function (event) { //"empty group" button
    event.preventDefault();
    Meteor.call("getNextZIndex", Modules.client.getProjectId(), function(error, result) {
      //remove all from the group,
      //use z-index to replace the notecards on the table
      removeAllFromGroup(currentGroupId,result);
    });
  }
});

//remove all cards from current group
let removeAllFromGroup = function(groupId, zIndex) {
  if (!groupId) return;
  zIndex = zIndex || 100;
  //find all cards from mongo (to get the ids...) and update the positions
  //there must be an easier way to do this
  drawPositions = makePlacementArray();
  let drawPositionIndex = 0;
  let groupedCards = Cards.find({groupId: groupId});
  groupedCards.forEach(function(card) {
    Cards.update(card._id, { //set position for all elements with groupId
      $set: {groupId: "",
        locationX: drawPositions[drawPositionIndex].x,
        locationY: drawPositions[drawPositionIndex].y,
        zIndex: zIndex}
    });
    drawPositionIndex = (drawPositionIndex + 1 ) % drawPositions.length;
  });
}

let showGroupedCards = function(groupId) {
  currentGroupId = groupId;

  //TODO: increase efficiency of query by adding {locationX: 1, locationY: 1}
  //TODO: sort with find.sort and display in order
  let groupedCards = Cards.find({groupId: groupId});
  showVeil(groupId);
  drawPositions = makePlacementArray();
  let drawPositionIndex = 0;
  groupedCards.forEach(function(card) {
    Modules.client.moveThing(document.getElementById(card._id), drawPositions[drawPositionIndex].x,drawPositions[drawPositionIndex].y);
    Modules.client.setZIndex(document.getElementById(card._id), 10000001); //set z index above veil
    drawPositionIndex = (drawPositionIndex + 1 ) % drawPositions.length;
  });
}

//shows the veil
//it removes itself when clicked upon
let showVeil = function (groupId) {
  let veil = $(".veil");
  let x = $(".x");
  veil.css('visibility', "visible");
  $(x).on( "click.veil", function() {hideVeil(groupId)});
  $(".pep").on( "mousedown.veil", ungroupPepOnClick);
}

let hideVeil = function (groupId) {
  //hide the veil
  let veil = $(".veil");
  veil.css('visibility', "hidden");

  //remove its click listeners
  $( ".x" ).off( ".veil" );
  $(".pep").off( ".veil");

  //hide the cards with the veil
  hideGroupedCards(groupId);
}

let hideGroupedCards = function(groupId) {
  let trashCards = Cards.find({groupId: groupId});
  trashCards.forEach(function(card) {
    //move each card in the group to its dB position
    //this will avoid the element taken out of the group
    //even if it hasn't set its group name to "" yet
    Modules.client.moveThing(document.getElementById(card._id), card.locationX, card.locationY);
  });
  currentGroupId = "";
}

//a pep in a group was clicked
//remove it from the group, then hide veil
let ungroupPepOnClick = function() {
  // we need to explicitly set location and z index
  // because we relied on moving the pep to set it
  // but if it's right clicked somehow it doesn't trigger
  // the normal pep movement stuff
  let that = this;
  Cards.update(that.id, { //immediately set database position and remove from group
    $set: {
      groupId : "",
      locationX: $(that).position().left,
      locationY: $(that).position().top
    }
  });

  //find the next z-index and set it
  Meteor.call("getNextZIndex", Modules.client.getProjectId(), function(error, result) {
    Cards.update(that.id, { //set position in database
      $set: {
        zIndex:result
      }
    });
  });
  hideVeil(currentGroupId);
}

//TODO: dynamically allocate this array
//makes the array with positions cards will be drawn from the group
let makePlacementArray = function() {
  let cornerDistance = 50;
  let xStep = 510; //distance between each card <->
  let yStep = 310; //distance between each card ^-v
  let drawPositions = [
    {x:cornerDistance, y:cornerDistance},
    {x:cornerDistance + xStep, y:cornerDistance},
    {x:cornerDistance, y:cornerDistance + yStep},
    {x:cornerDistance + xStep, y:cornerDistance + yStep},
    {x:cornerDistance + 2*xStep, y:cornerDistance},
    {x:cornerDistance + 2*xStep, y:cornerDistance + yStep}
  ];
  return drawPositions;
}

let getGroupNames = function() {
  return groupNames;
}

Modules.client.getGroupNames = getGroupNames;
