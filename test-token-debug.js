// Test token debugging
const jwt = require('jsonwebtoken');

// Test with a sample token format
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGRjNjJmZTUyM2FiZGI5YWJjYTQ2NDEiLCJyb2xlIjoidXNlciIsImlhdCI6MTczNjA5MjQwMCwiZXhwIjoxNzM2Njk3MjAwfQ.test';

console.log('Testing token format...');

try {
  const decoded = jwt.verify(testToken, 'DatAmArt');
  console.log('Token decoded successfully:', decoded);
} catch (error) {
  console.log('Token verification failed:', error.message);
}

// Test with a properly formatted token
const validToken = jwt.sign(
  { 
    userId: '68dc62fe523abdb9abca4641',
    role: 'admin' 
  },
  'DatAmArt',
  { expiresIn: "7d" }
);

console.log('\nValid token created:', validToken);

try {
  const decoded = jwt.verify(validToken, 'DatAmArt');
  console.log('Valid token decoded:', decoded);
} catch (error) {
  console.log('Valid token verification failed:', error.message);
}
