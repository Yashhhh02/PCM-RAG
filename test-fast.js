const questions = [
  "A batsman deflects a ball by an angle of 45 degrees without changing its initial speed which is equal to 54 km/h. What is the impulse imparted to the ball? (Mass of the ball is 0.15 kg)",
  "What is rolling friction?",
  "Who was the first President of India?",
  "What is the chemical formula for sulfuric acid?",
  "Explain the process of photosynthesis in plants."
];

async function runEval() {
  console.log("Starting quick evaluation for the remaining questions...\n");
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    console.log(`Q: ${q}`);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => { controller.abort(); }, 30000); // 30s timeout

      const res = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, subject: "physics", class: 11 }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (data.error) {
        console.log(`Error: ${data.error}`);
      } else {
        console.log(`A: ${data.answer.substring(0, 300)}`);
      }
    } catch (err) {
      console.log(`Failed: ${err.message}`);
    }
    console.log("-".repeat(50));
  }
}

runEval();
