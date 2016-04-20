maxZIndex = 0;
console.log("maxZIndex: " + maxZIndex);

Meteor.methods({
  getNextZIndex: function(projectId){
    maxZIndex++;
    return maxZIndex;
  }
});
