const fs = require('fs')
const path = require('path')

const htmlPath = path.join(__dirname, '../dist/index.html')

let html = fs.readFileSync(htmlPath, 'utf-8')

// 移除 type="module" 和 crossorigin 属性
html = html.replace(/type="module"\s*/g, '')
html = html.replace(/\s*crossorigin/g, '')

fs.writeFileSync(htmlPath, html)

console.log('Fixed index.html - removed type="module"')
