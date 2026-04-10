const fs = require('fs');
let code = fs.readFileSync('src/pages/portal/AdminPanelPage.jsx', 'utf8');
let fixed = code.replace(/Awaiting call telemetry[^\0]*?<\/table>\s*<\/div>\s*<\/div>/, match => match + '\n              </div>\n           )}');
fs.writeFileSync('src/pages/portal/AdminPanelPage.jsx', fixed);
console.log('Replaced');
