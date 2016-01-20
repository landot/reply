var rl, readline = require('readline');

/**
 * Returns an iterface to process inputs and outputs
 * @param {string} stdin - the input
 * @param {string} stdout - the output
 * @returns {readline.createInterface}
 */
var get_interface = function(stdin, stdout) {
  if (!rl) rl = readline.createInterface(stdin, stdout);
  else stdin.resume(); // interface exists
  return rl;
}

/**
 * Creates an exportable function that asks a question and saves the response
 * @param {string} message - This is where you put the question
 * @param {boolean} callback - asynchronous vs synchronous callback
 */
var confirm = exports.confirm = function(message, callback) {

  var question = {
    'reply': {
      type: 'confirm',
      message: message,
      default: 'yes'
    }
  }
  
  get(question, function(err, answer) {
    if (err) return callback(err);
    callback(null, answer.reply === true || answer.reply == 'yes');
  });

};


/**
 * Creates an exportable function that takes in answers to questions
 * Allows you to grab specific answers to questions and throws errors if the data type of an answer is not correct
 * @param {object} options - question objects with options for answers
 * @param {boolean} callback - if you want callback
 * @return {callback}
 */
var get = exports.get = function(options, callback) {

  if (!callback) return; // no point in continuing

  if (typeof options != 'object')
    return callback(new Error("Please pass a valid options object."))

  var answers = {},
      stdin = process.stdin,
      stdout = process.stdout,
      fields = Object.keys(options);
  
  //Closes the interface when done             
  var done = function() {
    close_prompt();
    callback(null, answers);
  }
  
  //Closes the prompt if it has not been closed
  var close_prompt = function() {
    stdin.pause();
    if (!rl) return;
    rl.close();
    rl = null;
  }

  /**
   * Returns the default data type of a specific question 
   * @param {Object} key - the question object
   * @param {Object} partial_answers - answer for the specific question
   * @return 
   */
  var get_default = function(key, partial_answers) {
    if (typeof options[key] == 'object')
      return typeof options[key].default == 'function' ? options[key].default(partial_answers) : options[key].default;
    else
      return options[key];
  }
  
  /**
   * Returns a boolean for the answers of yes/no true/false questions
   * @param {string} reply - The inputted response
   * @return {boolean} reply - Whether it is true or false
   */
  var guess_type = function(reply) {

    if (reply.trim() == '')
      return;
    else if (reply.match(/^(true|y(es)?)$/))
      return true;
    else if (reply.match(/^(false|n(o)?)$/))
      return false;
    else if ((reply*1).toString() === reply)
      return reply*1;

    return reply;
  }

  /**
   * Makes sure that the answer is a proper answer
   * @param {Object} key - the question object
   * @param {string} answer - the answer to the question
   * @return - returns if the answer is a correct type of response
   */
  var validate = function(key, answer) {

    if (typeof answer == 'undefined')
      return options[key].allow_empty || typeof get_default(key) != 'undefined';
    else if(regex = options[key].regex)
      return regex.test(answer);
    else if(options[key].options)
      return options[key].options.indexOf(answer) != -1;
    else if(options[key].type == 'confirm')
      return typeof(answer) == 'boolean'; // answer was given so it should be
    else if(options[key].type && options[key].type != 'password')
      return typeof(answer) == options[key].type;

    return true;

  }

  /**
   * Prints to console any incorrect answers with a list of correct answers
   * @param {Object} key - The object of the question being asked
   */
  var show_error = function(key) {
    var str = options[key].error ? options[key].error : 'Invalid value.';

    if (options[key].options)
        str += ' (options are ' + options[key].options.join(', ') + ')';

    stdout.write("\033[31m" + str + "\033[0m" + "\n");
  }

  /**
   * Creates a message variable that shows the question and options for answers
   * @param {Object} key - The object that holds the question details
   */
  var show_message = function(key) {
    var msg = '';

    if (text = options[key].message)
      msg += text.trim() + ' ';

    if (options[key].options)
      msg += '(options are ' + options[key].options.join(', ') + ')';

    if (msg != '') stdout.write("\033[1m" + msg + "\033[0m\n");
  }
  
  /**
   * @param {Boolean} prompt - if the prompt should occur
   * @param {Function} callback - asynchronous vs synchronous callback
   */
  var wait_for_password = function(prompt, callback) {

    var buf = '',
        mask = '*';

    var keypress_callback = function(c, key) {

      if (key && (key.name == 'enter' || key.name == 'return')) {
        stdout.write("\n");
        stdin.removeAllListeners('keypress');
        // stdin.setRawMode(false);
        return callback(buf);
      }

      if (key && key.ctrl && key.name == 'c')
        close_prompt();

      if (key && key.name == 'backspace') {
        buf = buf.substr(0, buf.length-1);
        var masked = '';
        for (i = 0; i < buf.length; i++) { masked += mask; }
        stdout.write('\r\033[2K' + prompt + masked);
      } else {
        stdout.write(mask);
        buf += c;
      }

    };

    stdin.on('keypress', keypress_callback);
  }

  /**
   * Recursively prompts the user the next question object if the previous answer was in a correct form
   * @param {int} index - The index of the current question in the object
   * @param {Object} curr_key - the options object
   * @param {Object} fallback - the default data type
   * @param {string} reply - The answer inputted by the user
   */
  var check_reply = function(index, curr_key, fallback, reply) {
    var answer = guess_type(reply);
    var return_answer = (typeof answer != 'undefined') ? answer : fallback;

    if (validate(curr_key, answer))
      next_question(++index, curr_key, return_answer);
    else
      show_error(curr_key) || next_question(index); // repeats current
  }

  /**
   * Returns a boolean on if the condition is within the key object
   * @param {Object} conds
   * @return {boolean}
   */
  var dependencies_met = function(conds) {
    for (var key in conds) {
      var cond = conds[key];
      if (cond.not) { // object, inverse
        if (answers[key] === cond.not)
          return false;
      } else if (cond.in) { // array 
        if (cond.in.indexOf(answers[key]) == -1) 
          return false;
      } else {
        if (answers[key] !== cond)
          return false; 
      }
    }

    return true;
  }


  /**
   * Adds the answer to the last question and prompts the next question
   * @param {int} index - the index of the current question
   * @param {} prev_key - the previous question
   * @param {} answer - the answer to the current index question
   * 
   */
  var next_question = function(index, prev_key, answer) {
    if (prev_key) answers[prev_key] = answer;

    var curr_key = fields[index];
    if (!curr_key) return done();

    if (options[curr_key].depends_on) {
      if (!dependencies_met(options[curr_key].depends_on))
        return next_question(++index, curr_key, undefined);
    }

    var prompt = (options[curr_key].type == 'confirm') ?
      ' - yes/no: ' : " - " + curr_key + ": ";

    var fallback = get_default(curr_key, answers);
    if (typeof(fallback) != 'undefined' && fallback !== '')
      prompt += "[" + fallback + "] ";

    show_message(curr_key);

    if (options[curr_key].type == 'password') {

      var listener = stdin._events.keypress; // to reassign down later
      stdin.removeAllListeners('keypress');

      // stdin.setRawMode(true);
      stdout.write(prompt);
      
      wait_for_password(prompt, function(reply) {
        stdin._events.keypress = listener; // reassign
        check_reply(index, curr_key, fallback, reply)
      });

    } else {

      rl.question(prompt, function(reply) {
        check_reply(index, curr_key, fallback, reply);
      });

    }

  }

  rl = get_interface(stdin, stdout);
  next_question(0);

  rl.on('close', function() {
    close_prompt(); // just in case

    var given_answers = Object.keys(answers).length;
    if (fields.length == given_answers) return;

    var err = new Error("Cancelled after giving " + given_answers + " answers.");
    callback(err, answers);
  });

}
