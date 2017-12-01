const fs = require('fs');
const _ = require('lodash');
const makeid = require('./idgen');

function readCellDir(dir) {
  const cell1 = fs.readdirSync(`${__dirname}/public/images/${dir}`).filter(e => /^I.*.png$/.test(e)).map(e => ({
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

let status = {};
function reset() {
  status = {};
  for (let x = 0; x < 64; x += 1) {
    for (let y = 0; y < 64; y += 1) {
      status[`${x},${y}`] = {
        large: false,
        medium: false,
        small: false,
      };
    }
  }
}
reset();

const jobs = {};
jobs.car1 = readCellDir('car1');
jobs.car1.instr = 'with a car in it';

function getCoordFromRoot(root) {
  const levels = _.compact(root.split('.'));
  if (levels.length === 0) {
    return {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    };
  }
  const coords = [{
    x: Math.floor((levels[0] - 1) % 4) * Math.pow(4, 2),
    y: Math.floor((levels[0] - 1) / 4) * Math.pow(4, 2),
    w: Math.pow(4, 2),
    h: Math.pow(4, 2),
  }];
  for (let i = 1; i < levels.length; i += 1) {
    const level = levels[i];
    const pix = {
      x: coords[i - 1].x + (Math.floor((level - 1) % 4) * Math.pow(4, 2 - i)),
      y: coords[i - 1].y + (Math.floor((level - 1) / 4) * Math.pow(4, 2 - i)),
      w: Math.pow(4, (2 - i)),
      h: Math.pow(4, (2 - i)),
    };
    coords.push(pix);
  }

  return coords.splice(-1)[0];
}

function getWork(qs) {
  const root = qs.root || '';
  const taskToken = qs.tasktoken || _.sample(Object.keys(jobs));
  console.log(taskToken, root);
  const images = [];
  const theJob = jobs[taskToken];
  for (let i = 1; i <= 16; i += 1) {
    const address = _.compact([].concat(root, i)).join('.');
    images.push(theJob[address]);
  }
  return {
    task: theJob.instr || 'with a car in it',
    taskToken,
    root,
    rootImage: '/images/car1/cara.png',
    scale: Math.pow(4, _.compact(root.split('.')).length),
    translate: getCoordFromRoot(root),
    images: [
      images.map(image => ({
        id: image.id,
        src: image.name,
        selected: false,
        match: image.match,
      })),
    ],
  };
}

function checkWork(body) {
  const selected = body.images[0].filter(im => im.selected);
  selected.forEach((pixel) => {
    const root = pixel.match.length;
    const coords = [{
      x: Math.floor((pixel.match[0] - 1) % 4) * Math.pow(4, 2),
      y: Math.floor((pixel.match[0] - 1) / 4) * Math.pow(4, 2),
      w: Math.pow(4, 2),
      h: Math.pow(4, 2),
    }];

    for (let i = 1; i < root; i += 1) {
      const level = pixel.match[i];
      const pix = {
        x: coords[i - 1].x + (Math.floor((level - 1) % 4) * Math.pow(4, 2 - i)),
        y: coords[i - 1].y + (Math.floor((level - 1) / 4) * Math.pow(4, 2 - i)),
        w: Math.pow(4, (2 - i)),
        h: Math.pow(4, (2 - i)),
      };
      coords.push(pix);
    }
    const current = coords.splice(-1)[0];
    for (let x = current.x; x < current.x + current.w; x += 1) {
      for (let y = current.y; y < current.y + current.h; y += 1) {
        switch (root) {
          case 1:
            status[`${x},${y}`].large = true;
            break;
          case 2:
            status[`${x},${y}`].medium = true;
            break;
          case 3:
            status[`${x},${y}`].small = true;
            break;

          default:
        }
        
      }
    }
  });
  return true;
}

function getStatus() {
  const arr = [];
  for (let y = 0; y < 64; y += 1) {
    for (let x = 0; x < 64; x += 1) {
      const pixel = status[`${x},${y}`];
      const score = (pixel.large ? 0.1 : 0) + (pixel.medium ? 0.3 : 0) + (pixel.small ? 1 : 0);
      arr.push(score);
    }
  }
  return arr;
}

function resetStatus() {
  reset();
}

module.exports.getWork = getWork;
module.exports.checkWork = checkWork;
module.exports.getStatus = getStatus;
module.exports.resetStatus = resetStatus;
