const { User } = require('../models');

const express = require("express");
const router = express.Router();
const crypto = require('crypto');

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

const addUser = async function (userData, roleId = 1) {
	
	userData.password = getHashedPassword(userData.password);

	userData.role_id = roleId;
	const user = new User(userData);
	await user.save();

	return user;
};

module.exports = {
    addUser
}