const shortenId = require('./shortenId');
const mockId = {id: 'abcdefghijklmnopq'};

it('should shorten the provided id', () => {
  expect(shortenId(mockId.name).length).toBe(11);
});