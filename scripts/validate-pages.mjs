import { access, readFile } from 'node:fs/promises';
import {
  dirname,
  extname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const routes = [
  { id: 'root', directory: '.', generated: false },
  { id: 'coke-zero-54', directory: 'coke-zero-54', generated: false },
  { id: 'coke-zero-55', directory: 'coke-zero-55', generated: false },
  {
    id: 'gemini-antigravity',
    directory: 'gemini-antigravity',
    generated: false,
  },
  { id: 'gpt-56-sol', directory: 'gpt-56-sol', generated: true },
  { id: 'gpt-56-terra', directory: 'gpt-56-terra', generated: true },
  { id: 'gpt-56-luna', directory: 'gpt-56-luna', generated: true },
];

function cleanReference(rawReference) {
  let reference = rawReference.trim();

  if (
    reference === '' ||
    reference.startsWith('#') ||
    reference.startsWith('//') ||
    /^[a-z][a-z\d+.-]*:/i.test(reference)
  ) {
    return null;
  }

  const suffixIndex = reference.search(/[?#]/);
  if (suffixIndex !== -1) {
    reference = reference.slice(0, suffixIndex);
  }

  if (reference === '') {
    return null;
  }

  try {
    return decodeURIComponent(reference);
  } catch {
    return reference;
  }
}

async function exists(pathname) {
  try {
    await access(pathname);
    return true;
  } catch {
    return false;
  }
}

function displayPath(pathname) {
  return relative(repoRoot, pathname) || '.';
}

async function checkLocalReference(
  rawReference,
  sourcePath,
  routeDirectory,
  routeId,
  failures,
) {
  const reference = cleanReference(rawReference);
  if (reference === null) {
    return null;
  }

  if (reference.startsWith('/')) {
    failures.push(
      `${routeId}: ${displayPath(sourcePath)} has root-absolute reference ${rawReference}`,
    );
    return null;
  }

  const targetPath = resolve(dirname(sourcePath), reference);
  const routeRelativePath = relative(routeDirectory, targetPath);

  if (
    routeRelativePath === '..' ||
    routeRelativePath.startsWith(`..${sep}`) ||
    isAbsolute(routeRelativePath)
  ) {
    failures.push(
      `${routeId}: ${displayPath(sourcePath)} has reference escaping its route directory: ${rawReference}`,
    );
    return null;
  }

  if (!(await exists(targetPath))) {
    failures.push(
      `${routeId}: ${displayPath(sourcePath)} references missing local file ${rawReference}`,
    );
    return null;
  }

  return targetPath;
}

async function checkCss(
  css,
  sourcePath,
  routeDirectory,
  routeId,
  failures,
) {
  const urlPattern = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s][^)]*?))\s*\)/gi;
  const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');

  for (const match of cssWithoutComments.matchAll(urlPattern)) {
    const reference = match[1] ?? match[2] ?? match[3] ?? '';
    await checkLocalReference(
      reference.trim(),
      sourcePath,
      routeDirectory,
      routeId,
      failures,
    );
  }
}

function htmlReferences(html, attributeFilter = null) {
  const references = [];
  const htmlWithoutComments = html.replace(/<!--[\s\S]*?-->/g, '');
  const attributePattern =
    /(?<![\w:-])(src|href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi;

  for (const match of htmlWithoutComments.matchAll(attributePattern)) {
    if (attributeFilter === null || match[1].toLowerCase() === attributeFilter) {
      references.push(match[2] ?? match[3] ?? match[4] ?? '');
    }
  }

  return references;
}

async function validateRoute(route, failures) {
  const routeDirectory = resolve(repoRoot, route.directory);
  const indexPath = resolve(routeDirectory, 'index.html');

  if (!(await exists(indexPath))) {
    failures.push(`${route.id}: missing index.html`);
    return null;
  }

  const html = await readFile(indexPath, 'utf8');
  const htmlWithoutComments = html.replace(/<!--[\s\S]*?-->/g, '');
  const title = htmlWithoutComments.match(
    /<title\b[^>]*>([\s\S]*?)<\/title>/i,
  );

  if (!title || title[1].trim() === '') {
    failures.push(`${route.id}: index.html must contain a non-empty <title>`);
  }

  if (!/<h1\b[^>]*>/i.test(htmlWithoutComments)) {
    failures.push(`${route.id}: index.html must contain an <h1>`);
  }

  if (route.generated) {
    const sections = [...htmlWithoutComments.matchAll(/<section\b[^>]*>/gi)];

    if (sections.length < 5) {
      failures.push(
        `${route.id}: expected at least five <section> elements, found ${sections.length}`,
      );
    }

    if (sections.length === 0 || !/\bhero\b/i.test(sections[0][0])) {
      failures.push(
        `${route.id}: first <section> opening tag must contain the word hero`,
      );
    }
  }

  const checkedStylesheets = new Set();

  for (const reference of htmlReferences(html)) {
    const targetPath = await checkLocalReference(
      reference,
      indexPath,
      routeDirectory,
      route.id,
      failures,
    );

    if (
      targetPath !== null &&
      extname(targetPath).toLowerCase() === '.css' &&
      !checkedStylesheets.has(targetPath)
    ) {
      checkedStylesheets.add(targetPath);

      try {
        const css = await readFile(targetPath, 'utf8');
        await checkCss(css, targetPath, routeDirectory, route.id, failures);
      } catch {
        failures.push(
          `${route.id}: could not read local stylesheet ${displayPath(targetPath)}`,
        );
      }
    }
  }

  await checkCss(
    htmlWithoutComments,
    indexPath,
    routeDirectory,
    route.id,
    failures,
  );
  return html;
}

async function main() {
  const args = process.argv.slice(2);
  let selectedRoutes = routes;
  let fullRun = true;

  if (args.length > 0) {
    if (args.length !== 2 || args[0] !== '--route') {
      console.error('FAIL usage: bun scripts/validate-pages.mjs [--route <id>]');
      return 2;
    }

    const route = routes.find(({ id }) => id === args[1]);
    if (!route) {
      console.error(`FAIL unknown route ID: ${args[1]}`);
      return 2;
    }

    selectedRoutes = [route];
    fullRun = false;
  }

  const failures = [];
  let rootHtml = null;

  for (const route of selectedRoutes) {
    const html = await validateRoute(route, failures);
    if (route.id === 'root') {
      rootHtml = html;
    }
  }

  if (fullRun && rootHtml !== null) {
    const rootReferences = htmlReferences(rootHtml, 'href');

    for (const route of routes.filter(({ id }) => id !== 'root')) {
      const expectedLink = `./${route.directory}/`;
      if (!rootReferences.includes(expectedLink)) {
        failures.push(`root: missing gallery link ${expectedLink}`);
      }
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL ${failure}`);
    }
    return 1;
  }

  console.log(`PASS ${selectedRoutes.map(({ id }) => id).join(',')}`);
  return 0;
}

if (!process.execArgv.includes('--check')) {
  process.exitCode = await main();
}
