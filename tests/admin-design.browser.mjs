/**
 * Browser regression checks for the four administration screens.
 * Run against a local dev server with ADMIN_TEST_EMAIL and ADMIN_TEST_PASSWORD.
 * Reads real data; all mutations below are intercepted and never reach the server.
 * Playwright is installed separately in .tmp/browser-tools to keep app dependencies unchanged.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from '../.tmp/browser-tools/node_modules/playwright/index.mjs';
import { adminDesignFixtures } from './admin-design.fixtures.mjs';

const baseURL = process.env.ADMIN_TEST_URL || 'http://localhost:3000';
assert(['localhost', '127.0.0.1'].includes(new URL(baseURL).hostname), 'Use a local test server.');
const fixtureMode = process.env.ADMIN_TEST_FIXTURES === '1';
if (fixtureMode) process.env.ADMIN_TEST_EMAIL ||= 'admin@example.test';
else assert(process.env.ADMIN_TEST_EMAIL && process.env.ADMIN_TEST_PASSWORD, 'Set ADMIN_TEST_EMAIL and ADMIN_TEST_PASSWORD.');
const artifactDir = `.tmp/admin-browser${fixtureMode ? '-fixtures' : ''}`;
const initialFixtures = fixtureMode ? adminDesignFixtures(process.env.ADMIN_TEST_EMAIL) : null;
await fs.mkdir(artifactDir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 1024 }, locale: 'fr-FR', reducedMotion: 'reduce' });
const page = await context.newPage();
page.setDefaultTimeout(30000);
page.setDefaultNavigationTimeout(60000);
const results = [];
const errors = [];
const observed = new Map();
const requests = [];
let mutationHandler = null;
let readHandler = null;
const check = (name, detail = '') => { results.push({ name, detail, passed: true }); console.log(`PASS ${name}${detail ? `: ${detail}` : ''}`); };
page.on('pageerror', error => errors.push(error.message));
page.on('request', req => { if (new URL(req.url()).pathname.startsWith('/api/')) requests.push({ url: req.url(), method: req.method() }); });
page.on('response', async response => {
  const pathname = new URL(response.url()).pathname;
  if (response.request().method() === 'GET' && ['/api/admin/users', '/api/admin/business-plans', '/api/bp/config', '/api/bp/amortissement', '/api/admin/scoring'].includes(pathname) && response.ok()) {
    try { observed.set(pathname, await response.json()); } catch { /* navigation can cancel a response */ }
  }
});

async function open(screen) {
  await page.goto(`${baseURL}/admin/${screen}`, { waitUntil: 'domcontentloaded' });
  await page.locator('.admin-page').waitFor();
  await page.locator('.admin-empty[role="status"]').waitFor({ state: 'hidden' });
  await page.evaluate(() => document.fonts.ready);
}
async function noOverflow(label) {
  const dimensions = await page.evaluate(() => ({ width: innerWidth, body: document.documentElement.scrollWidth }));
  assert(dimensions.body <= dimensions.width + 1, `${label}: viewport ${dimensions.width}, document ${dimensions.body}`);
}
async function waitForRequest(fragment, action) {
  const pending = page.waitForRequest(req => req.url().includes(fragment));
  await action();
  return pending;
}

