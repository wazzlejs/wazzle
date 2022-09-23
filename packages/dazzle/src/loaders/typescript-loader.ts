import fs from 'fs';
import ts from 'typescript';
import { DazzleConfig } from '../types';

export async function loadTypescript(path: string): Promise<DazzleConfig> {
  const content = fs.readFileSync(path, 'utf8');
  const compiled = ts.transpileModule(content, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2019,
      module: ts.ModuleKind.ES2020,
    },
  });
  console.log(compiled.outputText);
  const result = (await import(`data:text/javascript,${compiled.outputText}`)).default;
  return result;
}
