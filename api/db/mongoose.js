// This file will handle connection logic to mongoDB database

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/Task-Manager',{ useNewUrlParser : true, useUnifiedTopology: true}).then(()=>{
    console.log("connected to MongoDb Successfully ");
}).catch((e)=>{
    console.log("Error while trying to connect to MongoDb");
    console.log(e);
});

// To prevent Deprecaton Warnings (from mongodb native driver)
mongoose.set('useCreateIndex',true);
mongoose.set('useFindAndModify',false);


module.exports={
    mongoose
}; 