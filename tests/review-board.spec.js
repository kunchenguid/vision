const { test, expect } = require('@playwright/test');
const { readFile, writeFile, copyFile, mkdtemp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const assets = path.join(__dirname, '../skills/vision/assets');
let fixtureDirectory;

test.beforeAll(async () => {
  fixtureDirectory = await mkdtemp(path.join(tmpdir(), 'vision-review-'));
  const cards = [1, 2].map(number => ({
    id: `H-${number}`,
    title: `Hypothetical ${number}`,
    body: 'Automated regression fixture, not an author decision.',
    tests: 'A testable project principle.',
    why: 'Either verdict requires a reason.',
  }));
  const template = await readFile(path.join(assets, 'review-template.html'), 'utf8');
  const html = template
    .replaceAll('{{PROJECT}}', 'Browser regression fixture')
    .replaceAll('{{RUN_NOTE}}', 'Automated test, not a vision approval')
    .replaceAll('{{DRAFT_MARKDOWN}}', '# Test vision\nOnly automated fixture content.')
    .replace(/\/\/ \{\{CARDS\}\}[^\n]*\n/, `${cards.map(card => JSON.stringify(card)).join(',\n')}\n`);
  await writeFile(path.join(fixtureDirectory, 'review.html'), html);
  await copyFile(path.join(assets, 'review.css'), path.join(fixtureDirectory, 'review.css'));
});

test.afterAll(async () => {
  await rm(fixtureDirectory, { recursive: true, force: true });
});

async function openBoard(page, withBridge = true) {
  if (withBridge) {
    // Simulate the public Lavish SDK boundary, not the real host. Like the SDK,
    // data is serialized into the editable prompt, not sent as a separate object.
    // Queue edits/removals below use this host's visible controls.
    await page.addInitScript(() => {
      const queued = new Map();
      const state = { calls: [], sent: [] };
      window.testHost = state;
      let panel;
      function renderQueue() {
        if (!panel) return;
        panel.replaceChildren();
        for (const [key, item] of queued) {
          const row = document.createElement('div');
          const input = document.createElement('textarea');
          input.setAttribute('aria-label', `Queued prompt ${key}`);
          input.value = item.prompt;
          input.addEventListener('input', () => { item.prompt = input.value; });
          const remove = document.createElement('button');
          remove.textContent = `Remove queued ${key}`;
          remove.addEventListener('click', () => {
            queued.delete(key);
            renderQueue();
          });
          row.append(input, remove);
          panel.append(row);
        }
      }
      window.lavish = {
        queuePrompt(prompt, options = {}) {
          const key = options.queueKey;
          const item = { _lavishQueueKey: key, prompt: String(prompt || '') };
          if (options.data) item.prompt += '\n\nContext data:\n' + JSON.stringify(options.data, null, 2);
          state.calls.push(structuredClone(item));
          queued.set(key, item);
          renderQueue();
        },
        sendQueuedPrompts() {
          state.sent.push(structuredClone([...queued.values()]));
          queued.clear();
          renderQueue();
        },
      };
      document.addEventListener('DOMContentLoaded', () => {
        panel = document.createElement('aside');
        panel.setAttribute('aria-label', 'Simulated host queue');
        panel.style.cssText = 'position:fixed;bottom:8px;left:8px;width:340px;background:white;z-index:100';
        document.body.append(panel);
        renderQueue();
      });
    });
  }
  await page.goto(pathToFileURL(path.join(fixtureDirectory, 'review.html')).href);
}

async function recordCard(page, index, verdict, notes) {
  const card = page.locator(`#vrc-${index}`);
  await card.getByRole('button', { name: verdict, exact: true }).click();
  await card.locator('textarea').fill(notes);
  await card.getByRole('button', { name: 'Record verdict', exact: true }).click();
}

async function sentMessages(page) {
  await expect.poll(() => page.evaluate(() => window.testHost.sent.length)).toBe(1);
  return page.evaluate(() => window.testHost.sent[0]);
}

function verdictsIn(messages) {
  return messages.flatMap(message => {
    const context = message.prompt.split('\n\nContext data:\n')[1];
    if (!context) return [];
    const data = JSON.parse(context);
    return data.verdicts ?? (data.id ? [data] : []);
  });
}

test('repeated Enter records only the focused card and leaves the next card unanswered', async ({ page }) => {
  await openBoard(page);
  const first = page.locator('#vrc-0');
  const second = page.locator('#vrc-1');
  await first.getByRole('button', { name: 'In vision', exact: true }).click();
  await first.locator('textarea').fill('Only the first hypothetical was answered.');
  await first.getByRole('button', { name: 'Record verdict', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await expect(first).toBeHidden();
  await expect.soft(second).toBeVisible();
  await expect.soft(second.getByRole('button', { name: 'Record verdict', exact: true })).toBeDisabled();
  await expect.soft(page.locator('#vr-done')).toBeHidden();
  expect(verdictsIn(await page.evaluate(() => window.testHost.calls)).map(verdict => verdict.id)).toEqual(['H-1']);
});

test('sending does not resurrect a verdict removed from the host queue', async ({ page }) => {
  await openBoard(page);
  await recordCard(page, 0, 'In vision', 'First recorded decision.');
  await recordCard(page, 1, 'Conditional', 'Second recorded decision.');
  await page.getByRole('button', { name: 'Remove queued H-1', exact: true }).click();
  await page.locator('#vr-send').click();
  const messages = await sentMessages(page);
  expect(verdictsIn(messages).map(verdict => verdict.id)).toEqual(['H-2']);
});

test('sending preserves a host-edited prompt without adding a stale verdict copy', async ({ page }) => {
  await openBoard(page);
  await recordCard(page, 0, 'In vision', 'Original reasoning that the author replaced.');
  await recordCard(page, 1, 'Conditional', 'Second recorded decision.');
  const edited = 'H-1: Off mission. Revised reasoning from the host queue editor.';
  await page.getByRole('textbox', { name: 'Queued prompt H-1', exact: true }).fill(edited);
  await page.locator('#vr-send').click();
  const messages = await sentMessages(page);
  expect(messages.find(message => message._lavishQueueKey === 'H-1').prompt).toBe(edited);
  expect(JSON.stringify(messages)).not.toContain('Original reasoning that the author replaced.');
});

test('sending an emptied host queue does not recreate any feedback', async ({ page }) => {
  await openBoard(page);
  await recordCard(page, 0, 'In vision', 'First reason.');
  await recordCard(page, 1, 'Off mission', 'Second reason.');
  await page.getByRole('button', { name: 'Remove queued H-1', exact: true }).click();
  await page.getByRole('button', { name: 'Remove queued H-2', exact: true }).click();
  await page.locator('#vr-send').click();
  expect(await sentMessages(page)).toEqual([]);
});

test('normal two-card submission sends each verdict once without a duplicate aggregate', async ({ page }) => {
  await openBoard(page);
  await recordCard(page, 0, 'In vision', 'First reason.');
  await recordCard(page, 1, 'Off mission', 'Second reason.');
  await page.locator('#vr-send').click();
  const messages = await sentMessages(page);
  expect(messages).toHaveLength(2);
  expect(verdictsIn(messages)).toEqual([
    { id: 'H-1', verdict: 'In vision', notes: 'First reason.' },
    { id: 'H-2', verdict: 'Off mission', notes: 'Second reason.' },
  ]);
  await expect(page.locator('#vr-send')).toBeEnabled();
  await page.locator('#vr-send').click();
  await expect.poll(() => page.evaluate(() => window.testHost.sent.length)).toBe(2);
  expect(await page.evaluate(() => window.testHost.sent[1])).toEqual([]);
});

test('without a host bridge the board does not claim that verdicts were sent', async ({ page }) => {
  await openBoard(page, false);
  await recordCard(page, 0, 'In vision', 'First reason.');
  await recordCard(page, 1, 'Off mission', 'Second reason.');
  await expect(page.locator('#vr-done')).toBeVisible();
  const send = page.locator('#vr-send');
  if (await send.isEnabled()) await send.click();
  await expect(page.getByText('Sent - the agent is folding these into the next draft.', { exact: true })).toBeHidden();
  await expect(send).not.toHaveText('Sent for the next round');
  await expect(page.locator('#vr-sent')).toBeVisible();
  await expect(page.locator('#vr-sent')).toContainText('lavish-axi');
});
