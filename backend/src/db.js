const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, 'data')

function getFilePath(name) {
  return path.join(DATA_DIR, `${name}.json`)
}

function readData(name) {
  const file = getFilePath(name)
  if (!fs.existsSync(file)) return []
  return JSON.parse(fs.readFileSync(file, 'utf-8'))
}

function writeData(name, data) {
  const file = getFilePath(name)
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
}

module.exports = { readData, writeData }
