var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

sequelize.sync().then(function() {
	console.log('Everything is synced');
	
	Todo.findById(5).then(function(todo){
		if (todo) {
			console.log(todo.toJSON());
		} else {
			console.log('no item with that ID found!');
		}
	});
	// Todo.create({
	// 	description: 'Take out trash',
		
	// }).then(function(todo) {
	// 	console.log('Finished!');
	// 	console.log(todo);
	// }).catch(function(error) {
	// 	console.log(error);
	// });

});