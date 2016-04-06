Cursors = new Mongo.Collection("cursors"); //remove this line?
let projectId;
Router.route('/', {
    template: 'home'
});
Router.route('/:_id', {
  action: function () {
    this.render('application');
    projectId = this.params._id;
    var filter =  {"projectId": projectId};
    Modules.client.startCaretTracker();
    Meteor.subscribe('Carets', filter, function(){
      Modules.client.startOtherCaretTracker();
    });
    Meteor.subscribe('Cards', filter, function(){
      Modules.client.startNotecardTracker();
    });
    Meteor.subscribe('Cursors', filter, function(){
      Modules.client.startCursorTracker();
    });
  }
});

Modules.client.getProjectId = function() {
  return projectId;
};
