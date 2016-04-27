Cursors = new Mongo.Collection("cursors");
Cards = new Mongo.Collection("cards");
GhostCards = new Mongo.Collection("ghostcards");

let projectId;
let userColor = 'black';
Router.route('/', {
    template: 'home' //render home template
});
Router.route('/:_id', {
  action: function () {
    this.render('application'); //render application template

    //find out which pretty color the gods have given us
    Meteor.call("getPrettyColor", function (error,result) {
      userColor = result;
    });

    projectId = this.params._id;
    var filter =  {"projectId": projectId};
    Meteor.subscribe('Carets', filter, function(){
      Modules.client.startCaretTracker();
    });
    Meteor.subscribe('Cards', filter, function(){
      Modules.client.startNotecardTracker();
    });
    Meteor.subscribe('Cursors', filter, function(){
      Modules.client.startCursorTracker();
    });
    Meteor.subscribe('GhostCards', filter, function(){
      Modules.client.startHistoryTracker();
    });
  }
});

//callback for rendered application
Template.application.rendered = function() {
  //needs context menu to be rendered to query it
  Modules.client.startContextMenu();
}

Modules.client.getProjectId = function() {
  return projectId;
};

Modules.client.getUserColor = function() {
  return userColor;
};
