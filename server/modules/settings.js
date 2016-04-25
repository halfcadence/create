maxZIndex = 0;

Meteor.methods({
  getNextZIndex: function(projectId){
    maxZIndex++;
    return maxZIndex;
  }
});
