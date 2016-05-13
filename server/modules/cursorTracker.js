Cursors = new Mongo.Collection("cursors");
Meteor.publish('Cursors', function(filter){
  return Cursors.find(filter || {});
});

Meteor.methods({
  setCursorPosition: function(cursorId, x, y, projectId,color){
    if (!cursorId) return; //if cursorid hasn't been set
    //set position in database and time last updated
    Cursors.upsert(cursorId, {
      $set: { locationX: x, locationY: y, projectId: projectId, updatedAt: Date.now(),color: color}
      });
  }
});

//clear cursors which haven't been updated recently
Meteor.setInterval(function () {
  let fiveSecondsAgo = Date.now() - 1000 * 5;
  Cursors.remove({updatedAt:{$lt:fiveSecondsAgo}});
}, 5000);
