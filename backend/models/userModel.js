const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minlength: 8,
    select: false, // this means that when we query the user from database the password will not be selected by default
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],

    validate: {
      // this works only on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Please provide the same passwords!',
    },
  },
  roles: {
    type: String,
    enum: ['user', 'manager', 'teacher'],
    default: 'user',
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//  here we are hashing password before saving to database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  // delete the passwordConfirm field after hashing the password i mean dont store that in database
  this.passwordConfirm = undefined;
  next();
});

// Set the new time for passwordChangedAt column when the resetToken is generated
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  // we set it the minus one cause sometime it take time to store it in database so if the token time be less than this time then we cant use the token
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// this middlware says only find the users that is active.
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// a function to check if the password entered by user is correct or not
// .methods is a property of the schema that allows us to add methods on the schema
// .correctPassword is a method  to check if the passwordis correct or not
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTime) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTime < changedTimeStamp;
  }
  return false;
};

// reset token and its expired date
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
