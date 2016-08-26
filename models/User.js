const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const schema = mongoose.Schema({
    email: { type: String, unique: true },
    password: String, name: String, studentId: Number, subscribe: Boolean
});

schema.methods.hash = (password) => bcrypt.hashSync(password);
schema.methods.check = function(password){
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', schema);
