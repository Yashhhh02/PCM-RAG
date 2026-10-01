const questions = [
  // Definitions & Concepts (Laws of Motion)
  "What is Newton's first law of motion?",
  "Explain the concept of inertia.",
  "What is momentum? Write its formula.",
  "State Newton's second law of motion.",
  "What is impulse?",
  "What is Newton's third law of motion?",
  "State the law of conservation of momentum.",
  "Explain the difference between static and kinetic friction.",
  "What is centripetal force?",
  
  // Numericals / Applied (Typical NCERT style questions)
  "A bullet of mass 0.04 kg moving with a speed of 90 m/s enters a heavy wooden block and is stopped after a distance of 60 cm. What is the average resistive force exerted by the block on the bullet?",
  "A batsman deflects a ball by an angle of 45 degrees without changing its initial speed which is equal to 54 km/h. What is the impulse imparted to the ball? (Mass of the ball is 0.15 kg)",
  "What is rolling friction?",

  // Out of scope / Not in Chapter (To test hallucination prevention)
  "Who was the first President of India?",
  "What is the chemical formula for sulfuric acid?",
  "Explain the process of photosynthesis in plants."
];

async function runEval() {
  console.log("Starting Phase 6 Evaluation...\n");
  
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    console.log(`[Test ${i + 1}/15]`);
    console.log(`Q: ${q}`);
    
    try {
      const res = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, subject: "physics", class: 11 })
      });
      
      const data = await res.json();
      
      if (data.error) {
        console.log(`Error: ${data.error}`);
      } else {
        console.log(`A: ${data.answer.substring(0, 300)}${data.answer.length > 300 ? '...' : ''}`);
        if (data.sources && data.sources.length > 0) {
            console.log(`Sources: ${data.sources.map(s => `${s.chapter} (Pg ${s.page})`).join(", ")}`);
        } else {
            console.log(`Sources: None`);
        }
      }
    } catch (err) {
      console.log(`Failed to fetch: ${err.message}`);
    }
    
    console.log("-".repeat(50));
    
    if (i < questions.length - 1) {
      // 5-second delay to avoid rate limits on free models
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.log("\nEvaluation Complete!");
}

runEval();
