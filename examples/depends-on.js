

//first use require to get access to the methods
var reply = require('./../');

var bye = function(){
  console.log("Ok, maybe next time.");
}

function get_timezone() {
  var date = new Date();
  return date.getTimezoneOffset();
}


/*This file uses the depends-on option 
    
    message : What's displayed when requesting the user's input. Optional, though helpful.
    default : Default value in case user just presses the enter key. Can be a value or a function that returns a value.
    depends_on: Key/val object containing the previous answers from which a specific entry depends on. Check the depends-on.js example for a use case.
    type : Determines the type of response that is expected to the valid. Possible values are: string, password, number, or boolean.
    options : Array of elements from which the user is expected to give a valid answer from.
    regex : Validates response against the given regex.
    allow_empty: Disallows empty answers.
    
*/

var opts = {
  planet: {
    message: 'What planet are you on?',
    options: ['Earth', 'Mars', 'Jupiter', 'Venus', 'Saturn']
  },
  not_earth_question: {
    message: 'REALLY? How are you connected to the Internet?',
    depends_on: {
      planet: { not: 'Earth' }
    }
  },
  first_question: {
    message: 'Guess the right number. Five options.',
    options: [1,2,3,4,5]
  },
  second_question: {
    message: 'Well done! Now give me the value of pi up to the 8th digit.',
    // regex: /3.14159265/,
    depends_on: {
      first_question: 4,
    }
  },
  you_win: {
    message: 'Impressive. Type your name to enter the Hall of Fame.',
    depends_on: {
      second_question: 3.14159265,
    }
  },
  try_again: {
    message: 'Game over mister. Do you want to start again?',
    type: 'boolean',
    default: true
  }
}

//Goes through all of the questions 
function start() {
  reply.get(opts, function(err, result){
    if (err || !result.try_again)
      bye();
    else
      start();
  })
}

start();
