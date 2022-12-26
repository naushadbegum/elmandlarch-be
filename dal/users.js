const { User } = require('../models');

const addUser = async function (userData, roleId = 1) {
    
	userData.role_id = roleId;
	const user = new User(userData);
	await user.save();

	return user;
};

module.exports = {
    addUser
}