Carets = new Mongo.Collection("carets");
Meteor.publish('Carets', function(filter){
  return Carets.find(filter || {});
});

Meteor.methods({
  setCaretPosition: function(caretId, x, y, projectId,color){
    if (!caretId) return; //if cursorid hasn't been set
    //set position in database and time last updated
    Carets.upsert(caretId, {
      $set: { locationX: x, locationY: y, projectId: projectId, updatedAt: Date.now(), color: color}
      });
  }
});

//clear cursors which haven't been updated recently
Meteor.setInterval(function () {
  //let twoMinutesAgo = Date.now() - 1000 * 60 * 2;
  //Carets.remove({updatedAt:{$lt:twoMinutesAgo}});
  let tenSecondsAgo = Date.now() - 1000 * 10;
  Carets.remove({updatedAt:{$lt:tenSecondsAgo}});
}, 5000);
