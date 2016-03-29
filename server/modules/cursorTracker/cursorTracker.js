Cursors = new Mongo.Collection("cursors");

Meteor.publish('Cursors', function(filter){
  return Cursors.find(filter || {});
});

let id = 0;

Meteor.methods({
  getServerTime: function () {
    let _time = new Date;
    return _time;
  }
});

//clear cursors which haven't been updated recently
Meteor.setInterval(function () {
  let tenSecondsOld = new Date();
  tenSecondsOld.setSeconds(tenSecondsOld.getSeconds() - 10)
  Cursors.remove({time:{$lt:tenSecondsOld}}),Meteor.bindEnvironment(function(error,  result) {
    console.log("clearing old shit");
  });
  //let _time = new Date();
  //clearOld(_time);
}, 5000);

let clearOld = function (time) {
  let tenSecondsOld = new Date();
  tenSecondsOld.setMinutes(tenSecondsOld.getSeconds() - 10)
  Meteor.bindEnvironment(Cursors.remove({time:{$lt:tenSecondsOld}}),Meteor.bindEnvironment(function(error,  result) {
    //if ((_time - cursor.time) / 1000 > 5000)
    //  Cursors.remove({cursor});
    console.log("clearing old shit");
  }));
}
