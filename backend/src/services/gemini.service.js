const env = require("../config/env");

const FALLBACK_RECOMMENDATIONS = [
  "Use a daily 90-minute deep-work block for your weakest subject.",
  "Review mistakes weekly and keep a compact error notebook.",
  "Blend active recall and timed practice for exam readiness.",
];

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) {
    return null;
  }

  try {
    return JSON.parse(match[0]);
  } catch (_error) {
    return null;
  }
}

async function generateWithGemini(prompt) {
  if (!env.geminiApiKey) {
    return null;
  }

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent" +
    `?key=${env.geminiApiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${errorText}`);
  }

  const payload = await response.json();
  const text =
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("\n") || "";

  return text;
}

async function generateRecommendations(analysis) {
  const weakSubjects = analysis.weakSubjects.map((s) => s.subject).join(", ") || "None";
  const prompt = [
    "You are an academic performance coach.",
    "Return ONLY valid JSON in this shape:",
    '{"strategies": ["..."], "timeManagement": ["..."], "resourceFocus": ["..."]}',
    `Overall percentage: ${analysis.overallPercentage}`,
    `Pattern insights: ${analysis.patternInsights.join("; ")}`,
    `Weak subjects: ${weakSubjects}`,
    "Make the output practical for the next 4 weeks.",
  ].join("\n");

  try {
    const raw = await generateWithGemini(prompt);
    if (!raw) {
      return {
        strategies: FALLBACK_RECOMMENDATIONS,
        timeManagement: [
          "Plan two high-focus sessions for weak subjects each week.",
          "Use a 50-10 study cycle and log completion daily.",
        ],
        resourceFocus: analysis.weakSubjects.map((s) => `Prioritize past papers for ${s.subject}`).slice(0, 3),
      };
    }

    const parsed = extractJson(raw);
    if (parsed?.strategies && parsed?.timeManagement && parsed?.resourceFocus) {
      return parsed;
    }
  } catch (_error) {
    // Fall through to deterministic fallback.
  }

  return {
    strategies: FALLBACK_RECOMMENDATIONS,
    timeManagement: [
      "Block 2 hours daily: 70% weak subjects, 30% revision.",
      "Every Sunday, review progress and rebalance your week.",
    ],
    resourceFocus: analysis.weakSubjects.map((s) => `Revise core ${s.subject} concepts with solved examples`).slice(0, 3),
  };
}

async function generateQuiz({ subject, topic, difficulty, level }) {
  const prompt = [
    "Generate a quiz for a student.",
    "Return ONLY valid JSON with shape:",
    '{"questions":[{"question":"...","options":["A","B","C","D"],"answer":"A"}]}',
    `Subject: ${subject}`,
    `Topic: ${topic}`,
    `Difficulty: ${difficulty}`,
    `Student level: ${level}`,
    "Generate 5 MCQ questions.",
  ].join("\n");

  try {
    const raw = await generateWithGemini(prompt);
    const parsed = raw ? extractJson(raw) : null;
    if (parsed?.questions?.length) {
      return parsed.questions.slice(0, 5);
    }
  } catch (_error) {
    // Fall through to static quiz.
  }

  return [
    {
      question: `Which study method best improves ${topic} retention in ${subject}?`,
      options: [
        "Passive reading only",
        "Active recall with practice questions",
        "Skipping revision",
        "Memorizing definitions without application",
      ],
      answer: "Active recall with practice questions",
    },
    {
      question: `For ${subject}, the most effective way to improve weak topics is:`,
      options: [
        "Ignore mistakes",
        "Solve targeted problems and review errors",
        "Study only easy chapters",
        "Avoid timed practice",
      ],
      answer: "Solve targeted problems and review errors",
    },
    {
      question: `A balanced preparation strategy for ${topic} should include:`,
      options: [
        "Only theory",
        "Only practical",
        "Theory plus mixed difficulty practice",
        "No revision",
      ],
      answer: "Theory plus mixed difficulty practice",
    },
    {
      question: `If you score low in ${subject}, your first step should be:`,
      options: [
        "Stop practicing",
        "Identify and prioritize high-weight weak areas",
        "Switch subjects permanently",
        "Study randomly",
      ],
      answer: "Identify and prioritize high-weight weak areas",
    },
    {
      question: `Which habit is best for weekly progress in ${subject}?`,
      options: [
        "One long session monthly",
        "Frequent short revision with tracking",
        "No mock tests",
        "Skipping feedback",
      ],
      answer: "Frequent short revision with tracking",
    },
  ];
}

module.exports = {
  generateRecommendations,
  generateQuiz,
};
