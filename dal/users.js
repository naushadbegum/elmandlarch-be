const { User, BlacklistedToken } = require('../models');

const express = require("express");
const router = express.Router();
const crypto = require('crypto');

const getAllUsers = async () => {
	return await User.fetchAll();
}

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

const getUserByCredentials = async function (formData) {
	const user = await User.where({
		email: formData.email,
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

const addBlacklistedToken = async function (refreshToken){
	const token = new BlacklistedToken();
	token.set('token', refreshToken);
	token.set('created_date', new Date());
	await token.save();

	return token;
}

// const isUsernameTaken = async function (username) {
// 	const user = await User.where({
// 		username: username
// 	}).fetch({
// 		require: false
// 	})
// 	return user ? true : false
// }

module.exports = {
	getAllUsers,
    addUser,
	getUserByCredentials,
	getBlacklistedToken,
	addBlacklistedToken,
}