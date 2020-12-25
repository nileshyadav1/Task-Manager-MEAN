const mongoose = require("mongoose");
const _ = require("lodash");
const jwt =  require("jsonwebtoken");
const { reject, findLastKey } = require("lodash");
const crypto = require("crypto");
 const { resolve } = require("path");
const bcrypt = require("bcryptjs");

// Jwt Secret
const jwtSecret = "6321226641fsdklafWaTasHIjasdkIljfmissedsklfjUd714892406HINATAorenoAI";

const UserSchema = new mongoose.Schema({
   email :{
       type:String,
       required:true,
       minlength:2,
       trim:true,
       unique:true
   },
   password:{
       type:String,
       required:true,
       minlength:8
   },
   sessions:[{
    token:{
        type:String,
        required:true
    },
    expiresAt:{
        type: Number,
        required:true
    }
   }]
});

// ** Insatance Method **
UserSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();

    //return the document except the password and sessions ( these should'nt be made available to public)
    return _.omit(userObject , ["password" , "sessions"]);
}

//** Instance to generate access Token */
UserSchema.methods.generateAccessAuthToken =  function(){
    const user =  this;
    return new Promise((resolve, reject)=>{
        jwt.sign({ _id: user._id.toHexString()}, jwtSecret, { expiresIn: "15s"}, (err, token)=>{
            if(!err){
                resolve(token);
            }
            else{
                // there is an error
                reject();
            }
        })
    })
}


// Method to generate Refresh Token
UserSchema.methods.generateRefreshAuthToken= function(){

    // this method simply return a 64byte hex string - it doesn't save it to the database . saveSessionToDatabase() does that

    return new Promise((resolve , reject)=>{
        crypto.randomBytes( 64 , (err,buf)=>{
            if(!err){
                // no error
                let token = buf.toString('hex');
                return resolve(token);
            }
        })
    })

}

UserSchema.methods.createSession=function(){
    let user = this;
    return user.generateRefreshAuthToken().then((refreshToken)=>{
        return saveSessionToDatabase(user , refreshToken);
    }).then((refreshToken)=>{
        //saved to database successfullyy
        //now return the refresh token
        return refreshToken;

    }).catch((e)=>{
        return Promise.reject("Failed to save session to database.\n"+e);
    })
}

/* Model methods (static methods)*/
UserSchema.statics.getJWTSecret= ()=>{
    return jwtSecret;
}

UserSchema.statics.findByIdAndToken = function(_id, token){

    //find user by id and token
    //used in auth middleware (verifySession)

    const User=this;
    return User.findOne({
        _id,
        'sessions.token':token
    });
}

UserSchema.statics.findByCredentials = function(email,password){
    let User = this;
     return User.findOne({ email }).then((user)=>{
         if (!user) return Promise.reject();

         return new Promise((resolve , reject)=>{
             bcrypt.compare(password , user.password,(err,res)=>{
                 if(res) resolve(user);
                 else{
                     reject();
                 }
             })
         })
     })

}

//Has refresh Token Expired method
UserSchema.statics.hasRefreshTokenExpired = (expiresAt)=>{
    let secondsSinceEpoch= Date.now()/1000;
    if(expiresAt > secondsSinceEpoch){
        //hasn't Expired
        return false;
    }
    else{
        return true;
    }
}

/* Middleware */
//Before a user document is saved , this code runs
UserSchema.pre("save" , function (next) {
    let user= this;
    let costFactor = 10;

    if(user.isModified('password')) {
        // If the password has been edited/ changd then run this code
        //Generate salt and hash password
        bcrypt.genSalt(costFactor , (err,salt) => {
            bcrypt.hash(user.password, salt , (err,hash) => {
                user.password = hash;
                next();
            })
        })
         
    } 
    else{
        next();
    }
});



/* Helper methods*/
let saveSessionToDatabase = (user , refreshToken)=>{
    // Save session to database

    return new Promise((resolve,reject)=>{
        let expiresAt = generateRefreshTokenExpiryTime();

        user.sessions.push({'token': refreshToken, expiresAt});

        user.save().then(()=>{
            //save session successffully
            return resolve(refreshToken);
        }).catch((e)=>{
            reject(e);
        })
    })
}

let generateRefreshTokenExpiryTime = ()=>{
    let daysUntilExpire = '10';
    let secondsUntilExpire = ((daysUntilExpire*24)*60)*60;
    return ((Date.now()/1000)+ secondsUntilExpire);
}

const User = mongoose.model("User",UserSchema);

module.exports = { User}