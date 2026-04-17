const runner = require('./sandbox/runners/pythonRunner');
runner.run('python', 'a, b = map(int, input().split())\nprint(a+b)', '10 20', 'test1').then(console.log).catch(console.error);
