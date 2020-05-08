const shortenId = idObject => `${String(idObject).substring(0, 9) +
  Math.floor(Math.random() * 100)}`;

module.exports = shortenId;