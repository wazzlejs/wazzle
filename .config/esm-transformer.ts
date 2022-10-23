import * as ts from 'typescript';
import { dirname, join, resolve } from 'path';
import * as fs from 'fs';

type LoadedFile = {
  path: string;
  content: Buffer;
};

const ignorePaths = ['yargs/helpers'];

function resolveImport(mod: string, source: string, type: string) {
  if (mod.endsWith('.js')) {
    return mod;
  } else if (mod.startsWith('@') && mod.split('/').length < 3) {
    return mod;
  } else if (!mod.startsWith('.') && !mod.includes('/')) {
    return mod;
  } else if (ignorePaths.includes(mod)) {
    return mod;
  }

  if (!mod.startsWith('.')) {
    return `${mod}${
      require.resolve(mod, { paths: [process.cwd()] }).split(mod)[1]
    }`;
  }

  const potentialPaths = [
    mod,
    `${mod}.ts`,
    `${mod}.d.ts`,
    `${mod}.js`,
    `${mod}.cjs`,
    `${mod}/index.ts`,
    `${mod}/index.d.ts`,
    `${mod}/index.js`,
  ];

  for (const candidate of potentialPaths) {
    const resolved = resolve(dirname(source), candidate);
    if (fs.existsSync(resolved) && !fs.statSync(resolved).isDirectory()) {
      return candidate.replace(/(?:\.d\)?\.ts)$/, `.${type}`)
    }
  }

  throw new Error(`Module not found ${mod} from ${source}`);
}

const importTransformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
  return (sourceFile) => {
    const visitor = (node: ts.Node): ts.Node => {
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        const { moduleSpecifier } = node;
        if (moduleSpecifier && ts.isStringLiteralLike(moduleSpecifier)) {
          const mod = resolveImport(moduleSpecifier.text, sourceFile.fileName, 'js');

          if (ts.isImportDeclaration(node)) {
            return ts.factory.updateImportDeclaration(
              node,
              node.decorators,
              node.modifiers,
              node.importClause,
              ts.factory.createStringLiteral(mod, true),
              undefined
            );
          }

          return ts.factory.updateExportDeclaration(
            node,
            node.decorators,
            node.modifiers,
            node.isTypeOnly,
            node.exportClause,
            ts.factory.createStringLiteral(mod, true),
            undefined
          );
        }
      }

      if (ts.isCallExpression(node)) {
        const { expression,  arguments: args } = node;
        if (expression.kind == ts.SyntaxKind.Identifier
          && expression.getText(sourceFile) == 'require' &&
          args.length == 1 &&
          args![0].kind == ts.SyntaxKind.StringLiteral
          ) {
          const mod = resolveImport(args![0].getText(sourceFile).slice(1, -1), sourceFile.fileName, 'cjs');
          // console.log(args![0].getText(sourceFile))

          return ts.factory.updateCallExpression(
            node,
            expression,
            undefined,
            [
              ts.factory.createStringLiteral(mod, true)
            ]
          );
        }
      }

      return ts.visitEachChild(node, visitor, context);
    };

    return ts.visitNode(sourceFile, visitor);
  };
};

function getFiles(dir: string, root = false): string[] {
  const results = fs.readdirSync(dir, {
    withFileTypes: true,
  });

  const paths = results.map((entry): string[] => {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      return getFiles(fullPath);
    }

    return /\.c?js$/.test(fullPath) ? [fullPath] : [];
  });

  return paths.flatMap((entry) => entry);
}

function loadFile(file: string): LoadedFile {
  console.log(file)
  const printer = ts.createPrinter();

  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf-8'),
    ts.ScriptTarget.ESNext
  );
  const result = ts.transform(source, [importTransformer]);

  return {
    path: file,
    content: Buffer.from(printer.printFile(result.transformed[0]), 'utf8'),
  };
}

function getAllFiles() {
  return getFiles(join(process.cwd(), `esm`), true).concat(getFiles(join(process.cwd(), `lib`), true)).map((entry) =>
    loadFile(entry)
  );
}

function build() {
  const files = getAllFiles();

  return files.map((file) => {
    fs.writeFileSync(file.path, file.content);
  });
}

build();
