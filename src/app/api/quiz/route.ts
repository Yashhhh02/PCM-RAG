import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, subject, difficulty, questions, userAnswers } = body;

    if (action === "generate") {
      const prompt = `Generate a 5-question multiple choice quiz for a Class 11/12 student on the subject of ${subject}. The difficulty should be ${difficulty}. 
      Return ONLY a raw JSON array of objects. Do not include markdown code blocks (no \`\`\`json). 
      Each object must have exactly: 
      "id" (number starting from 1), 
      "question" (string), 
      "options" (an array of exactly 4 strings), 
      "correctAnswer" (the exact string of the correct option).`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents: prompt,
        });
      } catch (err: any) {
        if (err.message && err.message.includes('503')) {
          // Retry once on high demand
          await new Promise(r => setTimeout(r, 2000));
          response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt,
          });
        } else {
          throw err;
        }
      }

      let text = response.text || "[]";
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const quizData = JSON.parse(text);
      return NextResponse.json({ questions: quizData });
    } 
    
    else if (action === "analyze") {
      const prompt = `A student just took a quiz. Here are the questions and their answers:
      ${JSON.stringify({ questions, userAnswers })}
      
      Analyze their performance. Keep it encouraging but educational. 
      Return ONLY a raw JSON object without markdown code blocks (no \`\`\`json). It must have exactly:
      "score" (number of correct answers),
      "total" (total number of questions),
      "feedback" (a string paragraph analyzing their weak points and praising strong points),
      "detailedAnalysis" (an array of objects containing: "questionId" (number), "isCorrect" (boolean), "explanation" (a string explaining the concept and why their answer was right or wrong)).`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents: prompt,
        });
      } catch (err: any) {
        if (err.message && err.message.includes('503')) {
          await new Promise(r => setTimeout(r, 2000));
          response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: prompt,
          });
        } else {
          throw err;
        }
      }

      let text = response.text || "{}";
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();

      const analysisData = JSON.parse(text);
      return NextResponse.json(analysisData);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Quiz API Error:", error);
    return NextResponse.json({ error: "Failed to process quiz request. " + error.message }, { status: 500 });
  }
}
