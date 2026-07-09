import { access, readFile, realpath, stat } from 'node:fs/promises';
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

function isWithinDirectory(directory, pathname) {
  const relativePath = relative(directory, pathname);
  return (
    relativePath === '' ||
    (relativePath !== '..' &&
      !relativePath.startsWith(`..${sep}`) &&
      !isAbsolute(relativePath))
  );
}

async function resolvedPath(pathname) {
  try {
    return await realpath(pathname);
  } catch {
    return null;
  }
}

async function isRegularFile(pathname) {
  try {
    return (await stat(pathname)).isFile();
  } catch {
    return false;
  }
}

async function checkLocalReference(
  rawReference,
  sourcePath,
  routeDirectory,
  realRouteDirectory,
  routeId,
  failures,
  intent,
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
  if (!isWithinDirectory(routeDirectory, targetPath)) {
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

  const realTargetPath = await resolvedPath(targetPath);
  if (realTargetPath === null) {
    failures.push(
      `${routeId}: ${displayPath(sourcePath)} references missing local file ${rawReference}`,
    );
    return null;
  }

  if (!isWithinDirectory(realRouteDirectory, realTargetPath)) {
    failures.push(
      `${routeId}: ${displayPath(sourcePath)} reference resolves outside its route directory: ${rawReference}`,
    );
    return null;
  }

  if (intent !== 'href' && !(await isRegularFile(realTargetPath))) {
    const label = intent === 'src' ? 'src reference' : 'CSS url() reference';
    failures.push(
      `${routeId}: ${displayPath(sourcePath)} ${label} must resolve to a regular file: ${rawReference}`,
    );
    return null;
  }

  return { path: targetPath, realPath: realTargetPath };
}

async function checkCss(
  css,
  sourcePath,
  routeDirectory,
  realRouteDirectory,
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
      realRouteDirectory,
      routeId,
      failures,
      'css-url',
    );
  }
}

const structuralIgnoredContentElements = new Set([
  'script',
  'style',
  'template',
  'noscript',
]);
const referenceIgnoredContentElements = new Set(['script', 'style']);

function readMarkupToken(markup, start) {
  if (markup.startsWith('<!--', start)) {
    const commentEnd = markup.indexOf('-->', start + 4);
    return {
      type: 'comment',
      start,
      end: commentEnd === -1 ? markup.length : commentEnd + 3,
    };
  }

  let quote = null;
  for (let index = start + 1; index < markup.length; index += 1) {
    const character = markup[index];

    if (quote !== null) {
      if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }

    if (character !== '>') {
      continue;
    }

    const raw = markup.slice(start, index + 1);
    const tag = raw.match(/^<\s*(\/?)\s*([a-z][\w:-]*)\b/i);
    if (!tag) {
      return { type: 'other', raw, start, end: index + 1 };
    }

    return {
      type: 'tag',
      raw,
      start,
      end: index + 1,
      closing: tag[1] === '/',
      name: tag[2].toLowerCase(),
      selfClosing: /\/\s*>$/.test(raw),
    };
  }

  return null;
}

function sanitizeMarkup(html, ignoredContentElements) {
  const output = [];
  const styleBlocks = [];
  let cursor = 0;
  let ignoredElement = null;
  let ignoredDepth = 0;
  let ignoredContentStart = 0;

  while (cursor < html.length) {
    const tokenStart = html.indexOf('<', cursor);
    if (tokenStart === -1) {
      if (ignoredElement === null) {
        output.push(html.slice(cursor));
      } else if (ignoredElement === 'style') {
        styleBlocks.push(html.slice(ignoredContentStart));
      }
      break;
    }

    if (ignoredElement === null) {
      output.push(html.slice(cursor, tokenStart));
    }

    const token = readMarkupToken(html, tokenStart);
    if (token === null) {
      if (ignoredElement === null) {
        output.push('<');
      }
      cursor = tokenStart + 1;
      continue;
    }

    if (token.type === 'comment') {
      cursor = token.end;
      continue;
    }

    if (ignoredElement === null) {
      output.push(token.raw);

      if (
        token.type === 'tag' &&
        !token.closing &&
        !token.selfClosing &&
        ignoredContentElements.has(token.name)
      ) {
        ignoredElement = token.name;
        ignoredDepth = 1;
        ignoredContentStart = token.end;
      }
    } else if (token.type === 'tag' && token.name === ignoredElement) {
      if (token.closing) {
        ignoredDepth -= 1;
        if (ignoredDepth === 0) {
          if (ignoredElement === 'style') {
            styleBlocks.push(html.slice(ignoredContentStart, token.start));
          }
          output.push(token.raw);
          ignoredElement = null;
        }
      } else if (
        !token.selfClosing &&
        (ignoredElement === 'template' || ignoredElement === 'noscript')
      ) {
        ignoredDepth += 1;
      }
    }

    cursor = token.end;
  }

  return { markup: output.join(''), styleBlocks };
}

