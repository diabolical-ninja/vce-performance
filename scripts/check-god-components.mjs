import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const thresholds = {
  fileLines: 200,
  imports: 10,
  jsxDepth: 6,
  props: 8,
  stateHooks: 5,
  effectHooks: 3,
};
function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(file);
    return /\.tsx$/.test(file) && !/\.(test|spec|stories)\.tsx$/.test(file)
      ? [file]
      : [];
  });
}
// Parse JSX instead of the reference regex, which counts generic types as JSX.
function measure(source, file) {
  const metrics = {
    fileLines: source.split("\n").length,
    imports: 0,
    jsxDepth: 0,
    props: 0,
    stateHooks: 0,
    effectHooks: 0,
  };
  const tree = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  function visit(node, depth = 0) {
    if (ts.isImportDeclaration(node)) metrics.imports++;
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      depth++;
      metrics.jsxDepth = Math.max(metrics.jsxDepth, depth);
    }
    if (ts.isFunctionDeclaration(node)) {
      for (const param of node.parameters) {
        if (ts.isObjectBindingPattern(param.name))
          metrics.props = Math.max(metrics.props, param.name.elements.length);
      }
    }
    if (ts.isCallExpression(node)) {
      const name = node.expression.getText(tree);
      if (/^use(State|Reducer)$/.test(name)) metrics.stateHooks++;
      if (name === "useEffect") metrics.effectHooks++;
    }
    ts.forEachChild(node, (child) => visit(child, depth));
  }
  visit(tree);
  return metrics;
}
const failures = [];
for (const file of walk("src")) {
  for (const [metric, value] of Object.entries(
    measure(readFileSync(file, "utf8"), file),
  )) {
    if (value > thresholds[metric])
      failures.push(`${file}: ${metric} ${value} > ${thresholds[metric]}`);
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("No component complexity thresholds exceeded.");
