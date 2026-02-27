const fs = require('fs');
const path = require('path');
const json = JSON.parse(fs.readFileSync(path.join(__dirname, '../datasets/_datasets.json'), 'utf8'));

function escapeCell(s) {
  if (s == null) return '';
  const t = String(s).replace(/\r?\n/g, ' ').replace(/\|/g, '\\|');
  return t;
}

function linksToCell(links) {
  if (!links || typeof links !== 'object') return '';
  return Object.keys(links).join(', ');
}

function taskToCell(task) {
  if (task == null) return '';
  return Array.isArray(task) ? task.join(', ') : String(task);
}

const headers = ['id', 'name', 'year', 'organs', 'staining', 'size', 'data', 'task', 'type', 'other', 'links', 'description'];
const sep = headers.map(() => '---').join(' | ');
console.log('| ' + headers.join(' | ') + ' |');
console.log('| ' + sep + ' |');

json.forEach((row) => {
  const cells = [
    escapeCell(row.id),
    escapeCell(row.name),
    escapeCell(row.year),
    escapeCell(row.organs),
    escapeCell(row.staining),
    escapeCell(row.size),
    escapeCell(row.data),
    escapeCell(taskToCell(row.task)),
    escapeCell(row.type),
    escapeCell(row.other),
    escapeCell(linksToCell(row.links)),
    escapeCell(row.description)
  ];
  console.log('| ' + cells.join(' | ') + ' |');
});