try {
  await page.goto(`${baseURL}/admin/business-plans`, { waitUntil: 'domcontentloaded' });
  assert(page.url().includes('/login'), 'Unauthenticated admin access redirects to login.');
  check('Unauthenticated access redirects to login');
  if (fixtureMode) {
    const { loadEnvConfig } = await import('@next/env');
    const { encode } = await import('next-auth/jwt');
    loadEnvConfig(process.cwd());
    const cookieName = 'authjs.session-token';
    const value = await encode({ secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET, salt: cookieName, token: { id: 'browser-admin', email: process.env.ADMIN_TEST_EMAIL, name: 'Admin Test', roles: ['ROLE_ADMIN'], accessToken: 'browser-fixture-not-a-backend-token' }, maxAge: 3600 });
    await context.addCookies([{ name: cookieName, value, url: baseURL, httpOnly: true, sameSite: 'Lax' }]);
    check('Isolated browser fixture session (no backend authentication)');
  } else {
  await page.locator('input[name="email"]').fill(process.env.ADMIN_TEST_EMAIL);
  await page.locator('input[name="password"]').fill(process.env.ADMIN_TEST_PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL('**/admin/**', { timeout: 60000, waitUntil: 'domcontentloaded' });
  check('Login with the supplied administrator account');
  }

  // From this point, no POST/PUT/PATCH/DELETE can reach the real API.
  await context.route('**/api/**', async route => {
    const request = route.request();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
      if (mutationHandler) return mutationHandler(route);
      return route.fulfill({ status: 409, json: { message: 'Mutation blocked by browser test' } });
    }
    if (readHandler && await readHandler(route)) return;
    if (initialFixtures) {
      const url = new URL(request.url());
      if (initialFixtures[url.pathname]) {
        const response = structuredClone(initialFixtures[url.pathname]);
        if (response.content) {
          if (url.searchParams.has('search')) response.content = [];
          if (url.searchParams.has('role')) response.content = response.content.filter(item => item.role === url.searchParams.get('role'));
          if (url.searchParams.has('status')) response.content = response.content.filter(item => item.status === url.searchParams.get('status'));
          response.totalElements = response.content.length;
        }
        return route.fulfill({ json: response });
      }
    }
    return route.continue();
  });

  for (const screen of ['business-plans', 'settings', 'scoring', 'users']) {
    await open(screen);
    assert.equal(await page.locator('.admin-page [role="alert"]').count(), 0, `${screen} loads without API errors.`);
    assert.equal(await page.locator('.admin-nav-link[aria-current="page"]').getAttribute('href'), `/admin/${screen}`);
    await noOverflow(screen);
    await page.screenshot({ path: `${artifactDir}/${screen}-desktop.png`, fullPage: true });
    check(`${screen}: ${fixtureMode ? 'test fixtures' : 'real data'}, active navigation and desktop screenshot`);
  }
  const fixtures = structuredClone(Object.fromEntries(observed));
  for (const key of ['/api/admin/users', '/api/admin/business-plans', '/api/bp/config', '/api/bp/amortissement', '/api/admin/scoring']) assert(fixtures[key], `Live data received: ${key}`);

  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    for (const screen of ['business-plans', 'settings', 'scoring', 'users']) {
      await open(screen);
      await noOverflow(`${screen} at ${width}px`);
      if (width < 768 && ['users', 'business-plans'].includes(screen)) {
        const scroll = page.locator('.admin-table-scroll');
        const before = await scroll.evaluate(el => ({ width: el.clientWidth, total: el.scrollWidth }));
        assert(before.total > before.width, 'Wide tables scroll within their card.');
        await scroll.evaluate(el => { el.scrollLeft = el.scrollWidth; });
        assert(await scroll.evaluate(el => el.scrollLeft > 0));
        assert(await page.locator('.admin-row-actions').first().isVisible());
        await scroll.evaluate(el => { el.scrollLeft = 0; });
      }
      if (width === 390 || width === 768) await page.screenshot({ path: `${artifactDir}/${screen}-${width}.png`, fullPage: true });
      check(`${screen}: responsive ${width}px, no document overflow`);
    }
  }
  await page.setViewportSize({ width: 1280, height: 1024 });

  await open('business-plans');
  const bpSearch = await waitForRequest('search=browser-no-match', () => page.getByRole('textbox').fill('browser-no-match'));
  assert.equal(new URL(bpSearch.url()).searchParams.get('page'), '0');
  await page.getByText('Aucun Business Plan trouvé.').waitFor();
  check('Business Plans: debounced search, empty state and page reset');
  await page.getByRole('textbox').fill('');
  await page.locator('.admin-plans-table').waitFor();
  await waitForRequest('status=BROUILLON', () => page.getByLabel('Filtrer par statut').selectOption('BROUILLON'));
  await page.locator('.admin-plans-table').waitFor();
  await waitForRequest('/api/admin/business-plans?', () => page.getByRole('button', { name: 'Actualiser' }).click());
  await page.locator('.admin-plans-table').waitFor();
  assert((await page.locator('.admin-row-actions a').first().getAttribute('href')).startsWith('/protected/edit-bp/'));
  check('Business Plans: status filter, refresh and edit links');

  await open('users');
  await waitForRequest('search=browser-no-match', () => page.getByRole('textbox').fill('browser-no-match'));
  await page.getByText('Aucun resultat pour ces criteres.').waitFor();
  await page.getByRole('textbox').fill('');
  await page.locator('.admin-users-table').waitFor();
  await waitForRequest('role=ROLE_ADMIN', () => page.getByLabel('Filtrer par rôle').selectOption('ROLE_ADMIN'));
  await page.locator('.admin-users-table').waitFor();
  assert.equal(await page.locator('.admin-users-table tbody .admin-badge-admin').count(), await page.locator('.admin-users-table tbody tr').count());
  check('Users: search and role filter');
  await page.getByLabel('Filtrer par rôle').selectOption('');
  await waitForRequest('status=SUSPENDED', () => page.getByLabel('Filtrer par statut').selectOption('SUSPENDED'));
  check('Users: status filter');

  // Use captured responses in memory for write tests and exceptional states.
  readHandler = async route => {
    const url = new URL(route.request().url());
    if (fixtures[url.pathname]) { await route.fulfill({ json: fixtures[url.pathname] }); return true; }
    return false;
  };
  await open('users');
  const currentAccount = page.locator('tr').filter({ hasText: process.env.ADMIN_TEST_EMAIL });
  assert(await currentAccount.getByTitle('Vous ne pouvez pas supprimer votre propre compte').isDisabled());
  assert(await currentAccount.getByTitle('Vous ne pouvez pas suspendre votre propre compte').isDisabled());
  assert.equal(await page.getByRole('link', { name: 'Ajouter' }).getAttribute('href'), '/admin/users/new');
  const other = fixtures['/api/admin/users'].content.find(user => user.email !== process.env.ADMIN_TEST_EMAIL);
  assert(other, 'A second user exists for intercepted action tests.');
  const otherRow = page.locator('tr').filter({ hasText: other.email }).first();
  assert.equal(await otherRow.getByTitle('Consulter').getAttribute('href'), `/admin/users/${other.id}`);
  assert.equal(await otherRow.getByTitle('Modifier').getAttribute('href'), `/admin/users/${other.id}/edit`);
  let mutation;
  mutationHandler = async route => { mutation = { method: route.request().method(), url: route.request().url(), body: route.request().postDataJSON() }; await route.fulfill({ json: { ...other, status: 'SUSPENDED' } }); };
  page.once('dialog', dialog => dialog.accept());
  const suspendedResponse = page.waitForResponse(response => response.request().method() === 'PATCH');
  await otherRow.getByTitle('Suspendre', { exact: true }).click();
  await suspendedResponse;
  assert.equal(mutation.method, 'PATCH');
  assert.equal(mutation.body.status, 'SUSPENDED');
  check('Users: add/view/edit links, own-account protections, intercepted suspension');
  await page.locator('.admin-users-table').waitFor();
  let deleted = false;
  mutationHandler = async route => { assert.equal(route.request().method(), 'DELETE'); deleted = true; await route.fulfill({ status: 204 }); };
  page.once('dialog', dialog => dialog.dismiss());
  await otherRow.getByTitle('Supprimer', { exact: true }).click();
  assert.equal(deleted, false);
  page.once('dialog', dialog => dialog.accept());
  const deletedResponse = page.waitForResponse(response => response.request().method() === 'DELETE');
  await otherRow.getByTitle('Supprimer', { exact: true }).click();
  await deletedResponse;
  assert(deleted);
  check('Users: deletion cancellation and intercepted confirmation');

  for (const screen of ['users', 'business-plans']) {
    const endpoint = `/api/admin/${screen}`;
    const original = structuredClone(fixtures[endpoint]);
    fixtures[endpoint] = { ...original, totalElements: 40, totalPages: 2, page: 0 };
    await open(screen);
    const request = await waitForRequest('page=1', () => page.getByTitle('Page suivante', { exact: true }).click());
    assert.equal(new URL(request.url()).searchParams.get('page'), '1');
    await page.locator('.admin-table').waitFor();
    await waitForRequest('page=0', () => page.getByTitle('Page précédente', { exact: true }).click());
    fixtures[endpoint] = original;
    check(`${screen}: next/previous pagination requests`);
  }

  await open('settings');
  const scalar = fixtures['/api/bp/config'].find(setting => setting.valueType === 'number');
  assert(scalar, 'Numeric parameter available.');
  const field = page.getByRole('spinbutton', { name: scalar.key, exact: true });
  const saveSetting = page.getByTitle(`Enregistrer ${scalar.key}`, { exact: true });
  assert(await saveSetting.isDisabled());
  await field.fill('');
  await saveSetting.click();
  await page.getByRole('alert').filter({ hasText: 'Valeur numérique invalide' }).waitFor();
  await field.fill(String(Number(scalar.value) + 1));
  mutationHandler = async route => { mutation = { url: route.request().url(), body: route.request().postDataJSON() }; await route.fulfill({ status: 204 }); };
  const savedSetting = page.waitForResponse(response => response.request().method() === 'PUT');
  await saveSetting.click();
  await savedSetting;
  await page.getByRole('status').filter({ hasText: 'a été enregistré' }).waitFor();
  assert.equal(mutation.body.value, String(Number(scalar.value) + 1));
  assert(mutation.url.endsWith(`/api/bp/config/${scalar.key}`));
  assert(await saveSetting.isDisabled());
  check('Settings: unchanged disabled, numeric validation and intercepted save');
  const arrayRow = page.locator('.admin-setting-array').first();
  const initialTags = await arrayRow.locator('.admin-selected-tag').count();
  assert(initialTags > 1);
  await arrayRow.locator('.admin-selected-tag button').first().click();
  assert.equal(await arrayRow.locator('.admin-selected-tag').count(), initialTags - 1);
  await arrayRow.locator('summary').click();
  assert(await arrayRow.locator('input[type="checkbox"]').first().isVisible());
  await arrayRow.locator('summary').press('Enter');
  assert.equal(await arrayRow.locator('details').getAttribute('open'), null);
  const savedArray = page.waitForResponse(response => response.request().method() === 'PUT');
  await arrayRow.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await savedArray;
  assert.equal(mutation.body.value.split(',').length, initialTags - 1);
  check('Settings: chip removal, keyboard selector and intercepted array save');

  await open('scoring');
  const weights = page.getByRole('spinbutton');
  assert.equal(await weights.count(), 5);
  const saveScore = page.getByRole('button', { name: 'Enregistrer', exact: true });
  assert(await saveScore.isDisabled());
  const originalA = Number(await weights.nth(0).inputValue());
  const originalB = Number(await weights.nth(1).inputValue());
  await weights.nth(0).fill(String(originalA + 1));
  assert(await saveScore.isDisabled());
  await page.getByText('Configuration à corriger', { exact: true }).waitFor();
  await weights.nth(1).fill(String(originalB - 1));
  assert(await saveScore.isEnabled());
  mutationHandler = async route => { mutation = route.request().postDataJSON(); await route.fulfill({ json: mutation }); };
  const savedScore = page.waitForResponse(response => response.request().method() === 'PUT');
  await saveScore.click();
  await savedScore;
  await page.getByRole('status').filter({ hasText: 'configuration du scoring' }).waitFor();
  assert.equal(mutation.totalWeight, 100);
  assert.equal(mutation.dimensions.reduce((sum, item) => sum + item.weight, 0), 100);
  assert(await saveScore.isDisabled());
  check('Scoring: total validation, save enablement, intercepted payload and success');
  await weights.nth(0).fill('30.001');
  assert(await saveScore.isDisabled());
  check('Scoring: invalid precision disables saving');

  readHandler = async route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/admin/business-plans') { await route.fulfill({ status: 500, json: {} }); return true; }
    return false;
  };
  await open('business-plans');
  await page.locator('.admin-page [role="alert"]').waitFor();
  assert(await page.getByRole('button', { name: 'Actualiser' }).isEnabled());
  check('Business Plans: API error message and refresh remain accessible');

  readHandler = null;
  await open('users');
  await page.getByRole('textbox').focus();
  const outline = await page.getByRole('textbox').evaluate(el => getComputedStyle(el).outlineStyle);
  assert.notEqual(outline, 'none');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'Filtrer par statut');
  await page.locator('.admin-nav-link[href="/admin/scoring"]').click();
  await page.getByRole('heading', { name: 'Pondérations du scoring', exact: true }).waitFor();
  check('Keyboard focus and navigation between administration pages');
  assert.deepEqual(errors, [], 'No uncaught browser errors.');
  check('No uncaught browser errors');
  await fs.writeFile(`${artifactDir}/results.json`, JSON.stringify({ passed: results.length, results, errors }, null, 2));
  console.log(`Completed ${results.length} checks. Screenshots: ${artifactDir}`);
} catch (error) {
  await page.screenshot({ path: `${artifactDir}/failure.png`, fullPage: true }).catch(() => {});
  await fs.writeFile(`${artifactDir}/results.json`, JSON.stringify({ passed: results.length, results, errors, failure: error.message }, null, 2));
  throw error;
} finally {
  await browser.close();
}
