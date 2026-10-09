const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const startStr = "{activeTab === 'study_vault' && (";
const endStr = "                  )}";

const startIndex = content.indexOf(startStr);
const lastEndIndex = content.lastIndexOf(endStr);

if (startIndex !== -1 && lastEndIndex !== -1) {
  // We want to replace everything from startIndex to lastEndIndex + endStr.length with `<StudyVault />`
  // Actually, we also want to remove the extra closing divs that belonged to study_vault
  
  // Let's just do a regex replace or string splitting based on known good parts.
  const before = content.slice(0, startIndex);
  
  // Find the end of the study vault block by looking for the end of the tabs.
  // The study_vault tab has a div, then inside it views, and ends with `</div>\n              </div>\n            )}`
  const endBlock = "              </div>\n            )}";
  const endIndex = content.indexOf(endBlock, startIndex);
  
  if (endIndex !== -1) {
    const after = content.slice(endIndex + endBlock.length);
    const newContent = before + "{activeTab === 'study_vault' && (\\n              <StudyVault />\\n            )}" + after;
    fs.writeFileSync('src/components/AdminDashboard.tsx', newContent.replace(/\\n/g, '\n'));
    console.log("Success");
  } else {
    console.log("Could not find end block");
  }
} else {
  console.log("Could not find start str");
}
