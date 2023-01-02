const { User, BlacklistedToken } = require('../models');

const express = require("express");
const router = express.Router();
const crypto = require('crypto');

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

const getUserByCredentials = async function (formData) {
	const user = await User.where({
		username: formData.username,
		password: getHashedPassword(formData.password)
	}).fetch({
		require: false,
		withRelated: ['role']
	});
	return user ? user : false;
}

const getBlacklistedToken = async function (refreshToken) {
	const blacklistedToken = await BlacklistedToken.where({
		token: refreshToken
	}).fetch({
		require: false
	});

	return blacklistedToken
}

const addUser = async function (userData, roleId = 1) {
	
	userData.password = getHashedPassword(userData.password);

	userData.role_id = roleId;
	const user = new User(userData);
	await user.save();

	return user;
};

const isUsernameTaken = async function (username) {
	const user = await User.where({
		username: username
	}).fetch({
		require: false
	})
	return user ? true : false
}

module.exports = {
    addUser,
	getUserByCredentials,
	getBlacklistedToken,
	isUsernameTaken
}