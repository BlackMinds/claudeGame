const fs = require('fs')
const path = require('path')

const distPath = path.join(__dirname, '../dist')
const htmlPath = path.join(distPath, 'index.html')
const assetsPath = path.join(distPath, 'assets')

let html = fs.readFileSync(htmlPath, 'utf-8')

// 查找并内联 CSS
const cssMatch = html.match(/href="\.\/assets\/(index\.[^"]+\.css)"/)
if (cssMatch) {
  const cssFile = path.join(assetsPath, cssMatch[1])
  const cssContent = fs.readFileSync(cssFile, 'utf-8')
  html = html.replace(
    /<link rel="stylesheet" href="\.\/assets\/[^"]+\.css">/,
    `<style>${cssContent}</style>`
  )
  console.log('Inlined CSS')
}

// 查找并内联 JS，移动到 body 末尾
const jsMatch = html.match(/src="\.\/assets\/(index\.[^"]+\.js)"/)
if (jsMatch) {
  const jsFile = path.join(assetsPath, jsMatch[1])
  const jsContent = fs.readFileSync(jsFile, 'utf-8')
  // 移除原来的 script 标签
  html = html.replace(/<script[^>]*src="\.\/assets\/[^"]+\.js"><\/script>/, '')
  // 在 </body> 前插入内联脚本
  html = html.replace('</body>', `<script>${jsContent}</script>\n</body>`)
  console.log('Inlined JS at end of body')
}

// 移除 type="module" 和 crossorigin（如果还有的话）
html = html.replace(/type="module"\s*/g, '')
html = html.replace(/\s*crossorigin/g, '')

fs.writeFileSync(htmlPath, html)

console.log('Created single-file HTML')
