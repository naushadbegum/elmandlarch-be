const express = require('express')
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const userDataLayer = require('../../dal/users');

const {checkIfAuthenticatedJWT} = require('../../middlewares');

const generateAccessToken = (
    username,id, role_id, expiresIn
    ) => {
    return jwt.sign({
        'username': username,
        'id': id,
        'role_id': role_id
    }, secret, {
        expiresIn: expiresIn
    });
}

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

const { User } = require('../../models');

router.get('/username_taken', async function (req,res){
    const usernameExists = await userDataLayer.isUsernameTaken(req.query.username);
    if (usernameExists){
        res.send({message: 'already exist'})
    }else{
        res.send({message: 'available'})
    }
})



router.post('/login', async function(req,res){
    const userData = {
        username: req.body.username,
        password: req.body.password
    };

    const user = await userDataLayer.getUserByCredentials(userData);

    if (!user || user.get('role_id') != 1){
        res.send({error: 'Invalid username and/or password'});
        return
    }

    const accessToken = generateAccessToken(
        user.get('username'),
        user.get('id'),
        user.get('role_id'),
        process.env.TOKEN_SECRET,
        '1h'
    );

    const refreshToken = generateAccessToken(
        user.get('username'),
        user.get('id'),
        user.get('role_id'),
        process.env.REFRESH_TOKEN_SECRET,
        '7d'
    )
    
    res.send({
        accessToken: accessToken,
        refreshToken: refreshToken
    })
})

router.post('/refresh', checkIfAuthenticatedJWT, async function (req, res){
    const refreshToken = req.body.refreshToken;

    if(refreshToken){
        const blacklistedToken = await userDataLayer.getBlacklistedToken(
            refreshToken
        );
        if(blacklistedToken){
            res.sendStatus(400)
        return;
    };

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        function(err, tokenData){
            if(!err){
                const accessToken = generateAccessToken(
                    tokenData.username,
                    tokenData.id,
                    tokenData.role_id,
                    process.env.TOKEN_SECRET,
                    '1h'
                );
                res.send({accessToken: accessToken});
            }else{
                res.sendStatus(400);
            }
        }
    );
    } else {
    res.send({error: 'no refresh token found'})
}
});

router.get('/profile', checkIfAuthenticatedJWT, async(req,res)=>{
    const user = req.user;
    res.send(user);
})

module.exports = router;