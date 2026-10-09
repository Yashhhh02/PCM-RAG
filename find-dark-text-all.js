const fs = require('fs');
const content = fs.readFileSync('src/app/page.tsx', 'utf8');

const splitPoint = content.indexOf('<div className="flex h-screen bg-[#0a0a0a]');
const studentPart = content.substring(splitPoint);
const lines = studentPart.split('\n');

lines.forEach((line, i) => {
  const matches = line.match(/text-(slate|gray|blue|orange|indigo|red|amber|emerald|cyan|purple)-(700|800|900)/g);
  if (matches) {
    console.log('Line ' + (i) + ':', matches, line.trim().substring(0, 100));
  }
});
