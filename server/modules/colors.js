//jankiest color wheel. TODO: plz improve with user support if possible

let colors = ['#A2D7D8', '#BFE1BF', '#FCD059', '#DE5842'];

let currentColor = 0;
Meteor.methods({
  getPrettyColor: function(){
    currentColor = [currentColor + 1] % colors.length;
    return colors[currentColor];
  }
});
