const dateParser = require('./dateParser');

it('should parse a date object into "Sun Mar 01 2020" format', () => {
  const date = '2020-03-01';
  const result = dateParser(date);
  const expected = 'Sun Mar 01 2020';
  expect(result).toBe(expected);
});