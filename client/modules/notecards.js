Cards = new Mongo.Collection("cards");

let currentFocus = null //the textarea focused on
let currentEnabled = null
let enabledTriangle = null
let maxZIndex = 0;
//new button
Template.application.events({ //events on the page body
  "click button.blue": function (event) { //click on new button
    event.preventDefault(); // Prevent default browser form submit
    makeNewNoteCard();
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

let drawNoteCard = function(id, args){
  let arguments = args || {};
  let noteCard = new Notecard();
  noteCard.id = id;
  //set div's id to same as notecard's so notecardTracker can find it
  noteCard.div.id = id;

  //add argument fields
  $(noteCard.input).val(arguments.title || "");
  $(noteCard.description).val(arguments.body || "");
  $(noteCard.implementation).val(arguments.body2 || "");
  $(noteCard.cost).val(arguments.cost || "");
  $(noteCard.priority).val(arguments.priority || "");
  if (arguments.position === "right")
    noteCard.slide("left");
  //add functions to update database
  noteCard.input.oninput = function() {
    Cards.update(id, {
      $set: {title : $(noteCard.input).val()}
    });
  };
  noteCard.description.oninput = function() {
    Cards.update(id, {
      $set: {body : $(noteCard.description).val()}
    });
  };
  noteCard.implementation.oninput = function() {
    Cards.update(id, {
      $set: {body2 : $(noteCard.implementation).val()}
    });
  };
  noteCard.cost.oninput = function() {
    Cards.update(id, {
      $set: {cost : $(noteCard.cost).val()}
    });
  };
  noteCard.priority.oninput = function() {
    Cards.update(id, {
      $set: {priority : $(noteCard.priority).val()}
    });
  };

  //left triangle clicked when body focused
  $(noteCard.leftTriangle).on('click', function() {
    noteCard.slide("left")
    //enable and focus implementation
    setCurrentEnabled(noteCard.implementation);
    noteCard.focusImplementationAndEnableRightTriangle();
  });
  //right triangle clicked when body focused
  $(noteCard.rightTriangle).on('click', function() {
    noteCard.slide("right")
      //enable and focus implementation
    setCurrentEnabled(noteCard.description);
    noteCard.focusDescriptionAndEnableLeftTriangle();
  });
  $(noteCard.div).pep({
    constrainTo: 'window',
    elementsWithInteraction: 'textarea',
    //detects mouseUp
    startPos: {
      left: arguments.locationX || 195,
      top: arguments.locationY || 25
    },
    startThreshold: [25, 25],
    initiate: function() {
      noteCard.goToTop();
    },
    drag: function(ev, obj){
      Cards.update(id, { //set position in database...TODO: optimize this a bit with an interval
        $set: {locationX: $(noteCard.div).position().left,
               locationY: $(noteCard.div).position().top}
      });
      Modules.client.moveCaret(-100,-100); //kill the caret... eventually we need to figure out which text box it's in and move, etc...
    },
    rest: (function(ev) {
      if (!noteCard)
        return;
      Cards.update(id, { //set position in database
        $set: {locationX: $(noteCard.div).position().left,
               locationY: $(noteCard.div).position().top}
      });
    }),
    stop: (function(ev) {
      //if mouseup when drag has not started
      if (!this.started) {
        point = FindLocationOnObject(ev);
        if (point.y <= 100) { //clicked title
          setCurrentEnabled(noteCard.input);
          focusOn(noteCard.input);
        }
        //leftTriangle clicked when body is not focused
        else if (point.y >= 200 && point.x >= 400) {
          //slide left
          noteCard.slide("left");
        }
        //rightTriangle clicked when body is not focused
        else if (point.y >= 200 && point.x <= 100) {
          noteCard.slide("right");
        } else { //click in body which is disabled
          if (noteCard.position === "left") { //client view
            setCurrentEnabled(noteCard.description);
            noteCard.focusDescriptionAndEnableLeftTriangle();
          } else { //developer view
            setCurrentEnabled(noteCard.implementation);
            noteCard.focusImplementationAndEnableRightTriangle();
          }
        }
      }

      let link = $(noteCard.div);
      let position = link.position(); //cache the position
      let right = $(window).width() - position.left - link.width();
      let bottom = $(window).height() - position.top - link.height();
        if (bottom <=50 && right <= 50) {
          Cards.remove({_id : noteCard.id});
        }
    })
  });
}

//notecard object, without pep
let Notecard = function() {
  this.position = "left";
  //make a white box, add pep to it
  this.div = document.createElement("div");
  this.div.classList.add("pep");
  document.body.appendChild(this.div);

  //add title
  this.input = document.createElement('textarea');
  $(this.input).attr('spellcheck', false);
  this.input.classList.add("titleText");
  $(this.div).append(this.input);
  //add description
  this.description = document.createElement('textarea');
  $(this.description).attr('spellcheck', false);
  this.description.classList.add("bodyText");
  $(this.div).append(this.description);

  //add implementation details
  this.implementation = document.createElement('textarea');
  $(this.implementation).attr('spellcheck', false);
  this.implementation.classList.add("bodyText2");
  $(this.div).append(this.implementation);
  //somehow left triangle is the one on the right
  this.leftTriangle = document.createElement('button');
  this.leftTriangle.classList.add("leftTriangle");
  $(this.div).append(this.leftTriangle);
  //and right triangle is the one on the left
  this.rightTriangle = document.createElement('button');
  this.rightTriangle.classList.add("rightTriangle");
  $(this.div).append(this.rightTriangle);

  this.cost = document.createElement('textarea');
  $(this.cost).attr('spellcheck', false);
  this.cost.classList.add("cost");
  $(this.div).append(this.cost);

  this.priority = document.createElement('textarea');
  $(this.priority).attr('spellcheck', false);
  this.priority.classList.add("priority");
  $(this.div).append(this.priority);
};

//add functions to notecard
Notecard.prototype = {
  constructor: Notecard,
  goToTop: function() {
    $(this.div).css('z-index', ++maxZIndex);
  },
  slide: function(direction) {
    if (direction === "left") {
      $(this.implementation).css('left', 0);
      this.position = "right"; //right element showing
      Cards.update(this.id, { //set position in database
        $set: {position : "right"}
      });
    } else if (direction === "right") {
      $(this.implementation).css('left', 500);
      this.position = "left"; //left element showing
      Cards.update(this.id, { //set position in database
        $set: {position : "left"}
      });
    }
  },
  focusDescriptionAndEnableLeftTriangle: function() {
    focusOn(this.description);
    enable(this.leftTriangle);
    enabledTriangle = this.leftTriangle;
  },
  focusImplementationAndEnableRightTriangle: function() {
    focusOn(this.implementation);
    enable(this.rightTriangle);
    enabledTriangle = this.rightTriangle;
  }
}

//unfocuses when click is not on a pep
$(document).on('click', function(event) {
  if (!$(event.target).closest('.pep').length) {//if the target was not a pep
    disableCurrentEnabled();
  Modules.client.moveCaret(-100,-100); //remove caret
  }
});

/*----------------
  helper functions
  ----------------*/
//disables the currently enabled object and enables the param
let setCurrentEnabled = function(object) {
    disableCurrentEnabled()
    currentEnabled = object;
    enable(object);
  }
  //enables and disables pointer-events
let enable = function(object) {
  $(object).css('pointer-events', 'auto');
  //$(object).css('background-color', 'red');
}
let disable = function(object) {
  $(object).css('pointer-events', 'none');
  //$(object).css('background-color', 'yellow');
}
let focusOn = function(newFocus) {
    newFocus.focus();
    currentFocus = newFocus;
  }
  //disables the currentFocus so that it can be dragged
let unFocus = function() {
  if (currentFocus !== null) {
    currentFocus.blur();
    currentFocus = null;
  }
}
let disableCurrentEnabled = function() {
    if (currentEnabled != null) {
      if (!$(currentEnabled).hasClass('bodyText || bodyText2')) {
        disable(enabledTriangle)
      }
      disable(currentEnabled)
      currentEnabled = null
    }
  }
  //finds the location of a click event on an object
let FindLocationOnObject = function(ev) {
  let $div = $(ev.target);
  let $display = $div.find('.display');
  let offset = $div.offset();
  let x = ev.clientX - offset.left;
  let y = ev.clientY - offset.top;

  return {
    x,
    y
  };
}

Modules.client.drawNoteCard = drawNoteCard;
