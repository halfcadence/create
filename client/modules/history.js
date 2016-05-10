let cy;

let showHistory = function() {
  $(".cy").show(); //make the DOM element visible
  //for some reason the graph has to be redrawn
  //otherwise it starts invisible until resized
  drawGraph(); //use cytoscape to draw the graph
  //hide the graph when clicked
  $("button.cy").on('click',function() {
    $(".cy").css('display', 'none');
  });
}

let drawGraph = function() {
  cy = cytoscape({
    container: document.getElementById('cy'),
    boxSelectionEnabled: false,
    autounselectify: true,
    maxZoom: 1,
    layout: {
      name: 'dagre'
    },
    style: [
      {
         selector: 'node',
         style: {
           'shape': 'rectangle',
           'height': '300px',
           'width': '500px',
           'content': 'data(displayName)',
           'text-opacity': 1,
           'text-valign': 'center',
           'background-color': '#efeff4',
           'font-size': '3.5em',
           'font-weight': '100',
           'font-color': '#404040',
           'font-family': 'Roboto',
           'shadow-color': '#969696',
           'shadow-offset-x': '0',
           'shadow-offset-y': '2',
           'shadow-blur': '5',
           'shadow-opacity': '.8',
           'cursor': 'pointer'
         }
       },
       {
         selector: 'edge',
         style: {
           'width': 20,
           'target-arrow-shape': 'triangle',
           'line-color': '#404040',
           'target-arrow-color': '#404040'
         }
       }
    ],
    elements: {
      nodes: Modules.client.getHistoryNodes(),
      edges: Modules.client.getHistoryEdges()
    }
  });
  cy.center();
}

//function to draw actual notecards on top of cytoscape
//non-functional
let drawRealNoteCards = function() {
  cy.nodes().forEach(function(node) {
    console.log("drawing notecard with id " + node.data("id") + " at " + node.position("x") + ", " + node.position("y"));
    let noteCard = Modules.client.drawNoteCard(node.data("id"));
    $('#cy').append(noteCard.div);
  });
}

Modules.client.showHistory = showHistory;
