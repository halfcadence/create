GhostCards = new Mongo.Collection("ghostcards");

Meteor.publish('GhostCards', function(filter){
  return GhostCards.find(filter || {});
});
