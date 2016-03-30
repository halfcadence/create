Cursors = new Mongo.Collection("cursors");
let projectId;
Router.route('/', {
    template: 'home'
});
Router.route('/:_id', {
  subscriptions: function() {
    this.subscribe('Cursors');
  },
  action: function () {
    this.render('application');
    projectId = this.params._id;
    var filter =  {"projectId": projectId};
    Meteor.subscribe('Cards', Session.get('filter'), function(){
      Modules.client.startNotecardTracker();
    });
    Modules.client.startCursorTracker();
  }
});

Modules.client.getProjectId = function() {
  return projectId;
};
