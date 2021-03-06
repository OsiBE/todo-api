var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var bcrypt = require('bcrypt');
var db = require('./db.js');
var middleware = require('./middleware.js')(db);
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;


app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send("Todo API Root");
});

app.get('/todos', middleware.requireAuthentication, function(req, res) {
    var query = req.query;
    var where = {
        userId: req.user.get('id')
    };

    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = { $like: '%' + query.q + '%' };
    }

    db.todo.findAll({ where: where }).then(function(todos) {
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

app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoId = parseInt(req.params.id, 10);

    db.todo.findOne({
        where: {
          id: todoId,
            userId: req.user.get('id')  
        }  
    }).then(function(todo) {
        if (!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(404).send('no item with that ID found!');
        }
    }, function(error) {
        res.status(500).json(error);
    });
});


app.post('/todos', middleware.requireAuthentication, function(req, res) {
    var body = _.pick(req.body, 'completed', 'description');

    db.todo.create(body).then(function(todo) {
       req.user.addTodo(todo).then(function () {
            return todo.reload();
        }).then(function (todo) {
            res.json(todo.toJSON());
        });
    }, function(e) {
        res.status(400).json(e);
    });
});

app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    console.log("trying to delete todo with id " + todoId);
    db.todo.destroy({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then(function(todo) {
        if (todo === 0) {
            res.status(404).send('no item with that ID found!');

        } else {
            res.status(204).send(); // 204 weil man keine daten zurück gibt
        }
    }, function(error) {
        res.status(500).json(error);
    });
    /*var match = _.findWhere(todos, {
    	id: todoId
    });
    if (todoId && match) {
    	todos = _.without(todos, match);
    	res.json(match);
    } else {
    	res.status(404).json({
    		"error": "no todo found with that id"
    	});
    }*/
});

app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var body = _.pick(req.body, 'completed', 'description');
    var attributes = {};
    var todoId = parseInt(req.params.id, 10);
    console.log("trying to delete todo with id " + todoId);

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    db.todo.findOne({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then(function(todo) {
        if (todo) {
            todo.update(attributes).then(function() {
                res.status(200).json(todo.toJSON());
            }, function(error) {
                res.status(400).json(error);
            });
        } else {
            res.status(404).send();
        }
    }, function(error) {
        res.status(500).json(error);
    });
});

app.post('/users', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function(user) {
        console.log('Success: ' + JSON.stringify(user.toPublicJSON()));
        res.json(user.toPublicJSON());
    }, function(error) {
        res.status(400).json(error);
    });
});

app.post('/users/login', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');
    var userInstance;

    db.user.authenticate(body).then(function(user) {
    	var token = user.generateToken('authentication');
        userInstance = user;
        return db.token.create({
            token: token
        });

    	/*if (token) {
    		res.header('Auth', token).json(user.toPublicJSON());
    	} else {
    		res.status(401).send();
    	}*/
    }).then(function(tokenInstance) {
        res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
    }).catch(function(error) {
    	res.status(401).send();
    });

    
});

app.delete('/users/login', middleware.requireAuthentication, function(req, res) {
    req.token.destroy().then(function() {
        res.status(204).send();
    }, function(error) {
        res.status(500).send();
    });
});

db.sequelize.sync({force: true}).then(function() {
    app.listen(PORT, function() {
        console.log("express listening on " + PORT + "!");
    });

});
