Cursors = new Mongo.Collection("cursors");
let projectId;
Router.route('/', {
    template: 'home'
});
Router.route('/:_id', {
  action: function () {
    this.render('application');
    projectId = this.params._id;
    var filter =  {"projectId": projectId};
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
