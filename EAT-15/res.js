var PythonShell = require('python-shell');

PythonShell.run('res.py', function (err) {
  if (err) throw err;
  console.log('finished');
});