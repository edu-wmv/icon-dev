// ENV TEST

if (process.env.API_KEY) {
  console.log('API_KEY: ' + process.env.API_KEY);
} else {
  console.log('API_KEY not found');
}