const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const floodJob = require('./flooding');
const cellJob = require('./cell');
const makeid = require('./idgen');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser('cfsecret'));
app.use(cors());
app.options('*', cors()); // include before other routes
app.use(express.static('public', {
  maxage: '10m',
}));

const fixedSecret = 'token';

const tokens = {};

app.get('/recaptcha/api/siteverify', (req, res) => {
  res.json(tokens[req.query.id]);
});

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

app.post('/captcha/attempt', (req, res) => {
  console.log(req.body);
  const taskId = req.body.taskid;

  const tokenAttempt = {
    id: `${makeid(10)}-${makeid(10)}`,
    success: false,
    hostname: req.headers.origin || 'https://', // grab from cookies?
  };

  switch (taskId) {
    default:
      tokenAttempt.success = floodJob.checkWork(req.body);
      break;
  }

  tokens[tokenAttempt.id] = tokenAttempt;

  res.json({
    token: tokenAttempt.id,
    success: tokenAttempt.success,
  });
});

app.get('/captcha', (req, res) => {
  let taskId = req.query.taskid;
  let work = null;

  switch (taskId) {
    case '1':
      work = cellJob.getWork(req.query);
      break;
    default:
      taskId = '0';
      work = floodJob.getWork(req.query);
      break;
  }

  work.taskId = taskId;
  res.json(work);
});

const server = app.listen(process.env.PORT || 3001, (err) => {
  if (err) throw err;
  console.log(`listening on ${server.address().port}`);
});
