Template.application.events({ //events on the page body
  "click button.group": function (event) { //click on new button
    event.preventDefault(); // Prevent default browser form submit
    makeNewNoteCard();
  },
  "click button.red": function (event) { //click on new button
    event.preventDefault(); // Prevent default browser form submit
    showTrashCards();
  }
});
let makeNewNoteCard = function() {
  var id = Cards.insert({
        projectId: Modules.client.getProjectId(),
        title: "",
        body: "",
        body2: "",
        locationX:  195,
        locationY: 25,
        cost: "",
        priority: "",
        position: "left"
  });
}

let showTrashCards = function() {
  // TODO: increase efficiency of query by adding {locationX: 1, locationY: 1}
  // TODO: sort with find.sort and display in order
  let trashCards = Cards.find({groupId: "trash"});

  drawPositions = makePlacementArray();
  let drawPositionIndex = 0;
  trashCards.forEach(function(card) {
      Modules.client.moveThing(document.getElementById(card._id), drawPositions[drawPositionIndex].x,drawPositions[drawPositionIndex].y);
      drawPositionIndex = (drawPositionIndex + 1 ) % drawPositions.length;
      console.log("locX" + card.locationX);
  });

}

//TODO: dynamically allocate this array
//makes the array with positions cards will be drawn from the group
let makePlacementArray = function() {
  let cornerDistance = 10;
  let xStep = 510; //distance between each card <->
  let yStep = 310; //distance between each card ^-v
  let drawPositions = [
    {x:cornerDistance, y:cornerDistance},
    {x:cornerDistance + xStep, y:5},
    {x:cornerDistance + 2*xStep, y:5},
    {x:cornerDistance, y:cornerDistance + yStep},
    {x:cornerDistance + xStep, y:cornerDistance + yStep},
    {x:cornerDistance + 2*xStep, y:cornerDistance + yStep}
  ];
  console.log(drawPositions.length)
  return drawPositions;
}
