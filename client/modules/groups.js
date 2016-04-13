Template.application.events({ //events on the page body
  "click button.group": function (event) { //click on new button
    event.preventDefault(); // Prevent default browser form submit
  },
  "click button.red": function (event) { //click on new button
    event.preventDefault(); // Prevent default browser form submit
    showTrashCards();
  }
});

let showTrashCards = function() {
  // TODO: increase efficiency of query by adding {locationX: 1, locationY: 1}
  // TODO: sort with find.sort and display in order
  let trashCards = Cards.find({groupId: "trash"});
  showVeil();
  drawPositions = makePlacementArray();
  let drawPositionIndex = 0;
  trashCards.forEach(function(card) {
      Modules.client.moveThing(document.getElementById(card._id), drawPositions[drawPositionIndex].x,drawPositions[drawPositionIndex].y);
      drawPositionIndex = (drawPositionIndex + 1 ) % drawPositions.length;
      Modules.client.setZIndex(document.getElementById(card._id), 10000001)
      console.log("locX" + card.locationX);
  });

}

//shows the veil
//it removes itself when clicked upon
let showVeil = function () {
  let veil = $(".veil");
  let x = $(".x");
  veil.css('visibility', "visible");
  $(x).on( "click.veil", hideVeil); //turn on click events under validator namespace
  $(".pep").on( "mousedown.veil", hideVeil);
}

//hide the veil
//remove its click listeners
let hideVeil = function () {
  let veil = $(".veil");
  veil.css('visibility', "hidden");
  $( ".x" ).off( ".veil" );
  $(".pep").off( ".veil");
}

//TODO: dynamically allocate this array
//makes the array with positions cards will be drawn from the group
let makePlacementArray = function() {
  let cornerDistance = 25;
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
