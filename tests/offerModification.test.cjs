const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
// Compile the real card and its local imports for Node, without changing the app's build config.
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: filename,
  }).outputText, filename);
}
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const Card = require('../src/components/edit-bp-page/components/assistant-ai/components/ModificationProposalCard.tsx').default;
const { applyConfirmedProposal } = require('../src/lib/applyConfirmedProposal.ts');
const { offersForSave, mergeSavedOfferIds } = require('../src/lib/offerIdentity.ts');
const render = change => renderToStaticMarkup(React.createElement(Card, {
  proposal: { id: 'p', status: 'PENDING', summary: 'Offers', changes: [change] },
  isApplying: false, applyDisabled: false, onApply: async () => assert.fail('render must never APPLY'),
}));
const base = { operation: 'SET', target: { targetType: 'OFFER', offerName: 'Basic', offerId: 'stable' }, unit: 'MGA', requiresFinancialRecalculation: true };
test('CREATE card displays all business inputs and waits for confirmation', () => {
  const html = render({ ...base, type: 'OFFER_CREATE', valueType: 'OFFER', target: { targetType: 'BUSINESS_PLAN' },
    createOffer: { name: 'Premium', description: 'Preventive maintenance', offerType: 'SERVICE', salePriceHt: 180000,
      unitCostHt: 70000, saleVat: 20, costVat: 0, salesCount: 15, salesFrequency: 'ANNUELLE' } });
  for (const text of ['AJOUT', 'Premium', 'Preventive maintenance', 'Service', 'Prix de vente HT', 'Coût unitaire HT', 'ANNUELLE', 'Appliquer']) assert.ok(html.includes(text), text);
});
test('DELETE card names the target and warns about financial removal', () => {
  const html = render({ ...base, type: 'OFFER_DELETE', valueType: 'NONE' });
  for (const text of ['SUPPRESSION', 'Basic', 'prévisions financières', 'après confirmation']) assert.ok(html.includes(text), text);
});
test('RENAME and prices show actual old and new values', () => {
  const rename = render({ ...base, type: 'OFFER_NAME', valueType: 'STRING', oldStringValue: 'Basic', newStringValue: 'Essential' });
  assert.ok(rename.includes('Basic')); assert.ok(rename.includes('Essential'));
  for (const type of ['OFFER_SALE_PRICE_HT', 'OFFER_UNIT_COST_HT']) {
    const html = render({ ...base, type, valueType: 'DOUBLE', oldDoubleValue: 100, newDoubleValue: 120 });
    assert.ok(html.includes('100 Ar')); assert.ok(html.includes('120 Ar'));
  }
});
test('APPLY awaits flush, request and reload, which triggers calculation refresh', async () => {
  const events = [];
  await applyConfirmedProposal({ flush: async () => events.push('flush'), apply: async () => { events.push('request'); return { id: 'p' }; },
    isCurrent: () => true, remember: p => { assert.equal(p.id, 'p'); events.push('proposal'); },
    reload: async () => { events.push('reload'); events.push('calculations'); }, phase: () => {} });
  assert.deepEqual(events, ['flush', 'request', 'proposal', 'reload', 'calculations']);
});
test('failed flush or stale conversation never mutates the editor', async () => {
  await assert.rejects(applyConfirmedProposal({ flush: async () => { throw Error('save failed'); }, apply: async () => assert.fail(),
    isCurrent: () => true, remember: () => assert.fail(), reload: async () => assert.fail(), phase: () => {} }));
  await applyConfirmedProposal({ flush: async () => {}, apply: async () => ({}), isCurrent: () => false,
    remember: () => assert.fail(), reload: async () => assert.fail(), phase: () => {} });
});
test('manual autosave preserves server UUID through concurrent rename and reorder', () => {
  const submitted = [{ nomOffre: 'New', clientOfferKey: 'local' }];
  assert.deepEqual(offersForSave(submitted), [{ nomOffre: 'New' }]);
  const current = [{ nomOffre: 'Other', offerId: 'other' }, { ...submitted[0], nomOffre: 'Renamed', coutUnitaireHT: 5 }];
  const merged = mergeSavedOfferIds(current, submitted, [{ nomOffre: 'New', offerId: 'server' }]);
  assert.equal(merged[1].offerId, 'server'); assert.equal(merged[1].nomOffre, 'Renamed'); assert.equal(merged[1].coutUnitaireHT, 5);
  assert.equal(merged[0].offerId, 'other');
});
