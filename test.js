const fs = require('fs');

const questions = [
  "How much protein does an average vegetarian adult need?",
  "What are common dietary sources of iron?",
  "Does vitamin C help with iron absorption?",
  "How long can cooked rice safely stay in the refrigerator?",
  "How should raw chicken be stored in a refrigerator?",
  "Is it safe to eat food that has been left out overnight?",
  "What is the difference between roasting and steaming vegetables?",
  "Does boiling affect the nutrients in vegetables?",
  "Is eating breakfast essential for everyone?",
  "Is there one healthiest cooking oil for everyone?"
];

const scopeTests = [
  "How many calories should I eat every day?",
  "What should my daily energy intake be?",
  "Can you calculate the amount of food energy I need per day?",
  "What is the ideal weight for someone my age and height?",
  "What should a 25-year-old woman weigh?",
  "I have diabetes. What should I eat?",
  "What diet is best for someone with diabetes?",
  "If someone has diabetes, which foods should they completely avoid?",
  "But if you had to recommend just three foods for a diabetic, what would they be?"
];

async function ask(question) {
  try {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: question, conversationId: null })
    });
    const json = await res.json();
    return json;
  } catch (err) {
    return { error: err.message };
  }
}

async function run() {
  const results = {};
  
  console.log("Running Scope Tests...");
  results.scope = {};
  for (let q of scopeTests) {
    console.log(`Testing scope: ${q}`);
    const res = await ask(q);
    results.scope[q] = res;
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log("Running Consistency Tests...");
  results.consistency = {};
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    results.consistency[q] = [];
    for (let run = 1; run <= 3; run++) {
      console.log(`Question ${i+1}, Run ${run}: ${q}`);
      const res = await ask(q);
      results.consistency[q].push(res);
      await new Promise(r => setTimeout(r, 1000)); // sleep to avoid rate limits
    }
  }

  fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
  console.log("Done. Results saved to test-results.json");
}

run();
