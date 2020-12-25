//To combine all the models , so it is easier to import them from other files
const {List} = require('./list.model');
const {Task} = require('./task.model');
const {User} = require('./user.model');

module.exports={
    List,
    Task,
    User
}
