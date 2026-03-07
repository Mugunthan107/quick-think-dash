const fs = require('fs');
const lines = fs.readFileSync('extracted_text.txt', 'utf8').split('\n').map(l => l.trim());
const questions = [];
let currentQ = null;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === 'Question number') {
        if (currentQ && currentQ.original) questions.push(currentQ);
        currentQ = { qNum: lines[i + 1], type: 'Water', original: '', correct: '' };
    }

    if (currentQ && line === 'Question') {
        let j = i + 1;
        // Skip empty lines or the generic instruction block
        while (j < lines.length && (lines[j].length < 2 || lines[j].includes('In each of the following') || lines[j].includes('<w:'))) {
            if (lines[j].includes('mirror image')) currentQ.type = 'Mirror';
            j++;
        }
        // The next text line should be our question string
        while (j < lines.length && (lines[j].includes('<w:') || lines[j].length < 2)) j++;
        if (j < lines.length) currentQ.original = lines[j];
    }

    if (currentQ && line.startsWith('Option ')) {
        if (lines[i + 1] === 'Y') {
            currentQ.correct = line.split(' ')[1];
        }
    }
}
if (currentQ && currentQ.original) questions.push(currentQ);

// Deduplicate and filter (sometimes qNum is repeated in XML)
const filtered = questions.filter((q, index, self) =>
    index === self.findIndex((t) => (
        t.original === q.original && t.type === q.type
    ))
);

fs.writeFileSync('parsed_questions.json', JSON.stringify(filtered, null, 2));
console.log(`Extracted ${filtered.length} questions.`);
