const dayjs = require('dayjs');

const generateMessage = (from, room, text) => {
  return {
    from,
    room,
    text,
    createdDate: dayjs().valueOf()
  }
};

module.exports = { generateMessage };