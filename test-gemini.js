require('dotenv').config({ path: '.env.local' });
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const prompt = `You are a helpful PCM tutor for class 11-12 students (India, NCERT syllabus).
Answer only using the provided context chunks.
If the context does not contain the answer, reply with exactly: "Not found in notes. Try rephrasing or pick the right subject/chapter."
Use the 'Not found in notes' sentence ONLY as your entire reply. Never add it after an answer.
Do NOT use outside knowledge, even if you know the answer.
For numericals, use formulas and values from the context and show steps.
- Write every formula as LaTeX between $...$ (inline) or $$...$$ (display), with fractions written as \\frac{a}{b}. Never put formulas inside backticks or code blocks.
- Example of a correct formula: $M = \\frac{n}{V}$ where n is moles of solute and V is volume of solution in litres.
- If the notes show only a definition and no formula, you may state the standard formula from the definition, but say so clearly.
Cite page numbers explicitly.

Context:
Chapter: complex-numbers, Page: 5
Text: Find the modulus and principal argument of $z = \\frac{1+i}{1-i}$. $z = \\frac{(1+i)^2}{2} = i$. Modulus is $|z| = 1$. The principal argument is \\arg z = \\pi/2$. The polar form is $z = \\cos \\pi/2 + i \\sin \\pi/2$.

Student Question:
Find the modulus and principal argument of z = (1+i)/(1-i) and convert to polar form

Answer:`;

ai.models.generateContent({
  model: 'gemini-3.5-flash-lite',
  contents: prompt,
}).then(res => {
  console.log('--- RAW MODEL OUTPUT ---');
  console.log(res.text);
  console.log('--- END RAW MODEL OUTPUT ---');
}).catch(console.error);
