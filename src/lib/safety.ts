export function checkSafety(message: string): { isSafe: boolean; refusal?: string } {
  const lowerMessage = message.toLowerCase();
  
  // Basic keyword check for Scope & Safety
  const isWeightTarget = lowerMessage.includes('weigh') || lowerMessage.includes('ideal weight');
  const isCalorieTarget = lowerMessage.includes('calories should') || lowerMessage.includes('daily energy intake') || lowerMessage.includes('amount of food energy') || lowerMessage.includes('calorie target');
  const isMedical = lowerMessage.includes('diabetes') || lowerMessage.includes('disease') || lowerMessage.includes('cure');

  if (isWeightTarget) {
    return { isSafe: false, refusal: "I cannot provide a recommended target weight." };
  }
  
  if (isCalorieTarget) {
    return { isSafe: false, refusal: "I can't provide an individualized calorie target. A qualified healthcare professional or registered dietitian can help determine an appropriate target based on your circumstances." };
  }
  
  if (isMedical) {
    return { isSafe: false, refusal: "I cannot provide individualized medical or dietary treatment advice. Please discuss this with a qualified healthcare professional or registered dietitian." };
  }

  return { isSafe: true };
}
