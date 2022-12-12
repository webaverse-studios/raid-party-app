const prop = 'tree_0_0';
const prop2 = prop.slice(0, -1) + (prop.endsWith('1') ? '0' : '1');
console.log(prop2); // tree_0_
