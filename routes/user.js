const express = require('express');

const router = express.Router();
MongoClient = require('mongodb').MongoClient;
const session = require('express-session');

var bcrypt = require('bcryptjs');

var ObjectId = require('mongodb').ObjectID;

var $ = require("jquery");
const delay = require('delay');

var http = require('http');
var fs = require('fs');
var cloudinary = require('cloudinary');


var favoris = []; 



router.get('/loggin', (req,res) => res.render('loggin'));
router.get('/register', (req,res) => res.render('register'));
router.get('/LClient', (req,res) => res.render('LClient'));
router.get('/RClient', (req,res) => res.render('RClient'));
router.get('/calendar', (req,res) => res.render('calendar'));
router.get('/Cannonce', (req,res) => res.render('Cannonce'));


// register handle Presta
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

// Register Client 

router.post('/RClient', (req,res)=>{
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
        res.render('RClient', {
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
            db.collection("Client").findOne({email:req.body.email}, function(err,result){
                if(err){
                    res.send(err);
                }else{
                    if(result){
                        errors.push({msg:'l email existe deja '});
                        res.render('RClient', {
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
                            db.collection("Client").insert({name:req.body.name , email:req.body.email, password:passwordhash, date:new Date()});
                            req.flash('success_msg', 'you are now registere and tu peux te logger');
                            res.redirect('/users/LClient'); 
                        }));
                    }
                }   
            });
            
            
        }); 
        
    }
});




router.post('/loggin', function(req, res) {
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

router.post('/LClient', function(req, res) {
    MongoClient.connect("mongodb://localhost/tutoriel", function(error, db) {
            if (error) return funcCallback(error);
            db.collection("Client").findOne({email:req.body.email}, function(err,user){
                if(!user){
                req.flash('error', 'email nexiste pas');
                res.redirect('/users/LClient'); 
                }
                else{
                    bcrypt.compare(req.body.password,user.password,(err, isMatch)=>{
                        if (err) throw err;
                        if (isMatch) {
                            req.session.email=user._id;
                            MongoClient.connect("mongodb://localhost/tutoriel", function(error, db) {
                            if (error) return funcCallback(error);
                            db.collection('annonces').find({}).toArray(function(err,result){
                                if(err){
                                    res.send(err);
                                }else{
                                    console.log(result);
                                    res.render('Cdash',{user:user,annonces:result});
                                }   
                            });

                        });

                            
                            
                          } else {
                            req.flash('error', 'mot de pass incorrect');
                            res.redirect('/users/LClient'); 
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
                res.render('annonces', {annonces:result});
            }   
         });

    });
    
  });

  


  router.post('/ajout', (req, res) => {
    console.log(req.session.email);
      MongoClient.connect("mongodb://localhost/tutoriel", function(error, db) {
        if (error) return funcCallback(error);
            // attention req.session.email c'est l'id de la personne qui fait l'annonce 
            db.collection("annonces").insert({about:req.body.About, id_user:req.session.email,Categorie:req.body.Categorie, SousCategorie : req.body.sousCategorie, Image : req.body.Image});
        });  
        res.redirect("javascript:history.go(-1);");
  });

  router.get('/annonces/:id', function(req,res,next){
    MongoClient.connect("mongodb://localhost/tutoriel", function(error, db) {
    if (error) return funcCallback(error);

    console.log("Connecté à la base de données 'tutoriel'");
    console.log(req.params.id);
        db.collection("annonces").findOne({"_id":ObjectId(req.params.id)},function(err,result){
            if(err){
                res.send(err);
            }
            else{
                console.log(result);
                res.render("annonce",{annonce:result});
            }
        });
    });  
}); 
router.get('/save/:id', function(req,res,next){
    MongoClient.connect("mongodb://localhost/tutoriel", function(error, db) {
        if (error) return funcCallback(error);
    
        console.log("Connecté à la base de données 'tutoriel'");
        console.log(req.session.email);
            db.collection("Client").update({"_id":ObjectId(req.session.email)},{$push : {favoris : req.params.id}} , function(err,result){
                if(err){
                    res.send(err);
                }
                else{
                    res.redirect("javascript:history.go(-1);");
                }
            });

        }); 
}); 

router.get('/saves', function(req,res,next){
    MongoClient.connect("mongodb://localhost/tutoriel", function(error, db) {
        if (error) return funcCallback(error);
    
        console.log("Connecté à la base de données 'tutoriel'");
        var count = 0;
        var fav = [];
        db.collection("Client").findOne({_id:ObjectId(req.session.email)}, function(err,docs){
            if(err){
                res.send(err);
            }
            else{
                console.log(docs.favoris.length);
                const start = async () =>{
                    await asyncForEach(docs.favoris, async(ida) =>{
                        console.log(ida);
                        db.collection("annonces").findOne({"_id":ObjectId(ida)}, function(err,res1){
                            if(err){
                                res.send(err);
                            }
                            else{ 
                                count++;
                                console.log(count);
                                console.log(res1);
                                fav.push(res1); 
                                if(count>=docs.favoris.length){
                                res.render("annonces",{annonces:fav});
                                console.log(fav);
                                    /*res.render("annonces",{annonces:fav});
                                    console.log(fav);*/
                                }  
                            }
                        });                       
                    });
                }
                start();
            }
        });
    });
});

async function asyncForEach(array, callback) {
    for (let index = 0; index <= array.length; index++) {
        if(index < array.length){
            await callback(array[index], index, array);
        }
    }
  }
  router.post('/:id/update', function(req,res,next){
   console.log('test');
   MongoClient.connect("mongodb://localhost/tutoriel", function(error, db){
        if (error) return funcCallback(error);
        console.log("test edit " + req.params.id);
        var myquery = { "_id":ObjectId(req.params.id)};
        var newvalues = { $set: {about:req.body.About, Categorie:req.body.About, SousCategorie:req.body.sousCategorie, Image:req.body.Image}};
        db.collection("annonces").updateOne(myquery,newvalues,function(err,resultat){
            if(err)throw err;
            console.log("update reussis");
            res.redirect("javascript:history.go(-1);");
            
        });

    });

});

router.get('/annonces/:id/delete', function(req,res,next){
    MongoClient.connect("mongodb://localhost/tutoriel", function(error, db){
        if (error) return funcCallback(error);

        console.log("Connecté à la base de données 'tutoriel'");
        console.log(req.params.id);   
        
        db.collection("annonces").remove({"_id":ObjectId(req.params.id)}, function(err,result){
            if(err){
                res.send(err);
            }else{
                res.redirect("javascript:history.go(-1);");
            }
        })

    });
}); 


router.post('/:id/comments', function(req,res,next){
    console.log(req.body.Commentaire);
    console.log(req.params.id);
    MongoClient.connect("mongodb://localhost/tutoriel", function(error, db){
        if (error) return funcCallback(error);        
        db.collection("annonces").update({"_id":ObjectId(req.params.id)},{$push : {comments : req.body.Commentaire}} , function(err,result){
            if(err){
                res.send(err);
            }
            else{
                res.redirect("javascript:history.go(-1);");
            }
        });

    });

}); 







module.exports = router;