const fs = require('fs');
const _ = require('lodash');
const makeid = require('./idgen');

function readCellDir(dir) {
  const cell1 = fs.readdirSync(`${__dirname}/public/images/${dir}`).filter(e => /.png$/.test(e)).map(e => ({
    match: e.match(/(\d+)/g).reverse(),
    name: `images/${dir}/${e}`,
    id: `${makeid(10)}-${makeid(10)}-${makeid(10)}`,
  }));

  const cellJob = {};
  cell1.forEach((e) => {
    const address = e.match.join('.');
    cellJob[address] = e;
  });
  return cellJob;
}

const jobs = {};
jobs.cell1 = readCellDir('cell1');
jobs.cell2 = readCellDir('cell2');
jobs.cell3 = readCellDir('cell3');
jobs.cell4 = readCellDir('cell4');

function getWork(qs) {
  const root = qs.root || '';
  const taskToken = qs.tasktoken || _.sample(Object.keys(jobs));
  let goldToken = taskToken;
  while (goldToken === taskToken) {
    goldToken = _.sample(Object.keys(jobs));
  }
  console.log(taskToken, `"${root}"`, goldToken);
  const images = [];
  const goldImages = [];
  const theJob = jobs[taskToken];
  const goldJob = jobs[goldToken];
  for (let i = 1; i <= 16; i += 1) {
    const address = _.compact([].concat(root, i)).join('.');
    images.push(theJob[address]);
    goldImages.push(goldJob[i]);
  }
  return {
    task: theJob.instr || 'where cells touch each other',
    taskToken,
    images: [
      images.map(image => ({ id: image.id, src: image.name, selected: false })),
      goldImages.map(image => ({ id: image.id, src: image.name, selected: false })),
    ],
  };
}

function checkWork(body) {
  return true;
}

module.exports.getWork = getWork;
module.exports.checkWork = checkWork;
