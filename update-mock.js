const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Update any existing Mock Test dropdowns (they have physics, chemistry, math)
content = content.replace(/<option value="physics">Physics<\/option>\s*<option value="chemistry">Chemistry<\/option>\s*<option value="math">Mathematics<\/option>/g, '<option value="all">Mixed (Physics, Chemistry, Math)</option>\n                <option value="physics">Physics</option>\n                <option value="chemistry">Chemistry</option>\n                <option value="math">Mathematics</option>');

// Update the top header dropdown (which currently has All Subjects (Auto) -> Physics -> Chemistry -> Math)
content = content.replace(/<option value="all">All Subjects \(Auto\)<\/option>\s*<option value="all">Mixed \(Physics, Chemistry, Math\)<\/option>/g, '<option value="all">All Subjects (Auto)</option>'); // deduplicate just in case

fs.writeFileSync('src/app/page.tsx', content);
console.log('Fixed Mock Test Dropdown');
