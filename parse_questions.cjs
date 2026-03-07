const fs = require('fs');
const content = fs.readFileSync('temp_docx/word/document.xml', 'utf8');

// Split by tables
const tables = content.split(/<w:tbl[\s>]/);
const results = [];

tables.forEach(table => {
    if (!table.includes('Question number')) return;

    const rows = table.split(/<w:tr[\s>]/);
    let qNum = '';
    let questionText = '';
    let correctOption = '';
    let type = 'Water Image'; // Default

    rows.forEach(row => {
        const textNodes = row.match(/<w:t.*?>(.*?)<\/w:t>/g) || [];
        const texts = textNodes.map(node => node.replace(/<w:t.*?>/, '').replace('</w:t>', '').trim());

        if (texts.includes('Question number')) {
            qNum = texts[texts.indexOf('Question number') + 1];
        }
        if (texts.includes('Question')) {
            // The question text might be in the same row or subsequent ones
            const qIdx = texts.indexOf('Question');
            if (texts[qIdx + 1] && texts[qIdx + 1].length > 1) {
                questionText = texts[qIdx + 1];
            } else {
                // Check next few text nodes
                for (let i = qIdx + 1; i < texts.length; i++) {
                    if (texts[i].length > 1 && !texts[i].includes('alternatives')) {
                        questionText = texts[i];
                        break;
                    }
                }
            }
            if (row.includes('mirror image')) type = 'Mirror Image';
        }

        if (texts.includes('Option 1') && texts.includes('Y')) correctOption = '1';
        if (texts.includes('Option 2') && texts.includes('Y')) correctOption = '2';
        if (texts.includes('Option 3') && texts.includes('Y')) correctOption = '3';
        if (texts.includes('Option 4') && texts.includes('Y')) correctOption = '4';
    });

    if (qNum && questionText) {
        results.push({ qNum, questionText, correctOption, type });
    }
});

fs.writeFileSync('parsed_questions.json', JSON.stringify(results, null, 2));
console.log(`Extracted ${results.length} questions.`);