function markupTags(markup) {
  const tags = [];
  let cursor = 0;

  while (cursor < markup.length) {
    const tokenStart = markup.indexOf('<', cursor);
    if (tokenStart === -1) {
      break;
    }

    const token = readMarkupToken(markup, tokenStart);
    if (token === null) {
      cursor = tokenStart + 1;
      continue;
    }

    if (token.type === 'tag') {
      tags.push(token);
    }
    cursor = token.end;
  }

  return tags;
}

function tagAttributes(tag) {
  const attributes = [];
  const tagName = tag.raw.match(/^<\s*\/?\s*[a-z][\w:-]*/i);
  let cursor = tagName ? tagName[0].length : 0;

  while (cursor < tag.raw.length) {
    while (/\s/.test(tag.raw[cursor] ?? '')) {
      cursor += 1;
    }

    if (tag.raw[cursor] === '>' || tag.raw[cursor] === '/') {
      break;
    }

    const nameStart = cursor;
    while (!/[\s=/>]/.test(tag.raw[cursor] ?? '>')) {
      cursor += 1;
    }
    const name = tag.raw.slice(nameStart, cursor).toLowerCase();

    while (/\s/.test(tag.raw[cursor] ?? '')) {
      cursor += 1;
    }

    let value = '';
    if (tag.raw[cursor] === '=') {
      cursor += 1;
      while (/\s/.test(tag.raw[cursor] ?? '')) {
        cursor += 1;
      }

      const quote = tag.raw[cursor];
      if (quote === '"' || quote === "'") {
        cursor += 1;
        const valueStart = cursor;
        while (cursor < tag.raw.length && tag.raw[cursor] !== quote) {
          cursor += 1;
        }
        value = tag.raw.slice(valueStart, cursor);
        if (tag.raw[cursor] === quote) {
          cursor += 1;
        }
      } else {
        const valueStart = cursor;
        while (!/[\s>]/.test(tag.raw[cursor] ?? '>')) {
          cursor += 1;
        }
        value = tag.raw.slice(valueStart, cursor);
      }
    }

    if (name !== '') {
      attributes.push({ name, value });
    }
  }

  return attributes;
}

function htmlReferences(tags) {
  const references = [];

  for (const tag of tags) {
    if (tag.closing) {
      continue;
    }

    for (const attribute of tagAttributes(tag)) {
      if (attribute.name === 'src' || attribute.name === 'href') {
        references.push({
          element: tag.name,
          attribute: attribute.name,
          reference: attribute.value,
        });
      }
    }
  }

  return references;
}

function hasNonEmptyTitle(markup, tags) {
  for (let index = 0; index < tags.length; index += 1) {
    const openingTag = tags[index];
    if (openingTag.closing || openingTag.name !== 'title') {
      continue;
    }

    const closingTag = tags
      .slice(index + 1)
      .find((tag) => tag.closing && tag.name === 'title');
    if (
      closingTag &&
      markup.slice(openingTag.end, closingTag.start).trim() !== ''
    ) {
      return true;
    }
  }

  return false;
}

