const fs = require('fs');
const content = fs.readFileSync('temp_docx/word/document.xml', 'utf8');

const results = [];
let cursor = 0;

function nextText(startIdx) {
    const match = content.indexOf('<w:t', startIdx);
    if (match === -1) return null;
    const endTag = content.indexOf('>', match);
    const endValue = content.indexOf('</w:t>', endTag);
    return {
        text: content.substring(endTag + 1, endValue),
        nextIdx: endValue + 6
    };
}

while (true) {
    const qNumIdx = content.indexOf('Question number', cursor);
    if (qNumIdx === -1) break;

    const qObj = { original: '', correct: '', type: 'Water' };

    // Get Q Number
    let nt = nextText(qNumIdx + 15);
    while (nt && nt.text.trim().length === 0) nt = nextText(nt.nextIdx);
    qObj.qNum = nt ? nt.text.trim() : '';

    // Get Question
    const qTextSearchIdx = content.indexOf('Question', nt ? nt.nextIdx : qNumIdx);
    nt = nextText(qTextSearchIdx + 8);
    // Skip instructions
    while (nt && (nt.text.includes('In each of the following') || nt.text.trim().length <= 1)) {
        if (nt.text.includes('mirror image')) qObj.type = 'Mirror';
        nt = nextText(nt.nextIdx);
    }
    qObj.original = nt ? nt.text.trim() : '';

    // Find correct option
    const tableEnd = content.indexOf('</w:tbl>', qTextSearchIdx);
    let optCursor = qTextSearchIdx;
    while (optCursor < tableEnd) {
        const optIdx = content.indexOf('Option ', optCursor);
        if (optIdx === -1 || optIdx > tableEnd) break;

        const optMatch = content.substring(optIdx, optIdx + 8).match(/Option (\d)/);
        const optNum = optMatch ? optMatch[1] : null;

        // Check if 'Y' exists in this Option block before the next Option or end of table
        const nextOptIdx = content.indexOf('Option ', optIdx + 7);
        const searchLimit = (nextOptIdx === -1 || nextOptIdx > tableEnd) ? tableEnd : nextOptIdx;

        const yIdx = content.indexOf('>Y</w:t>', optIdx);
        if (yIdx !== -1 && yIdx < searchLimit) {
            qObj.correct = optNum;
        }
        optCursor = optIdx + 7;
    }

    results.push(qObj);
    cursor = tableEnd;
}

const filtered = results.filter(q => q.original.length > 1);
fs.writeFileSync('parsed_questions.json', JSON.stringify(filtered, null, 2));
console.log(`Extracted ${filtered.length} questions.`);
