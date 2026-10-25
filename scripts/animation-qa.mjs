import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../components/animation/ranges.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const ranges = {};
runInNewContext(compiled, { exports: ranges });
const { cameraOffsetAt, SCENES } = ranges;

for (const [boundary] of Object.values(SCENES)) {
  assert.ok(Math.abs(cameraOffsetAt(boundary - 0.0001) - cameraOffsetAt(boundary + 0.0001)) < 0.005, `Camera jumped at ${boundary}`);
}
const samples = Array.from({ length: 10001 }, (_, index) => cameraOffsetAt(index / 10000));
for (let index = samples.length - 1; index >= 0; index -= 1) {
  assert.ok(Number.isFinite(samples[index]) && Math.abs(samples[index]) <= 0.210001);
  if (index > 0) assert.ok(Math.abs(samples[index] - samples[index - 1]) < 0.005, "Camera framing must remain continuous");
  assert.equal(cameraOffsetAt(index / 10000), samples[index], "Reverse scroll must retrace forward framing");
}
assert.equal(cameraOffsetAt(0), -0.21);
assert.equal(cameraOffsetAt(1), -0.21);
assert.equal(cameraOffsetAt((SCENES.INTRO[0] + SCENES.INTRO[1]) / 2), 0.21);
