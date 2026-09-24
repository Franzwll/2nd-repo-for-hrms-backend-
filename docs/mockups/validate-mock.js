const fs = require('fs');
const h = fs.readFileSync('docs/mockups/applicant-management-mock.html', 'utf8');
const ids = [...h.matchAll(/id="(s\d)"/g)].map(m => m[1]);
console.log('screens found:', [...new Set(ids)].sort().join(','));
console.log('sections open:', (h.match(/<section/g) || []).length, '| close:', (h.match(/<\/section>/g) || []).length);
console.log('divs open:', (h.match(/<div/g) || []).length, '| close:', (h.match(/<\/div>/g) || []).length);
console.log('show() calls:', (h.match(/show\('s\d'\)/g) || []).length);
console.log('unclosed sentinels:', ['BODY','S1','S1b','S2','S3','S3b','S4','S5','S6','S7','S8','TAIL','CSS'].map(s=>'<!--'+s).filter(x=>h.includes(x)).join(',') || 'none');
console.log('size KB:', (h.length / 1024).toFixed(1));
