const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const User = require('../models/user')
// fonction signup pour l'enregistrement de nouveau utilisateur
// la requête doit contenir un email et un 
/* exemple :
{
    "email": "email@exemple.com",
    "password": "password"
}
*/
exports.signup = (req, res, next) => {
    console.log(req.body)
    // hash permet de hacher le mot de passe, la fonction hash est asynchrone
    // le paramètre 10 c'est le nombre de tours de hachage --> plus c'est élévé plus c'est sécurisé mais PLUS c'est long à répondre aussi
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        
      const user = new User({
        email: req.body.email,
        password: hash,
        isAdmin: false,
      });
      // save permet d'enregistrer les informations dans la bdd
      user.save()
        .then((userDoc) => res.status(201).json({ user: {
            email: userDoc.email,
            isAdmin: userDoc.isAdmin,
            token: jwt.sign({
                userId: userDoc._id 
            },
                'RANDOM_TOKEN_SECRET',
                { expiresIn: '24h' })
        } }))
        .catch(error => {
            console.log(error)
            res.status(400).json({ error })
        });
    })
    .catch(error =>{
        console.log(error)
        res.status(500).json({ error })
    })
};


// fonction login pour connecter des utilisateurs existants
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            // !user --> signifie =! de null/ si user non vide
        if (!user) {
            // 401 veut dire "unauthorized"
            return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        bcrypt.compare(req.body.password, user.password)
            .then(valid => {
            if (!valid) {
                return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }
            res.status(200).json({
                userId: user._id,
                // token d'authentification --> utilisateurs de ne se connecter qu'une seule fois à leur compte 
                token: jwt.sign(
                { 
                    userId: user._id,
                    isAdmin: user.isAdmin,
                },
                'RANDOM_TOKEN_SECRET',
                { expiresIn: '24h' })
            })
        })
        .catch(error => { 
            console.log(error)
            res.status(500).json({ message: error })
        });
            
    });
};



