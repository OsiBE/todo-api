var express = require('express');
var bodyParser = require ('body-parser');
var _ = require('underscore');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send("Todo API Root");
});

app.get('/todos', function(req, res) {
	res.json(todos);
});

app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var match = _.findWhere(todos, {id: todoId});
	/*var match;
	todos.forEach(function(todo) {
		if (todo.id === todoId) {
			match = todo;
		}
	});*/

	if (match) {
		res.json(match);
	} else {
		res.status(404).send();
	}
	//res.status(404).send();
	//res.send('Asking for todo with id of '+ req.params.id);
	//res.json(todos[req.params.id-1]);
});


app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'completed', 'description');
	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		console.log("Bad request!");
		return res.status(400).send();
	}
	console.log("Good request... proceeding!");
	body.description = body.description.trim();
	body.id = todoNextId;
	todoNextId++;
	todos.push(body);
	res.json(body);
});

app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	console.log("trying to delete todo with id " + todoId);
	var match = _.findWhere(todos, {id: todoId});
	if (todoId && match) {
		todos = _.without(todos, match);
		res.json(match);
	} else {
		res.status(404).json({"error": "no todo found with that id"});
	}
});

app.listen(PORT, function(){
	console.log("express listening on " + PORT + "!");
});