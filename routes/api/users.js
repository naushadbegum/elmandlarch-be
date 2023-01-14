const express = require('express')
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const userDataLayer = require('../../dal/users');
const {checkIfAuthenticatedJWT} = require('../../middlewares');

router.get('/', async(req,res)=>{
    res.send(await userDataLayer.getAllUsers())
})

const generateAccessToken = (email, id, role_id, secret, expiresIn) => {
    return jwt.sign({
        'email': email,
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

// router.get('/username_taken', async function (req,res){
//     const usernameExists = await userDataLayer.isUsernameTaken(req.query.username);
//     if (usernameExists){
//         res.json({
//             'message': 'already exist'
//         })
//     }else{
//         res.json({
//             'message': 'available'
//         })
//     }
// })

router.post('/register', async function (req, res){
    let error = {};

    const name = req.body.name;
    if(name.length == 0 || name.length > 200){
            error.name = 'Name must be less than 200 characters'
    }

    const username = req.body.username;
    if(username.length == 0 || username.length > 200){
            error.length = 'Username must be less than 200 characters'
    }

    const email = req.body.email;
    if(!email.includes("@") || !email.includes(".")){
            error.email = 'Enter a valid email eg.sample@sample.com'
    }

    const password = req.body.password;
    if(password.length == 0 || password.length > 200){
        error.password = 'Password must be less than 200 characters'
    }

    const contact_number = req.body.contact_number;
    if(contact_number.length == 0 || contact_number.length > 20){
        error.contact_number= 'Contact number must be less than 20 characters'
    }

    if (Object.keys(error).length > 0){
        sendResponse(res, 400, error);
        return
    }

    const userData = {
        name,
        username,
        password,
        email,
        contact_number
    };

    await userDataLayer.addUser(userData, 1);
    
    res.send({
        message: 'User registered!'
    })
})



router.post('/login', async function(req,res){
    console.log("correct route", process.env.TOKEN_SECRET)
    const userData = {
        email: req.body.email,
        password: req.body.password
    };

    const user = await userDataLayer.getUserByCredentials(userData);

    if (!user || user.get('role_id') != 1){
        res.json({
            'error': 'Invalid email and/or password'
        });
        return
    }

    else {
    const accessToken = generateAccessToken(
        user.get('email'),
        user.get('id'),
        user.get('role_id'),
        process.env.TOKEN_SECRET,
        '1h'
    );

    const refreshToken = generateAccessToken(
        user.get('email'),
        user.get('id'),
        user.get('role_id'),
        process.env.REFRESH_TOKEN_SECRET,
        '7d'
    )
    
    res.json({
        'accessToken': accessToken,
        'refreshToken': refreshToken
    })
}
})

router.post('/refresh', checkIfAuthenticatedJWT, async function (req, res){
    const refreshToken = req.body.refreshToken;

    if(refreshToken){
        const blacklistedToken = await userDataLayer.getBlacklistedToken(
            refreshToken
        );
        if(blacklistedToken){
            res.status(400)
        return;
    };

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        function(err, tokenData){
            if(!err){
                const accessToken = generateAccessToken(
                    tokenData.email,
                    tokenData.id,
                    tokenData.role_id,
                    process.env.TOKEN_SECRET,
                    '1h'
                );
                res.json({
                    'accessToken': accessToken
                });
            }else{
                res.status(400);
            }
        }
    );
    } else {
    res.json({
        'error': 'no refresh token found'
    })
}
});

router.get('/profile', checkIfAuthenticatedJWT, async(req,res)=>{
    const user = req.user;
    res.json({
        "profile": user
    });
})


router.post('/logout', async function (req,res){
    const refreshToken = req.body.refreshToken;
    if (refreshToken) {
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async function (err, tokenData){
                if (!err){
                    await userDataLayer.addBlacklistedToken(refreshToken);

                res.send({message: 'See you soon!'})
                }
            }
        );
    } else {
        res.send({error: 'no refresh token found'})
    }
})
module.exports = router;