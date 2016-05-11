//context menu for on-right-click features of pep

let contextMenuClassName;
let contextMenuItemClassName;
let contextMenuLinkClassName;
let contextMenuActive;

let taskItemClassName;
let taskItemInContext;

let clickCoords;
let clickCoordsX;
let clickCoordsY;

let menu;
let menuItems;
let menuState;
let mergeMenuOn;
let menuWidth;
let menuHeight;
let menuPosition;
let menuPositionX;
let menuPositionY;

let windowWidth;
let windowHeight;

let startContextMenu = function() {
  initializeVariables();
  //remove extra menu items
  $(menuItems[3]).remove();
  $(menuItems[4]).remove();
  contextListener();
  clickListener();
  keyupListener();
  resizeListener();
}

let initializeVariables = function() {
  contextMenuClassName = "context-menu";
  contextMenuItemClassName = "context-menu__item";
  contextMenuLinkClassName = "context-menu__link";
  contextMenuActive = "context-menu--active";

  taskItemClassName = "pep";
  menuState = 0;
  mergeMenuOn = false;

  menu = document.querySelector("#pep-context-menu");
  menuItems = menu.querySelectorAll(".context-menu__item");
}

//Listens for click events on the document body and
//checks whether they are inside a taskItem
let contextListener = function() {
  $(document).on('contextmenu', function(e) {
    taskItemInContext = clickInsideElement( e, taskItemClassName );
    if ( taskItemInContext ) {
      e.preventDefault();
      toggleMenuOn();
      positionMenu(e);
    } else {
      taskItemInContext = null;
      toggleMenuOff();
    }
  });
}

//Listens for click events on the context menu
let clickListener = function() {
  $(document).on( "click", function(e) {
    let clickeElIsLink = clickInsideElement( e, contextMenuLinkClassName );

    if ( clickeElIsLink ) {
      e.preventDefault();
      menuItemListener( clickeElIsLink , e);
    } else {
      let button = e.which || e.button;
      if ( button === 1 ) {
        toggleMenuOff();
      }
    }
  });
}

//Listens for keyup events.
let keyupListener = function() {
  $(window).keyup(function(e) {
    if ( e.keyCode === 27 ) {
      toggleMenuOff();
    }
  });
}

//Window resize event listener
let resizeListener = function() {
  $(window).resize(function(e) {
    toggleMenuOff();
  });
}

/*
helper functions
*/

//Checks if we clicked inside an element with a particular class name
let clickInsideElement = function( e, className ) {
  let el = e.srcElement || e.target;
  if ( el.classList.contains(className) )
    return el;
  else {
    while ( el = el.parentNode ) {
      if ( el.classList && el.classList.contains(className))
        return el;
    }
  }
  return false;
}

//gets exact position of event
let getPosition = function(e) {
  let posx = 0;
  let posy = 0;

  if (!e) {
    let e = window.event;
  }

  if (e.pageX || e.pageY) {
    posx = e.pageX;
    posy = e.pageY;
  } else if (e.clientX || e.clientY) {
    posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }

  return {
    x: posx,
    y: posy
  }
}

//Turns the custom context menu on.
let toggleMenuOn = function() {
  if ( menuState !== 1 ) {
    menuState = 1;
    menu.classList.add( contextMenuActive );
  }
}

//Turns the custom context menu off.
let toggleMenuOff = function() {
  if ( menuState !== 0 ) {
    menuState = 0;
    menu.classList.remove( contextMenuActive );
    stopAnticipatingMerge();
  }
}

let stopAnticipatingMerge = function() {
  turnMergeMenuOff(); //make sure we are in the default menu
  $(".pep").off( ".merge"); //remove merge listener
}

//Positions the menu properly.
let positionMenu = function(e){
  clickCoords = getPosition(e);
  clickCoordsX = clickCoords.x;
  clickCoordsY = clickCoords.y;

  menuWidth = menu.offsetWidth + 4;
  menuHeight = menu.offsetHeight + 4;

  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;

  if ( (windowWidth - clickCoordsX) < menuWidth ) {
    menu.style.left = windowWidth - menuWidth + "px";
  } else {
    menu.style.left = clickCoordsX + "px";
  }

  if ( (windowHeight - clickCoordsY) < menuHeight ) {
    menu.style.top = windowHeight - menuHeight + "px";
  } else {
    menu.style.top = clickCoordsY + "px";
  }
}

//Dummy action function that logs an action when a menu item link is clicked
let menuItemListener = function (link, event) {
  switch (link.getAttribute("data-action")) {
    case "Split":
      Modules.client.splitNoteCard($(taskItemInContext).attr('id'));
      toggleMenuOff();
      break;
    case "Merge":
      anticipateMerge($(taskItemInContext).attr('id'));
      break;
    case "History":
      Modules.client.showHistory();
      toggleMenuOff();
      break;
    default:
      toggleMenuOff();
  }
}

//anticipate a merge
//cardId: the card clicked which may possibly be merged
let anticipateMerge = function(cardId) {
  turnMergeMenuOn(); //show the merge menu
  $(".pep").on( "click.merge", function(event) {
    Modules.client.mergeNoteCards([cardId,$(this).attr("id")]);
  });
}

let turnMergeMenuOff = function() {
  if (!mergeMenuOn)
    return;
  //remove current list items
  $(menuItems[3]).remove();
  $(menuItems[4]).remove();
  //add new list items
  $(menu).append(menuItems[0]);
  $(menu).append(menuItems[1]);
  $(menu).append(menuItems[2]);
  mergeMenuOn = false;
}

let turnMergeMenuOn = function() {
  if (mergeMenuOn)
    return;
  //remove current list items
  $(menuItems[0]).remove();
  $(menuItems[1]).remove();
  $(menuItems[2]).remove();
  //add new list items
  $(menu).append(menuItems[3]);
  $(menu).append(menuItems[4]);
  mergeMenuOn = true;
}

Modules.client.startPepContextMenu = startContextMenu;
