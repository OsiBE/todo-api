module.exports = function(sequelize, DataTypes) {
	return sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
         	allowNull: false,
         	unique: true,
         	validate: {
         		isEmail: true
         	}
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [7, 100]
			}
		}
	}, {
		hooks: {
			beforeValidate: function(user) {
				console.log("beforeValidate aufgerufen");
				if (typeof user.email === "string") {
					console.log("typeof gedöns true");
					user.email = user.email.toLowerCase();
				}
			}
		}
	});
};