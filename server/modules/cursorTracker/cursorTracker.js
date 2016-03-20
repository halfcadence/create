Cursors = new Mongo.Collection("cursors");
Meteor.publish('Cursors', function(filter){
  return Cursors.find(filter || {});
});
