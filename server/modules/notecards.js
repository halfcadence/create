Cards = new Mongo.Collection("cards");

Meteor.publish('Cards', function(filter){
  return Cards.find(filter || {});
});
