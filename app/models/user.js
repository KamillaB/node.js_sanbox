var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
 
// Thanks to http://blog.matoski.com/articles/jwt-express-node-mongoose/
 
// set up a mongoose model
var UserSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    username: { 
        type: String, 
        lowercase: true 
    },
    password: {
        type: String,
        required: true
    },
    date_created : { 
        type: Date, 
        default: Date.now 
    },
    date_updated : {
        type: Date, 
        required: true, 
        default: Date.now 
    }
});
 
UserSchema.pre('save', function (next) {
    var user = this;
    console.log('this.isModified ' + this.isModified  + ' this.isNew ' + this.isNew);
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                
                if (err) {
                    return next(err);
                }
                user.password = hash;
                console.log('user.password: ' + user.password)
                next();
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function (passw, cb) {
    //console.log('user.password: ' + this.password)
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        
        if (err) {
          return cb(err)
        }
        else if (!isMatch) {
          return cb(null, false)
        }
        else {
        return cb(null,true)
        }
    });
};
 
module.exports = mongoose.model('User', UserSchema);