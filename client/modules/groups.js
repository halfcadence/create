let currentGroupId =  "";//hack so that removeAllFromGroup knows which groupId to target

Template.application.events({ //events on the page body
  "click button.group": function (event) { //click on new button
    event.preventDefault(); //Prevent default browser form submit
    showGroupedCards("leftCornerGroup");
  },
  "click button.red": function (event) { //click on new button
    event.preventDefault(); //Prevent default browser form submit
    showGroupedCards("trash");
  },
  "click button.removeall": function (event) { //click on new button
    event.preventDefault(); //Prevent default browser form submit
    removeAllFromGroup(currentGroupId);
  }
});

//remove all cards from current group
let removeAllFromGroup = function(groupId) {
  if (!groupId) return;

  //find all cards from mongo (to get the ids...) and update the positions
  //there must be an easier way to do this
  drawPositions = makePlacementArray();
  let drawPositionIndex = 0;
  let groupedCards = Cards.find({groupId: groupId});
  groupedCards.forEach(function(card) {
    Cards.update(card._id, { //set position for all elements with groupId
      $set: {groupId: "",
        locationX: drawPositions[drawPositionIndex].x,
        locationY: drawPositions[drawPositionIndex].y}
    });
    drawPositionIndex = (drawPositionIndex + 1 ) % drawPositions.length;
  });
  //hideVeil();
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
    Modules.client.setZIndex(document.getElementById(card._id), 10000001); //set z index about veil
    drawPositionIndex = (drawPositionIndex + 1 ) % drawPositions.length;
  });
}

//shows the veil
//it removes itself when clicked upon
let showVeil = function (groupId) {
  let veil = $(".veil");
  let x = $(".x");
  veil.css('visibility', "visible");
  $(x).on( "click.veil", function() {hideVeil(groupId)}); //turn on click events under validator namespace
  $(".pep").on( "mousedown.veil", groupPepOnClick);
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
let groupPepOnClick = function() {
  Cards.update(this.id, { //set position in database
    $set: {groupId : ""}
  });
  hideVeil();
}

//TODO: dynamically allocate this array
//makes the array with positions cards will be drawn from the group
let makePlacementArray = function() {
  let cornerDistance = 25;
  let xStep = 510; //distance between each card <->
  let yStep = 310; //distance between each card ^-v
  let drawPositions = [
    {x:cornerDistance, y:cornerDistance},
    {x:cornerDistance + xStep, y:cornerDistance},
    {x:cornerDistance + 2*xStep, y:cornerDistance},
    {x:cornerDistance, y:cornerDistance + yStep},
    {x:cornerDistance + xStep, y:cornerDistance + yStep},
    {x:cornerDistance + 2*xStep, y:cornerDistance + yStep}
  ];
  return drawPositions;
}
