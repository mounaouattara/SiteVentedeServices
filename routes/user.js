const express = require('express');

const router = express.Router();
MongoClient = require('mongodb').MongoClient;
const session = require('express-session');

var bcrypt = require('bcryptjs');




router.get('/loggin', (req,res) => res.render('loggin'));

router.get('/register', (req,res) => res.render('register'));

// register handle 
router.post('/register', (req,res)=>{
    const { name , email , password , password2 } = req.body;
    let errors = [];

    // check required fields

    if(!name || !email || !password || !password2){
        errors.push({msg: 'Please il manque des champs '});
    }

    // check password match 

    if(password !== password2){
        errors.push({msg: 'la confirmation de mot de passe est incorrect'});
    }

    // ckeck lenght 

    if(password.length < 5){
        errors.push({msg:'la taille du mots de passe est trop court'});
    }

    if(errors.length > 0){
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    }
    else{
        MongoClient.connect("mongodb://localhost/tutoriel", function(error, db) {
            if (error) return funcCallback(error);
            db.collection("User").findOne({email:req.body.email}, function(err,result){
                if(err){
                    res.send(err);
                }else{
                    if(result){
                        errors.push({msg:'l email existe deja '});
                        res.render('register', {
                            errors,
                            name,
                            email,
                            password,
                            password2
                        });
                    }
                    else{
                        var passwordhash = req.body.password;
                        bcrypt.genSalt(10,(err,salt)=>
                        bcrypt.hash(passwordhash,salt,(err,hash) => {
                            if(err) throw err;
                            passwordhash = hash;
                            db.collection("User").insert({name:req.body.name , email:req.body.email, password:passwordhash, date:new Date()});
                            req.flash('success_msg', 'you are now registere and tu peux te logger');
                            res.redirect('/users/loggin'); 
                        }));
                    }
                }   
            });
            
            
        }); 
        
    }
});

router.post('/login', function(req, res) {
    MongoClient.connect("mongodb://localhost/tutoriel", function(error, db) {
            if (error) return funcCallback(error);
            db.collection("User").findOne({email:req.body.email}, function(err,user){
                if(!user){
                req.flash('error', 'email nexiste pas');
                res.redirect('/users/loggin'); 
                }
                else{
                    bcrypt.compare(req.body.password,user.password,(err, isMatch)=>{
                        if (err) throw err;
                        if (isMatch) {
                            req.session.email=user._id;
                            res.render('dashboard',{user:user});
                            
                          } else {
                            req.flash('error', 'mot de pass incorrect');
                            res.redirect('/users/loggin'); 
                          }
                    });
                }
            });
    });
    
});

router.get('/logout', (req, res) => {
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/loggin');
  });

  router.get('/annonces', (req, res) => {
    console.log(req.session.email);
    MongoClient.connect("mongodb://localhost/tutoriel", function(error, db) {
        if (error) return funcCallback(error);
        db.collection('annonces').find({id_user:req.session.email}).toArray(function(err,result){
            if(err){
                res.send(err);
            }else{
                console.log(result);
            }   
         });

    });
    res.render('annonces');
  });


  router.post('/ajout', (req, res) => {
    console.log(req.session.email);
      MongoClient.connect("mongodb://localhost/tutoriel", function(error, db) {
        if (error) return funcCallback(error);
            // attention req.session.email c'est l'id de la personne qui fait l'annonce 
            db.collection("annonces").insert({about:req.body.About, id_user:req.session.email,Categorie:req.body.Categorie, SousCategorie : req.body.SousCategorie});
        });  
        res.send("bonne nuit");
  });



module.exports = router;