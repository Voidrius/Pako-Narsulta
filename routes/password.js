const express = require('express');
const hbs = require('nodemailer-express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path');
const crypto = require('crypto');


const asyncMiddleware = require('../middleware/asyncMiddleware');
const UserModel = require('../models/userModel');

const email = process.env.EMAIL;
const pass = process.env.PASSWORD;


const smtpTransport = nodemailer.createTransport({
  service: process.env.EMAIL_PROVIDER,
  auth: {
    user: email,
    pass: pass
  }
});

const handlebarsOptions = {
  viewEngine: {
    layoutsDir: "./templates/", // location of handlebars templates
    defaultLayout: 'forgot-password', //default layout. This is necessary if you don't want to use main.handlebars
  },
  viewPath: path.resolve('./templates/'),
  extName: '.html'
};

smtpTransport.use('compile', hbs(handlebarsOptions));

const router = express.Router();

router.post('/forgot-password', asyncMiddleware(async (req, res, next) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    res.status(400).json({ 'message': 'invalid email' });
    return;
  }

  // create user token
  const buffer = crypto.randomBytes(20);
  const token = buffer.toString('hex');

  // update user reset password token and exp
  await UserModel.findByIdAndUpdate({ _id: user._id }, { resetToken: token, resetTokenExp: Date.now() + 600000 });

  // send user password reset email
  const data = {
    to: user.email,
    from: email,
    template: 'forgot-password',
    subject: 'Pako Narsulta Password Reset',
    context: {
      url: `http://aa3739-pako-narsulta.herokuapp.com/reset-password.html?token=${token}`,
      name: user.name,
      from: email
    }
  };
  await smtpTransport.sendMail(data);

  res.status(200).json({ message: 'An email has been sent to your email. Password reset link is only valid for 10 minutes.' });
}));

router.post('/reset-password', asyncMiddleware(async (req, res, next) => {
  const user = await UserModel.findOne({ resetToken: req.body.token, resetTokenExp: { $gt: Date.now() } });
  if (!user) {
    res.status(400).json({ 'message': 'invalid token' });
    return;
  }

  // ensure provided password matches verified password
  if (req.body.password !== req.body.verifiedPassword) {
    res.status(400).json({ 'message': 'passwords do not match' });
    return;
  }

  // update user model
  user.password = req.body.password;
  user.resetToken = undefined;
  user.resetTokenExp = undefined;
  await user.save();

  // send user password update email
  const data = {
    to: user.email,
    from: email,
    template: 'reset-password',
    subject: 'Pako Narsulta Password Reset Confirmation',
    context: {
      name: user.name
    }
  };
  await smtpTransport.sendMail(data);

  res.status(200).json({ message: 'password updated' });
}));

module.exports = router;