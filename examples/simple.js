
var options = {
	computer_type: 'laptop',
	operating_system: 'linux'
}

//use require to get access to the methods
var reply = require('./..');

reply.get(options, function(err, answers){
	//prints the inputted results
    console.log("\nResults:");
	console.log(answers);
});
