const express = require('express');
const path = require('path');
const router = express.Router();
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('./db/user.model');
const Image = require('./db/image.model');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const multer = require('multer');
const fs = require('fs');

let upload = multer({ dest: path.join(__dirname, 'upload'), fileFilter: function(req, file, callback){
  // reject upload if it is not an image, this prevents server from crashing
  if (file.mimetype.slice(0,6) !== 'image/'){
      callback(new Error("incorrect file type, server will only accept images"), false);
  }
  // allow it through otherwise
  else {
      callback(null, true);
  }
}});

const dir = path.join(__dirname, 'upload');
fs.readdir(dir, (err, files) => {
  if (err) console.log(err);
  for (const file of files) {
    fs.unlink(path.join(dir, file), err => {
      if (err) console.log(err);
    });
  }
});

const secret = process.env.JWT_SECRET || 'secret';
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/c09-virtual-desktop', { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true });

let conn = mongoose.connection;
// drop images once db starts to clear old desktop session data
conn.once('open', function() {
  Image.deleteMany({}).then(() => {
    return;
  });
});

router.use(cookieParser());
const cookieFlags = { secure: true, httpOnly: true, sameSite: true };
if (process.env.NODE_ENV === 'development') {
  cookieFlags.secure = false;
  cookieFlags.sameSite = false;
}

var isAuthorized = function(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json('Access denied');
  } else {
    jwt.verify(token, secret, function (err, decoded) {
      if (err) {
        return res.status(401).json('Access denied');
      } else {
        req.username = decoded.username;
        next();
      }
    });
  }
};

let checkUsername = function(req, res, next){
  if (!validator.isAlphanumeric(req.body.username)) return res.status(400).json("Invalid user name");
  next();
};

function generateSalt() {
  return crypto.randomBytes(16).toString('base64');
}

function generateHash(password, salt) {
  var hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  return hash.digest('base64');
}

router.post('/signup', checkUsername, function (req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username: username }).then(doc => {
    if (doc) return res.status(409).json('Username is taken');
    const user = new User(req.body);
    const salt = generateSalt();
    user.salt = salt;
    user.hash = generateHash(password, salt);
    user.save().then(res.json({}));
  }).catch((err) => {
    return res.status(500).end(err);
  });
});

router.post('/signin', checkUsername, function (req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username: username }).then(userDoc => {
    if (!userDoc) return res.status(401).json('Access denied');
    if (userDoc.hash !== generateHash(password, userDoc.salt)) return res.status(401).json('Access denied');
    const payload = { username };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    return res.cookie('token', token, cookieFlags).sendStatus(200);
  }).catch((err) => {
    return res.status(500).json(err);
  });
});

router.post('/signout', isAuthorized, function (req, res, next) {
  return res.cookie('token', 'none', cookieFlags).sendStatus(200);
});

router.get('/verifyToken', isAuthorized, function(req, res) {
  return res.sendStatus(200);
});

router.get('/user', isAuthorized, function(req, res) {
  return res.json(req.username);
});

router.post('/addImage', isAuthorized, upload.single('file'), function(req, res) {
  const roomId = req.body.roomId;
  const windowId = req.body.windowId;
  const path = req.file.path;
  const mimetype = req.file.mimetype;
  Image.updateOne({roomId: roomId, windowId: windowId}, 
    {roomId: roomId, windowId: windowId, path: path, mimetype: mimetype},
    {upsert: true}, 
    (err, doc) => {
      if (err) console.log(err);
      return res.json(doc);
    }
  );
});

router.get('/room/:rid/window/:wid', isAuthorized, function(req, res) {
  const roomId = req.params.rid;
  const windowId = req.params.wid;
  Image.findOne({roomId: roomId, windowId: windowId}, (err, img) => {
    if (err) console.log(err);
    if (!img) return res.status(404).json(`image for roomId: ${roomId} and windowId: ${windowId} not found`);
    res.setHeader('Content-Type', img.mimetype);
    return res.sendFile(img.path);
  })
});

module.exports = router;
