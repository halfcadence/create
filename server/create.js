Cards = new Mongo.Collection("cards");

Meteor.publish('Cards', function(){
  return Cards.find({});
});