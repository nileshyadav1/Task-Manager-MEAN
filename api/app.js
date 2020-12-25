const express = require('express');
const app = express();
const cors = require('cors');
const {mongoose} =require('./db/mongoose');
const bodyParser = require('body-parser');

//Load all the mongoose models
const {List , Task , User} = require('./db/models');
const  jwt  = require('jsonwebtoken');

/* Load Middleware */

//Load middleware body parser
app.use(bodyParser.json());
app.use(cors());
app.options('*',cors());

//Cors Header middleware
/*
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization , x-access-token , x-refresh-token, _id');
    res.header('Access-Control-Expose-Headers','x-access-token , x-refresh-token');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization , x-access-token , x-refresh-token, _id');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH,HEAD,OPTIONS');
        return res.status(200).json({});
    };
    next();
});

*/

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );

    next();
});

// check whether the request has a valif JWT access token
let authenticate = (req , res , next)=>{
    let token = req.header('x-access-token');

    //verify JWT
    jwt.verify(token , User.getJWTSecret(), (err , decoded)=>{
        if(err){
            //there was an error
            //jwt is invalid - *DO NOT AUTHENTICATE*
            res.status(401).send(err);
        }
        else{
            //jwt is valid
            req.user_id = decoded._id;
            next();
        }
    });
}

//Verify refresh token middleware (for session verificaton)
let verifySession = (req, res, next) => {
    // grab the refresh token from the request header
    let refreshToken = req.header('x-refresh-token');

    // grab the _id from the request header
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            // user couldn't be found
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }


        // if the code reaches here - the user was found
        // therefore the refresh token exists in the database - but we still have to check if it has expired or not

        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // check if the session has expired
                if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        });

        if (isSessionValid) {
            // the session is VALID - call next() to continue with processing this web request
            next();
        } else {
            // the session is not valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }

    }).catch((e) => {
        res.status(401).send(e);
    })
}

/* End Middleware */



/* Route handlers*/


//Lists routes

/*
*GET / Lists
*Purpose : Get all lists
*/
app.get('/lists', authenticate,(req, res)=>{
   //Return an array of all the lists that belong to the authenticate user in the database
   List.find({
    _userId: req.user_id 
   }).then((lists)=>{
    res.send(lists);
   });
})

/*
*Post / Lists
*Purpose : Create a list
*/
app.post('/lists',authenticate, (req, res)=>{
   //Create a new list and return the new list document back to the user (which include the id)
   //the list info (fileds) will be passed in via the Json request body
   let title = req.body.title;
   let newList = new List({
    title,
    _userId:req.user_id
   });
   newList.save().then((listDoc)=>{
    // the full list document is returned (including _id)
    res.send(listDoc);
   })
})

/*
*Patch : /Lists/:id
*Purpose : Update a specified  list
*/
app.patch('/lists/:id',authenticate,(req,res)=>{
    //To update the specified list(list documents with the id in the URL) with the new values specified in the json body of the request
    List.findOneAndUpdate({ _id:req.params.id , _userId: req.user_id},{
        $set:req.body
    }).then(()=>{
        res.send({'message':'updated successfully'});
    })
})

/*
*DELETE : /Lists/:id
*Purpose : Delete a specified  list
*/
app.delete('/lists/:id',authenticate,(req,res)=>{
    //To Delete the specified list
    List.findOneAndRemove({
        _id : req.params.id,
        _userId:req.user_id
    }).then((removedListDoc)=>{
        res.send(removedListDoc);

        //Delete all the tasks present in the list
        deleteTaskFromList(removedListDoc._id);
    })
})

/*
*GET: /lists/:listId/tasks
*Purpose :Get all task in a specified list
*/
app.get('/lists/:listId/tasks',authenticate,(req,res)=>{
// To return all task that belong to a specific list (specified by a list)
    Task.find({
        _listId:req.params.listId
    }).then((tasks)=>{
        res.send(tasks);
    })
});

app.get('/lists/:listId/tasks/:taskId',authenticate,(req,res)=>{
    Task.findOne({
        _id:req.params.taskId,
        _listId:req.params.listId
    }).then((task)=>{
        res.send(task);
    })
});
/*
*POST: /lists/:listId/tasks
*Purpose :Create a new task in a specified list
*/
app.post('/lists/:listId/tasks',authenticate,(req,res)=>{
    //We want to create a new task in a list specified by listId

    List.findOne({
        _id: req.params.listId,
        _userId:req.user_id
    }).then((list)=>{
        if(list){
            //If the list object is valid
            //Hence the currently authenticated user can create new tasks
            return true;
        }
        //Else - the list objecct is undefined
        return false;
    }).then((canCreateTask)=>{
        if(canCreateTask){
            let newTask = new Task({
                title:req.body.title,
                _listId:req.params.listId
            });
            newTask.save().then((newTaskDoc)=>{
                res.send(newTaskDoc);
            })
        }
        else{
            res.sendStatus(404);
        }
    })
    
})