async function validateRoute(route, failures) {
  const routeDirectory = resolve(repoRoot, route.directory);
  const indexPath = resolve(routeDirectory, 'index.html');

  if (!(await exists(indexPath))) {
    failures.push(`${route.id}: missing index.html`);
    return null;
  }

  const realRouteDirectory = await resolvedPath(routeDirectory);
  const realIndexPath = await resolvedPath(indexPath);
  if (realRouteDirectory === null || realIndexPath === null) {
    failures.push(`${route.id}: could not resolve index.html`);
    return null;
  }

  if (!isWithinDirectory(realRouteDirectory, realIndexPath)) {
    failures.push(`${route.id}: index.html resolves outside its route directory`);
    return null;
  }

  if (!(await isRegularFile(realIndexPath))) {
    failures.push(`${route.id}: index.html must be a readable regular file`);
    return null;
  }

  let html;
  try {
    html = await readFile(realIndexPath, 'utf8');
  } catch {
    failures.push(`${route.id}: index.html must be a readable regular file`);
    return null;
  }

  const { markup: structuralMarkup } = sanitizeMarkup(
    html,
    structuralIgnoredContentElements,
  );
  const { markup: referenceMarkup, styleBlocks } = sanitizeMarkup(
    html,
    referenceIgnoredContentElements,
  );
  const structuralTags = markupTags(structuralMarkup);
  const structuralOpeningTags = structuralTags.filter((tag) => !tag.closing);
  const referenceTags = markupTags(referenceMarkup);
  const referenceOpeningTags = referenceTags.filter((tag) => !tag.closing);

  if (!hasNonEmptyTitle(structuralMarkup, structuralTags)) {
    failures.push(`${route.id}: index.html must contain a non-empty <title>`);
  }

  if (!structuralOpeningTags.some((tag) => tag.name === 'h1')) {
    failures.push(`${route.id}: index.html must contain an <h1>`);
  }

  if (route.generated) {
    const sections = structuralOpeningTags.filter(
      (tag) => tag.name === 'section',
    );

    if (sections.length < 5) {
      failures.push(
        `${route.id}: expected at least five <section> elements, found ${sections.length}`,
      );
    }

    if (sections.length === 0 || !/\bhero\b/i.test(sections[0].raw)) {
      failures.push(
        `${route.id}: first <section> opening tag must contain the word hero`,
      );
    }
  }

  const checkedStylesheets = new Set();

  for (const { attribute, reference } of htmlReferences(referenceTags)) {
    const target = await checkLocalReference(
      reference,
      indexPath,
      routeDirectory,
      realRouteDirectory,
      route.id,
      failures,
      attribute,
    );

    if (
      target !== null &&
      extname(target.path).toLowerCase() === '.css' &&
      !checkedStylesheets.has(target.path)
    ) {
      checkedStylesheets.add(target.path);

      try {
        const css = await readFile(target.realPath, 'utf8');
        await checkCss(
          css,
          target.path,
          routeDirectory,
          realRouteDirectory,
          route.id,
          failures,
        );
      } catch {
        failures.push(
          `${route.id}: could not read local stylesheet ${displayPath(target.path)}`,
        );
      }
    }
  }

  for (const styleBlock of styleBlocks) {
    await checkCss(
      styleBlock,
      indexPath,
      routeDirectory,
      realRouteDirectory,
      route.id,
      failures,
    );
  }

  for (const tag of referenceOpeningTags) {
    for (const attribute of tagAttributes(tag)) {
      if (attribute.name === 'style') {
        await checkCss(
          attribute.value,
          indexPath,
          routeDirectory,
          realRouteDirectory,
          route.id,
          failures,
        );
      }
    }
  }

  return structuralTags;
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
  let rootTags = null;

  for (const route of selectedRoutes) {
    const tags = await validateRoute(route, failures);
    if (route.id === 'root') {
      rootTags = tags;
    }
  }

  if (fullRun && rootTags !== null) {
    const rootReferences = htmlReferences(rootTags)
      .filter(({ element, attribute }) => element === 'a' && attribute === 'href')
      .map(({ reference }) => reference);

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
