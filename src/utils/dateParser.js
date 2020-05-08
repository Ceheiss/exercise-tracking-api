const dateParser = (dateObject) => {
  const parsedDate = [...new Date(dateObject).toGMTString().substring(0, 16)]
    .filter((char) => char !== ",")
    .join("");
  const dateComponents = parsedDate.split(" ");
  return `${dateComponents[0]} ${dateComponents[2]} ${dateComponents[1]} ${dateComponents[3]}`;
};

module.exports = dateParser;