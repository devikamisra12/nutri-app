const fs = require('fs');
const data = JSON.parse(fs.readFileSync('test-results.json', 'utf8'));

console.log("=== SCOPE TESTS ===");
for (const [q, res] of Object.entries(data.scope)) {
  console.log(`Q: ${q}`);
  if (res.response && res.response.answer) {
    console.log(`A: ${res.response.answer}`);
  } else {
    console.log(`ERR: ${JSON.stringify(res)}`);
  }
  console.log("---");
}

console.log("\n=== CONSISTENCY TESTS ===");
for (const [q, runs] of Object.entries(data.consistency)) {
  console.log(`Q: ${q}`);
  runs.forEach((run, idx) => {
    if (run.response && run.response.answer) {
      console.log(`Run ${idx+1}: ${run.response.answer}`);
      if (run.response.claims && run.response.claims.length > 0) {
         console.log(`  Claims: ${JSON.stringify(run.response.claims)}`);
      } else {
         console.log(`  Claims: Empty/None`);
      }
    } else {
      console.log(`Run ${idx+1} ERR: ${JSON.stringify(run)}`);
    }
  });
  console.log("---");
}
