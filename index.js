const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const _ = require('lodash');

const floodedPhotos = fs.readdirSync(`${__dirname}/public/images/flooded`).map(filename => `images/flooded/${filename}`);
const floodingPhotos = fs.readdirSync(`${__dirname}/public/images/flooding`).map(filename => `images/flooding/${filename}`);

const checkWork = require('./checkWork').check;

const app = express();
app.use(bodyParser.json());
app.use(cookieParser('cfsecret'));
app.use(cors());
app.options('*', cors()); // include before other routes
app.use(express.static('public'));

const fixedSecret = 'token';

const tokens = {};

app.post('/recaptcha/api/siteverify', (req, res) => {
  const secret = req.body.secret;
  const responseToken = req.body.response;

  const answer = {
    success: false,
    challenge_ts: new Date().toISOString(),
    hostname: 'https://',
    'error-codes': [],
  };

  if (!secret) {
    answer['error-codes'].push('missing-input-secret');
  }
  if (secret !== fixedSecret) {
    answer['error-codes'].push('invalid-input-secret');
  }
  if (!responseToken) {
    answer['error-codes'].push('missing-input-response');
  }

  if (answer['error-codes'].length > 0) {
    return res.json(answer);
  }

  if (!tokens[responseToken]) {
    answer.success = tokens[responseToken].success;
  }

  return res.json(answer);
});

function makeid(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

app.post('/captcha/attempt', (req, res) => {
  console.log(req.body);
  console.log(req.headers);
  const tokenAttempt = {
    id: `${makeid(10)}-${makeid(10)}`,
    success: checkWork(),
    hostname: req.headers.origin || 'https://', // grab from cookies?
  };

  tokens[tokenAttempt.id] = tokenAttempt;

  res.json(tokenAttempt.id);
});

app.get('/captcha', (req, res) => {
  const floodedSample = _.sampleSize(floodedPhotos, 5);
  const floodingSample = _.sampleSize(floodingPhotos, 4);

  const aSample = [].concat(floodedSample, floodingSample);
  res.json({
    task: 'flooded areas',
    images: aSample.map((image, index) => ({ id: index.toString(), src: image, selected: false })),
  });
});

const server = app.listen(process.env.PORT || 3001, (err) => {
  if (err) throw err;
  console.log(`listening on ${server.address().port}`);
});