/*
*Patch: /lists/:listId/tasks/:taskId
*Purpose :To update all task in a specified list
*/
app.patch('/lists/:listId/tasks/:taskId',authenticate,(req,res)=>{
    //We want to update an existing task (specified by taskId)

    List.findOne({
        _id:req.params.listId,
        _userId:req.user_id
    }).then((list)=>{
        if(list){
            //If the list object is valid
            //Hence the currently authenticated user can update  tasks
            return true;
        }
        //Else - the list objecct is undefined
        return false;
    }).then((canUpdateTask)=>{
        if(canUpdateTask){
        // the current authenticated user can update the task
        Task.findOneAndUpdate({
            _id:req.params.taskId,
            _listId:req.params.listId
        },{
            $set:req.body
        }).then(()=>{
            res.send({ message: 'Updated Successfully'})
        })
        }
        else{
            res.sendStatus(404);
        }
    })
        
    });

/*
*DELETE : /lists/:listId/tasks/:taskid
*Purpose : Delete a specified  task in alist
*/
app.delete('/lists/:listId/tasks/:taskId',authenticate,(req,res)=>{
    //To Delete the specified task in alist
    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list)=>{
        if(list) {
            //If the list object is valid
            //Hence the currently authenticated user can update  tasks
            return true;
        }
        //Else - the list objecct is undefined
        return false;
    }).then((canDeleteTask)=> {
        if(canDeleteTask){
            Task.findOneAndRemove({
                _id: req.params.taskId,
                _listId:req.params.listId 
            }).then((removedTaskDoc)=>{
                res.send(removedTaskDoc);
            })
        }
        else{
            res.sendStatus(404);
        }
    });
    
});

/* User Routes */
/**
 * POST /users
 * Purpose : Sign up
 */
app.post('/users' , (req,res)=>{
    //User Sign up

    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(()=>{
        return newUser.createSession();

    }).then((refreshToken)=>{
        //Session created successfully - refreshToken returned.
        // To generate an access auth token for the user

        return newUser.generateAccessAuthToken().then((accessToken)=>{
            //access auth token generated successfully , now we retun an object containing the auth tokens
            return { accessToken , refreshToken }
        });
    }).then((authTokens)=>{
        //Now we construct and send the response to the user with their auth token in the header and the user object in the body
            res.header('x-refresh-token', authTokens.refreshToken)
            res.header('x-access-token', authTokens.accessToken)
            res.send(newUser);

    }).catch((e)=>{
        res.status(400).send(e);
    })
})

/**
 * POST /users/login
 * Purpose : Login
 */
app.post('/users/login', (req , res)=>{
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user)=>{
        return user.createSession().then((refreshToken)=>{
            //Session created successfully - refreshToken returned.
            // To generate an access auth token for the user
            return user.generateAccessAuthToken().then((accessToken)=>{
                //access auth token generated successfully , now we retun an object containing the auth tokens
                return {accessToken , refreshToken}
            });
        }).then((authTokens)=>{
            //Now we construct and send the response to the user with their auth token in the header and the user object in the body
        
            res.header('x-refresh-token',authTokens.refreshToken)
            res.header('x-access-token',authTokens.accessToken)
            res.send(user);
        })
    }).catch((e)=>{
        res.status(400).json({
            "msg":"User Not found!"
        });
        
    });

})

/**
 * GET /users/me/access-token
 * Purpose: generates and returns an access token
 */
app.get('/users/me/access-token', verifySession , (req, res) => {
    // we know that the user/caller is authenticated and we have the user_id and user object available to us
    req.userObject.generateAccessAuthToken().then((accessTokens) => {
        res.header('x-access-token', accessTokens).send({accessTokens});
    }).catch((e) => {
        res.status(400).send(e);
    });
})


/* HELPER METHODS */
 let deleteTaskFromList = (_listId)=>{
    Task.deleteMany({
        _listId
    }).then(()=>{
        console.log(`Task from ${_listId} were deleted`);
    })
 }


app.listen(3000, () => {
    console.log("Server is listening at port 3000");
})