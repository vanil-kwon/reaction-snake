// Reaction Snake analytics + live presence.
// The game itself remains fully playable offline; analytics are best-effort.
const SUPABASE_URL = 'https://cdotskwkigbuuvingyym.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_JcE6E_d-bjSaa5lIkLPYpg_fFIvSg4h';
const PRESENCE_TOPIC = 'reaction-snake:online';
const QUEUE_KEY = 'rs-analytics-queue-v1';

(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const statusEl = $('statsStatus');
  const visitorId = getVisitorId();
  let sb = null;
  let channel = null;
  let initPromise = null;
  let initialized = false;
  let refreshTimer = null;
  let pageViewQueued = false;
  let isTracked = false;

  function getVisitorId() {
    const key = 'rs-analytics-visitor';
    try {
      let id = localStorage.getItem(key);
      if (!id) {
        id = (crypto.randomUUID ? crypto.randomUUID() :
          Date.now().toString(36) + Math.random().toString(36).slice(2) +
          Math.random().toString(36).slice(2));
        localStorage.setItem(key, id);
      }
      return id;
    } catch (_) {
      return 'session-' + Date.now().toString(36) + Math.random().toString(36).slice(2);
    }
  }

  function readQueue() {
    try {
      const value = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      return Array.isArray(value) ? value.slice(-100) : [];
    } catch (_) {
      return [];
    }
  }

  function writeQueue(queue) {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-100))); } catch (_) {}
  }

  function enqueue(type, mode, score) {
    const event = {
      visitor_id: visitorId,
      event_type: type,
      mode: mode || 'classic',
      score: Number.isFinite(score) ? Math.max(0, Math.min(1000000, Math.floor(score))) : 0
    };
    const queue = readQueue();
    if (type === 'page_view' && queue.some(item => item.event_type === 'page_view')) return;
    queue.push(event);
    writeQueue(queue);
    flushQueue();
  }

  async function flushQueue() {
    if (!sb || !navigator.onLine) return;
    let queue = readQueue();
    while (queue.length) {
      const event = queue[0];
      const { error } = await sb.from('game_events').insert(event);
      if (error && !(event.event_type === 'page_view' && error.code === '23505')) {
        console.warn('Reaction Snake event queued:', error.message);
        break;
      }
      queue.shift();
      writeQueue(queue);
    }
  }

  async function refreshStats() {
    if (!sb || !navigator.onLine) return;
    const { data, error } = await sb.rpc('reaction_snake_stats');
    if (error) throw error;
    const stats = data || {};
    $('globalVisits').textContent = Number(stats.visits || 0).toLocaleString();
    $('globalGames').textContent = Number(stats.games || 0).toLocaleString();
    $('globalBest').textContent = Number(stats.best || 0).toLocaleString();
    $('globalMode').textContent = stats.popular_mode || '—';
  }

  function updateOnline() {
    if (!channel) return;
    $('globalOnline').textContent = String(Object.keys(channel.presenceState()).length);
  }

  async function trackPresence() {
    if (!channel || !navigator.onLine || document.hidden) return;
    try {
      const result = await channel.track({
        visitor: visitorId,
        online_at: new Date().toISOString()
      });
      isTracked = result === 'ok' || result?.status === 'ok';
      updateOnline();
    } catch (error) {
      console.warn('Reaction Snake presence:', error);
    }
  }

  async function init() {
    if (initialized || initPromise || !navigator.onLine) return initPromise;
    initPromise = (async () => {
      if (!sb) {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        sb = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: { persistSession: false, autoRefreshToken: false }
        });
      }

      if (!pageViewQueued) {
        pageViewQueued = true;
        enqueue('page_view', currentMode(), 0);
      }
      await flushQueue();
      try { await refreshStats(); }
      catch (error) { console.warn('Reaction Snake stats refresh:', error); }

      if (!channel) {
        channel = sb.channel(PRESENCE_TOPIC, {
          config: { private: true, presence: { key: visitorId } }
        });
        channel
          .on('presence', { event: 'sync' }, updateOnline)
          .on('presence', { event: 'join' }, updateOnline)
          .on('presence', { event: 'leave' }, updateOnline)
          .subscribe(async state => {
            if (state === 'SUBSCRIBED') {
              statusEl.textContent = 'Live';
              if (!document.hidden) await trackPresence();
              updateOnline();
            } else if (state === 'CHANNEL_ERROR' || state === 'TIMED_OUT' || state === 'CLOSED') {
              isTracked = false;
              statusEl.textContent = 'Reconnecting…';
              $('globalOnline').textContent = '—';
            }
          });
      }

      initialized = true;
      if (!refreshTimer) {
        refreshTimer = setInterval(() => {
          refreshStats().catch(error => console.warn('Reaction Snake stats refresh:', error));
        }, 30000);
      }
    })().catch(error => {
      initPromise = null;
      statusEl.textContent = navigator.onLine ? 'Stats unavailable' : 'Offline';
      console.warn('Reaction Snake stats:', error);
    });
    return initPromise;
  }

  function currentMode() {
    return document.querySelector('.mode.active')?.dataset.mode || 'classic';
  }

  // Capture events immediately, including while offline; send them when a connection returns.
  window.addEventListener('rs:game-end', event => {
    const detail = event.detail || {};
    enqueue('game_finished', detail.mode || currentMode(), Number(detail.score) || 0);
    if (sb) refreshStats().catch(() => {});
  });
  window.addEventListener('rs:mode', event => {
    enqueue('mode_selected', event.detail?.mode || currentMode(), 0);
  });

  window.addEventListener('online', () => {
    if (!initialized) init();
    else {
      flushQueue();
      refreshStats().catch(() => {});
      trackPresence();
    }
  });

  window.addEventListener('offline', () => {
    statusEl.textContent = 'Offline';
    $('globalOnline').textContent = '—';
  });

  document.addEventListener('visibilitychange', () => {
    if (!channel) return;
    if (document.hidden) {
      channel.untrack().then(() => { isTracked = false; }).catch(() => {});
    } else {
      trackPresence();
    }
  });

  window.addEventListener('pagehide', () => {
    if (channel && isTracked) channel.untrack().catch(() => {});
  });

  if (!navigator.onLine) statusEl.textContent = 'Offline';
  else init();
})();
