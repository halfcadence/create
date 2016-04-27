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
    layout: {
      name: 'dagre'
    },
    style: [
      {
         selector: 'node',
         style: {
           'content': 'data(displayName)',
           'text-opacity': 1,
           'text-valign': 'center',
           'text-halign': 'right',
           'background-color': '#00ccd6'
         }
       },
       {
         selector: 'edge',
         style: {
           'width': 4,
           'target-arrow-shape': 'triangle',
           'line-color': '#a7f5f8',
           'target-arrow-color': '#a7f5f8'
         }
       }
    ],
    elements: {
      nodes: Modules.client.getHistoryNodes(),
      edges: Modules.client.getHistoryEdges()
    },
  });
}

Modules.client.showHistory = showHistory;
