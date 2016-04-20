Settings = new Mongo.Collection("settings");

Meteor.publish('Settings', function(filter){
  return Settings.find(filter || {});
});
maxZIndex = 0;
console.log("maxZIndex: " + maxZIndex);

Meteor.methods({
  getNextZIndex: function(projectId){
    //set new max Index
    maxZIndex++;
    console.log("maxZIndex:" + maxZIndex);
    return maxZIndex;
  }
});
