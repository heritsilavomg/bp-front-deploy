import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getBusinessPlanCalculation, scheduleCalculation, formatCalculationAmount } from '../src/lib/businessPlanCalculation.ts';

test('calculation request preserves data and forwards cancellation without caching', async t => {
  const data = { annee1: { chiffreAffairesHT: 120, resultatNet: -5, margeBrute: 100 } };
  const signal = new AbortController().signal;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/bp/calcul/a%2Fb');
    assert.equal(options.signal, signal);
    assert.equal(options.cache, 'no-store');
    return Response.json({ data });
  });
  assert.deepEqual(await getBusinessPlanCalculation('a/b', signal), data);
});

test('HTTP errors and malformed responses reject; empty and partial data remain distinct', async t => {
  const mock = t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 500 }));
  await assert.rejects(getBusinessPlanCalculation('id', new AbortController().signal));
  mock.mock.mockImplementation(async () => Response.json({}));
  await assert.rejects(getBusinessPlanCalculation('id', new AbortController().signal));
  mock.mock.mockImplementation(async () => Response.json({ data: null }));
  assert.equal(await getBusinessPlanCalculation('id', new AbortController().signal), null);
  mock.mock.mockImplementation(async () => Response.json({ data: { annee2: { resultatNet: null } } }));
  assert.deepEqual(await getBusinessPlanCalculation('id', new AbortController().signal), { annee2: { resultatNet: null } });
});

test('effect replay cancels first dispatch; one successful revision makes one logical call', async t => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => { calls++; return Response.json({ data: null }); });
  const cancel = scheduleCalculation('id', () => assert.fail('cancelled callback'), () => assert.fail());
  cancel();
  await new Promise((resolve, reject) => scheduleCalculation('id', resolve, reject, 1));
  assert.equal(calls, 1);
  await new Promise((resolve, reject) => scheduleCalculation('id', resolve, reject, 1));
  assert.equal(calls, 2);
});

test('late results after cancellation cannot update state', async t => {
  let resolve;
  t.mock.method(globalThis, 'fetch', () => new Promise(done => { resolve = done; }));
  const cancel = scheduleCalculation('id', () => assert.fail('stale success'), () => assert.fail('stale error'), 0);
  await new Promise(done => setTimeout(done, 10));
  cancel();
  resolve(Response.json({ data: null }));
  await new Promise(done => setTimeout(done, 10));
});

test('failed requests leave loading through error callback', async t => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('offline'); });
  await new Promise(resolve => scheduleCalculation('id', () => assert.fail(), resolve, 0));
});

test('missing amounts never become zero; real zero and negative values are preserved', () => {
  for (const value of [null, undefined, NaN, Infinity, '0']) assert.equal(formatCalculationAmount(value), '-');
  assert.equal(formatCalculationAmount(0), '0 Ar');
  assert.equal(formatCalculationAmount(-5), '-5 Ar');
});
