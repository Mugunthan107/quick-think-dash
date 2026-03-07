const fs = require('fs');
const lines = fs.readFileSync('extracted_text.txt', 'utf8').split('\n');

const qIndices = [];
lines.forEach((line, i) => {
    if (line.includes('Question number')) qIndices.push(i);
});

const questions = [];
qIndices.forEach(idx => {
    const qObj = { original: '', type: 'Water' };

    // Look for type
    for (let i = idx; i < idx + 30 && i < lines.length; i++) {
        if (lines[i].toLowerCase().includes('mirror image')) qObj.type = 'Mirror';
        if (lines[i].toLowerCase().includes('water image')) qObj.type = 'Water';
    }

    // Look for Question string
    let foundQ = false;
    for (let i = idx; i < idx + 20 && i < lines.length; i++) {
        if (lines[i].includes('Question')) {
            // Skip tags and instructions
            for (let j = i + 1; j < i + 10 && j < lines.length; j++) {
                const clean = lines[j].replace(/<.*?>/g, '').trim();
                if (clean.length > 2 && !clean.includes('following questions') && !clean.includes('resembles')) {
                    qObj.original = clean;
                    foundQ = true;
                    break;
                }
            }
        }
        if (foundQ) break;
    }
    if (qObj.original) questions.push(qObj);
});

console.log(JSON.stringify(questions, null, 2));
