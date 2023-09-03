import fs from "fs";
import * as acorn from "acorn";

// Path to your JavaScript file
const filePath = "test.js";
// Line number you want to analyze
const targetLineNumber = 7; // Replace with the desired line number

// Find the function containing the target line number

const functionName = findFunctionName(filePath, targetLineNumber);
console.log("Function Name:");
console.log(functionName);

// Function to find the function containing a specific line number

function findFunction(node, targetLine) {
  if (
    node.type === "FunctionDeclaration" ||
    node.type === "FunctionExpression"
  ) {
    if (node.loc.start.line <= targetLine && node.loc.end.line >= targetLine) {
      
      return node;
    }
  }
  for (const key in node) {
    if (node[key] && typeof node[key] === "object") {
      const result = findFunction(node[key], targetLine);
      if (result) {
        return result;
      }
    }
  }
  return null;
}

function findFunctionName(filePath, targetLineNumber) {
  const code = fs.readFileSync(filePath, "utf-8");
  const parsed = acorn.parse(code, { locations: true });

  // Find the function containing the target line number
  const containingFunction = findFunction(parsed, targetLineNumber);
  return containingFunction.id.name;
}
