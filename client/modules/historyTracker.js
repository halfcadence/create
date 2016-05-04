//tracks merge and split history

let nodes;
let edges;

let startHistoryTracker = function() {
  nodes = [];
  edges = [];
  let ghostcards = GhostCards.find();
  let ghostCardsHandle = ghostcards.observeChanges({
    added: function (id, fields) {
      //use the title of the card as the display name, if possible
      //otherwise use id
      let displayName;
      if (fields.title && fields.title !== "")
        displayName = fields.title;
      else
        displayName = id;
      console.log("adding node with display name: " + displayName);
      addUniqueNode(id,displayName);
      changeDisplayName(id, displayName); //make sure name is correct
      addChildren(id,fields);
    },
    changed: function(id, fields) {
      if (fields.title !== undefined) {
          console.log("changing display name of " + id + " to " + fields.title);
          changeDisplayName(id, fields.title);
        }
    },
    removed: function (id, fields) {
      removeOutgoingAndIncomingEdges(id); //remove all related edges
      removeNode(id); //remove node
    }
  });

  let cards = Cards.find();
  let cardsHandle = cards.observeChanges({
    added: function (id, fields) {
      //use the title of the card as the display name, if possible
      //otherwise use id
      let displayName;
      if (fields.title && fields.title !== "")
        displayName = fields.title;
      else
        displayName = id;
      console.log("adding node with display name: " + displayName);
      addUniqueNode(id,displayName);
      changeDisplayName(id, displayName); //make sure name is correct
      addChildren(id,fields);
    },
    changed: function(id, fields) {
      if (fields.title !== undefined) {
        console.log("changing display name of " + id + " to " + fields.title);
        changeDisplayName(id, fields.title);
      }
    },
    removed: function (id) {
      //don't mess with the edges, we will probably still need them
      //because the ghost card has the same id
      removeNode(id);
    }
  });
}

//change the display name of a node
let changeDisplayName = function(id, name) {
  let index = findNodeWithId(id);
  if (index <= -1) return;
  //set the name as requested unless
  //it's "". then set it to the id
  nodes[index].data.displayName = name || id;
}

//adds a card's nodes and edges to the graph
let addChildren = function(id,fields) {
  //add an edge for every child
  let child;
  fields.children = fields.children || []; //sanitize childless cards
  for (let i = 0; i < fields.children.length; i++) {
    child = fields.children[i];
    addUniqueNode(child); //make sure the node is in the array
    edges.push(edge(id,child)); //add the edge
  }
}

//adds a node if unique
let addUniqueNode = function(id, displayName) {
  if (findNodeWithId(id) > -1) {//if the node already exists
    return;
  }
  nodes.push(node(id, displayName)); //add the node to the array
}

//remove edges outgoing from source
let removeOutgoingAndIncomingEdges = function(id){
  console.log("search id: " + id + ". length of edges is " + edges.length);
  for (let i = 0; i < edges.length; i++) { //go through the edges
    console.log("search id: " + id + ". found edge with source " + edges[i].data.source + " and target " + edges[i].data.target);
    if (edges[i].data.source === id || edges[i].data.target === id) {//if node begins or ends with source
      console.log("search id: " + id + ". removing edge with source " + edges[i].data.source + " and target " + edges[i].data.target);
      edges.splice(i--,1); //remove it, we have to decrement counter so that search proceeds correctly
    }
  }
}

let removeNode = function(id) {
  //search for node with certain id
  let index = findNodeWithId(id);
  if (index > -1) {
    nodes.splice(index, 1);
  }
}

//finds a node with id id
//returns -1 if not found
let findNodeWithId = function(id) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].data.id === id) //check node's id
      return i;
  }
  return -1;
}

//returns a node with the id specified
let node = function(id, displayName) {
  console.log("making a node with id " + id + " and displayName " + displayName);
  return { data: { id: id, displayName : displayName } };
}

//returns an edge with the id specified
let edge = function(source, target) {
  return { data: { source: source , target: target} };
}

Modules.client.getHistoryNodes = function() {return nodes};
Modules.client.getHistoryEdges = function() {return edges};
Modules.client.startHistoryTracker = startHistoryTracker;
