//example using the confirm function

//first use require to get access to the methods
var reply = require('./../');

//put your question within the first parameter variable
//put your callback function in as the second parameter 
reply.confirm('Are you sure you want to do this?', function(err, yes){
  
  //This tells the console what should be printed for viable and non-viable answers
  if (!err && yes)
    console.log("Then let's get on with it!");
  else
    console.log("Boo. Maybe next time.");

});
