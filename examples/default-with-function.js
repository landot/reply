//example using the opts variable and get

//first use require to get access to the methods
var reply = require('./../');

var bye = function(){
  console.log('Ok, maybe next time.');
}

//you can create function to return different question properties
//in this case it grabs the get_timezone from the timezone object
function get_timezone() {
  var date = new Date();
  return date.getTimezoneOffset();
}

/*Here is a basic object (opts) with two questions
  Though this object only uses message and default there are other built in attributes  
    
    message : What's displayed when requesting the user's input. Optional, though helpful.
    default : Default value in case user just presses the enter key. Can be a value or a function that returns a value.
    depends_on: Key/val object containing the previous answers from which a specific entry depends on. Check the depends-on.js example for a use case.
    type : Determines the type of response that is expected to the valid. Possible values are: string, password, number, or boolean.
    options : Array of elements from which the user is expected to give a valid answer from.
    regex : Validates response against the given regex.
    allow_empty: Disallows empty answers.
    
*/

var opts = {
  country: {
    message: 'What country do you live in?'
  },
  timezone: {
    message: 'And your current timezone is?',
    default: get_timezone
  }
}


//Asks questions and takes in responses
reply.get(opts, function(err, result){
  if (err) return bye();

  console.log(result);
})
