const fs = require('fs');
const content = fs.readFileSync('temp_docx/word/document.xml', 'utf8');
const regex = /<w:t.*?>(.*?)<\/w:t>/g;
let match;
const texts = [];
while ((match = regex.exec(content)) !== null) {
    texts.push(match[1]);
}
fs.writeFileSync('extracted_text.txt', texts.join('\n'));
