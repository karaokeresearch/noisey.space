var dirTree = require('directory-tree');
var filteredTree = dirTree.directoryTree('.', ['.ogg']);

console.log(JSON.stringify(filteredTree).replace(/\\+/g,"/"));

