// Website chat with an Akkad agent (the speech-bubble button in the header).
import { S, save, site, api, esc, icon, on, $, openLayer, toast } from './core.js';

const chatApi = async (path, body) => {
  const headers = { 'x-akkad-chat': S.chat || '' };
  if (body) { headers['content-type'] = 'application/json'; headers['x-akkad'] = '1'; }
  const res = await fetch('/api' + path, { method: body ? 'POST' : 'GET', headers, credentials: 'same-origin', body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || 'Something went wrong. Please try again.'); e.status = res.status; throw e; }
  return data;
};

export function openChat() {
  let last = 0, timer = null, closed = false;
  const box = openLayer('sheet', `<div class="chat">
    <div class="chat-head"><span class="ic-circle">${icon('chat', 22)}</span><div><h2 class="plain">Chat with Akkad</h2><p class="muted" id="chat-status">Ask us anything about pests, prices or your booking.</p></div></div>
    <div class="chat-log" id="chat-log" aria-live="polite"><p class="chat-hint">Type your question below. An agent replies here in this chat.</p></div>
    <div class="chat-quick" id="chat-quick">${['What will it cost?', 'Can you come today?', 'Is it safe for kids and pets?'].map((q) => `<button class="chip" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
    <form class="chat-form" novalidate><label class="field"><span class="sr">Your message</span><input name="text" autocomplete="off" maxlength="1000" placeholder="Type your message"></label><button class="btn chat-send" aria-label="Send">${icon('arrow', 20)}</button></form>
    <p class="chat-alt">Prefer to talk? <a href="${site.company.phoneHref}">Call ${esc(site.company.phone)}</a> · <a href="${site.company.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></p></div>`,
  { onClose: () => { closed = true; clearInterval(timer); } });
  const log = $('#chat-log', box), input = $('[name=text]', box);
  const add = (list) => {
    for (const m of list) {
      if (m.n <= last) continue;
      last = m.n;
      const hint = $('.chat-hint', log); if (hint) hint.remove();
      const el = document.createElement('div');
      el.className = 'msg ' + m.from;
      el.innerHTML = `${m.from === 'agent' ? '<b>Akkad agent</b>' : ''}<p>${esc(m.text)}</p><time>${esc(m.time)}</time>`;
      log.appendChild(el);
    }
    if (list.length) { $('#chat-quick', box).hidden = true; log.scrollTop = log.scrollHeight; }
  };
  const status = (r) => { if (r.agentConnected) $('#chat-status', box).textContent = 'An agent is with you.'; };
  const load = async () => {
    if (!S.chat) return;
    try { const r = await chatApi('/chat?after=' + last); add(r.messages); status(r); }
    catch (e) { if (e.status === 404) { S.chat = null; save(); } }
  };
  const send = async (text) => {
    text = text.trim();
    if (!text) return;
    input.value = '';
    try {
      if (!S.chat) { S.chat = (await chatApi('/chat/start', { area: S.area ? S.area.name : '' })).token; save(); }
      const r = await chatApi('/chat/messages', { text, after: last });
      add(r.messages); status(r);
    } catch (e) {
      if (e.status === 404) { S.chat = null; save(); return send(text); }
      input.value = text; toast(e.message);
    }
  };
  $('form', box).addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });
  on(box, '[data-q]', (b) => send(b.dataset.q));
  load();
  timer = setInterval(() => { if (!closed && !document.hidden) load(); }, 4000);
  if (matchMedia('(min-width: 900px)').matches) input.focus();
}
on(document, '[data-chat]', () => openChat());
