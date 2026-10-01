// test-chat.mjs
// Run this script using Node (node scripts/test-chat.mjs)

async function testChat() {
  const url = 'http://localhost:3000/api/chat';
  
  const payload = {
    question: "What is the law of inertia?",
    subject: "physics",
    class: 11
  };

  console.log(`Sending POST request to ${url}...`);
  console.log(`Payload:`, payload);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    
    if (!res.ok) {
      console.error("\n--- ERROR ---");
      console.error(data);
      return;
    }

    console.log("\n--- ANSWER ---");
    console.log(data.answer);
    
    console.log("\n--- SOURCES ---");
    console.log(JSON.stringify(data.sources, null, 2));

  } catch (err) {
    console.error("Request failed. Is your Next.js server running on localhost:3000?", err);
  }
}

testChat();
