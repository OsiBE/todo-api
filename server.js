var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send("Todo API Root");
});

app.get('/todos', function(req, res) {
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {$like: '%' + query.q + '%'};
	}

	db.todo.findAll({where: where}).then(function(todos){
		if (todos) {
			res.json(todos);
		} else {
			res.status(404).send('no item with that ID found!');
		}
	}, function(error) {
		res.status(500).send();
	});
	/*var filteredTodos = todos;

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(todos, {
			"completed": true
		});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(todos, {
			"completed": false
		});
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function(todo) {
			return (todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1)
		});
	}*/
});

app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId).then(function(todo){
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send('no item with that ID found!');
		}
	}, function(error) {
		res.status(500).json(error);
	});
});


app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'completed', 'description');

	db.todo.create(body).then(function(todo) {
		console.log('Success: ' + JSON.stringify(todo.toJSON()));
		res.json(todo.toJSON());
	}, function(error) {
		res.status(400).json(error);
	});
});

app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	console.log("trying to delete todo with id " + todoId);
	var match = _.findWhere(todos, {
		id: todoId
	});
	if (todoId && match) {
		todos = _.without(todos, match);
		res.json(match);
	} else {
		res.status(404).json({
			"error": "no todo found with that id"
		});
	}
});

app.put('/todos/:id', function(req, res) {
	var body = _.pick(req.body, 'completed', 'description');
	var validAttributes = {};
	var todoId = parseInt(req.params.id, 10);
	console.log("trying to delete todo with id " + todoId);
	var match = _.findWhere(todos, {
		id: todoId
	});

	if (!match) {
		return res.send(404).json({
			"error": "no todo found with that id"
		});
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	_.extend(match, validAttributes);
	res.json(match);

});

db.sequelize.sync().then(function(){
	app.listen(PORT, function() {
		console.log("express listening on " + PORT + "!");
	});

});
