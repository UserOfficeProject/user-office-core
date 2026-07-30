import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, posix } from 'path';

import { NodeCompiler } from '@myriaddreamin/typst-ts-node-compiler';

import { TypstAsset } from './htmlToTypst';

/**
 * Stage 4 of the pipeline: Typst source -> PDF bytes.
 *
 * The compiler is a native addon loaded into this process. There is no browser,
 * no subprocess and no temporary file on disk: assets are handed to the
 * compiler as in-memory shadow files.
 */

export interface CompileOptions {
  /** Directories searched for fonts, on top of the system fonts. */
  fontPaths?: string[];
  /** Files the source references through `#image("/assets/...")`. */
  assets?: TypstAsset[];
}

/**
 * Workspace root the Typst absolute paths resolve against. Created once, empty,
 * and only ever populated with shadow files.
 */
let workspaceRoot: string | undefined;

function getWorkspaceRoot(): string {
  if (!workspaceRoot) {
    workspaceRoot = mkdtempSync(join(tmpdir(), 'uo-pdf-renderer-'));
  }

  return workspaceRoot;
}

const compilers = new Map<string, NodeCompiler>();

/**
 * Compilers are cached per font configuration because creating one scans the
 * font directories, which is the slowest part of a cold render.
 */
function getCompiler(fontPaths: string[]): NodeCompiler {
  const key = fontPaths.join(':');
  let compiler = compilers.get(key);

  if (!compiler) {
    compiler = NodeCompiler.create({
      workspace: getWorkspaceRoot(),
      ...(fontPaths.length ? { fontArgs: [{ fontPaths }] } : {}),
    });
    compilers.set(key, compiler);
  }

  return compiler;
}

/**
 * Compiles Typst source to PDF bytes.
 *
 * @throws with the Typst diagnostics attached, so a template author sees which
 * construct failed rather than a generic error.
 */
export function compileTypst(
  source: string,
  options: CompileOptions = {}
): Buffer {
  const compiler = getCompiler(options.fontPaths ?? []);
  const root = getWorkspaceRoot();
  const assets = options.assets ?? [];
  const mapped: string[] = [];

  try {
    for (const asset of assets) {
      // Asset names use posix separators because they come from Typst paths.
      const hostPath = join(root, ...asset.name.split(posix.sep));
      compiler.mapShadow(hostPath, asset.content);
      mapped.push(hostPath);
    }

    return compiler.pdf({ mainFileContent: source });
  } catch (error) {
    throw new Error(`Typst compilation failed: ${describe(error)}`);
  } finally {
    for (const hostPath of mapped) {
      compiler.unmapShadow(hostPath);
    }

    // Keeps the memoisation cache from growing across long-lived processes.
    compiler.evictCache(10);
  }
}

function describe(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const candidate = error as { code?: string; message?: string };

    return candidate.code ?? candidate.message ?? String(error);
  }

  return String(error);
}

/** Drops the cached compilers. Exposed for tests and for reloading fonts. */
export function resetCompilers(): void {
  compilers.clear();
}
