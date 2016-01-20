
//using a different library to read and parse JSON
var fs = require('fs');
//first use require to get access to the methods
var reply = require('./..');
var options = JSON.parse(fs.readFileSync(__dirname + '/options.json').toString());


reply.get(options, function(err, answers){
  console.log('\n ==== Replies:\n');
  if (err) console.log(err);
  console.log(answers);
});
