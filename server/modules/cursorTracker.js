Cursors = new Mongo.Collection("cursors");
Meteor.publish('Cursors', function(filter){
  return Cursors.find(filter || {});
});

Meteor.methods({
  setCursorPosition: function(i, x, y){
    if (!i) return; //if cursorid hasn't been set
    //set position in database and time last updated
    console.log("updating a cursor at " + Date.now());
    Cursors.upsert(i, {
      $set: { locationX: x, locationY: y, updatedAt: Date.now()}
      });
  }
});

//clear cursors which haven't been updated recently
Meteor.setInterval(function () {
  let tenSecondsAgo = Date.now() - 1000 * 10;
  Cursors.remove({updatedAt:{$lt:tenSecondsAgo}});
}, 5000);
