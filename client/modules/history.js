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
  console.log("drawing graph with nodes: ");
  let historyNodes =  Modules.client.getHistoryNodes();
  let node;
  for(let i = 0; i < historyNodes.length; i++) {
    console.log(historyNodes[i].data.id + ": " + historyNodes[i].data.displayName);
  }
  cy = cytoscape({
    container: document.getElementById('cy'),
    boxSelectionEnabled: false,
    autounselectify: true,
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
    },
  });
  cy.nodes().forEach(function(node) {
    console.log(node.position("x") + ", " + node.position("y"));
  });
}

Modules.client.showHistory = showHistory;
