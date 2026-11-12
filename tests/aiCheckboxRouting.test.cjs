const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

// Execute the actual hook with a small hooks scheduler and a fake API boundary.
// No source-text assertions or alternative routing implementation.
function mountSender(initialMode, newConversation = false) {
  const slots = [], effects = [], cleanups = [];
  let cursor = 0;
  const hooks = {
    useRef(value) { const i = cursor++; return slots[i] ??= { current: value }; },
    useState(value) { const i = cursor++; if (!(i in slots)) slots[i] = value;
      return [slots[i], next => { slots[i] = typeof next === 'function' ? next(slots[i]) : next; }]; },
    useCallback(fn, deps) { const i = cursor++, old = slots[i];
      if (!old || deps.some((d, n) => !Object.is(d, old.deps[n]))) slots[i] = { fn, deps };
      return slots[i].fn;
    },
    useEffect(fn, deps) { const i = cursor++, old = slots[i];
      if (!old || deps.some((d, n) => !Object.is(d, old[n]))) {
        slots[i] = deps; effects.push(() => { cleanups[i]?.(); cleanups[i] = fn(); });
      }
    },
  };
  const calls = [], appended = [];
  const flush = deferred(), creation = deferred(), response = deferred();
  class ApiError extends Error {}
  const api = { ApiError, sendAiMessage: async (...args) => { calls.push(['messages', ...args]); return response.promise; } };
  const filename = path.resolve(__dirname, '../src/components/edit-bp-page/components/assistant-ai/hooks/useAiMessageSender.ts');
  const compiled = new Module(filename, module);
  compiled.filename = filename; compiled.paths = Module._nodeModulePaths(path.dirname(filename));
  const nativeRequire = compiled.require.bind(compiled);
  compiled.require = name => name === 'react' ? hooks : name === '../api' ? api : nativeRequire(name);
  compiled._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, fileName: filename,
  }).outputText, filename);
  let options = {
    businessPlanId: 'bp', activeConversationId: newConversation ? null : 'chat',
    modificationMode: initialMode, beforeSend: () => flush.promise,
    createConversation: () => creation.promise, reloadConversations: async () => {},
    messages: { conversationId: newConversation ? null : 'chat', isReady: !newConversation,
      isLoading: newConversation, error: null, appendMessage: m => { appended.push(m); return true; }, reloadMessages: async () => {} },
    modificationProposals: { conversationId: newConversation ? null : 'chat',
      createProposal: async content => { calls.push(['modification-proposals', content]); return response.promise; }, reloadProposals: async () => {} },
  };
  let current;
  function render(patch = {}) {
    options = { ...options, ...patch }; cursor = 0;
    current = compiled.exports.default(options);
    effects.splice(0).forEach(run => run());
    return current;
  }
  render();
  return { calls, appended, flush, creation, response, render, send: text => current.sendMessage(text),
    ready() { return render({ activeConversationId: 'chat', messages: { ...options.messages, conversationId: 'chat', isReady: true, isLoading: false },
      modificationProposals: { ...options.modificationProposals, conversationId: 'chat' } }); },
    unmount() { cleanups.forEach(fn => fn?.()); } };
}
function deferred() { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; }
const settle = () => new Promise(resolve => setImmediate(resolve));

for (const mode of [false, true]) {
  test(`checkbox ${mode ? 'ON' : 'OFF'} calls exactly one endpoint and keeps mode during flush and request`, async () => {
    const h = mountSender(mode);
    try {
      const sending = h.send('  Analyse mon BP  ');
      h.render({ modificationMode: !mode }); // switch while autosave is still running
      assert.deepEqual(h.calls, []);
      h.flush.resolve(); assert.equal(await sending, true);
      assert.deepEqual(h.calls, mode ? [['modification-proposals', 'Analyse mon BP']] : [['messages', 'chat', 'Analyse mon BP']]);
      h.render({ modificationMode: mode }); h.render({ modificationMode: !mode });
      assert.equal(await h.send('second concurrent send'), false);
      h.response.resolve({ id: 'assistant', role: 'assistant', content: 'Response', createdAt: 'now' });
      await settle(); assert.equal(h.calls.length, 1);
      assert.equal(h.appended.filter(m => m.role === 'user').length, 1);
      assert.equal(h.appended.filter(m => m.role === 'assistant').length, mode ? 0 : 1);
    } finally { h.unmount(); }
  });
  test(`first deferred conversation keeps captured ${mode ? 'ON' : 'OFF'} mode`, async () => {
    const h = mountSender(mode, true);
    try {
      const sending = h.send('Propose-moi une offre adaptee');
      h.flush.resolve(); await settle();
      h.render({ modificationMode: !mode });
      h.creation.resolve({ id: 'chat' }); await settle();
      assert.deepEqual(h.calls, []); // wait for conversation history readiness
      h.ready(); assert.equal(await sending, true);
      assert.equal(h.calls.length, 1);
      assert.equal(h.calls[0][0], mode ? 'modification-proposals' : 'messages');
      h.response.resolve({ id: 'assistant', role: 'assistant', content: 'Response', createdAt: 'now' }); await settle();
    } finally { h.unmount(); }
  });
}

test('each subsequent send uses its own newly captured checkbox value in the same conversation', async () => {
  const h = mountSender(false);
  try {
    h.flush.resolve();
    h.response.resolve({ id: 'assistant', role: 'assistant', content: 'Response', createdAt: 'now' });
    for (const mode of [false, true, false]) {
      h.render({ modificationMode: mode });
      assert.equal(await h.send('current send'), true); await settle();
    }
    assert.deepEqual(h.calls.map(c => c[0]), ['messages', 'modification-proposals', 'messages']);
    assert.ok(h.calls.filter(c => c[0] === 'messages').every(c => c[1] === 'chat'));
  } finally { h.unmount(); }
});
