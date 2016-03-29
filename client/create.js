Cursors = new Mongo.Collection("cursors");

Router.route('/', {
    //template: 'home'
});
Router.route('/:_id', {
  subscriptions: function() {
    this.subscribe('Cursors');
  },
  action: function () {
    //this.render('application');
    projectId = this.params._id;
    var filter =  {"projectId": projectId};
    Modules.client.startCursorTracker();
  }
});
