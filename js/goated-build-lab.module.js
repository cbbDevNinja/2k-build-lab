            /* ── CHARACTER MAKER ──────────────────────────────────────────────────
   Avatars people BUILD instead of upload.

   This is the answer to the moderation problem rather than a dodge around it:
   with a fixed parts list there is nothing vile to assemble, nothing to store
   and nothing to serve. A whole avatar is a short config string living in a
   text column -- no bucket, no bandwidth, no image classifier -- and it renders
   identically in the chip, the profile and the feed.

   Parts are deliberately plain: shapes and colours, no text, no symbols, no
   flags. Someone determined can make an ugly little man and that is the worst
   available outcome.

   ON THE JERSEYS: colours are NOT protectable, so every real colourway is fair
   game. Team NAMES are trademarks, and using them to decorate a paid product's
   feature list is weaker ground than naming a platform someone plays on. So
   these are labelled by CITY and colourway -- everyone finds their team in a
   second, and no mark is used. Swapping in team names is one edit to `nm`.
   Colours are close to the real palettes, not official values.               */

            var AV_CFG = window.GBL_AVATAR_PARTS;
            if (!AV_CFG) {
                throw new Error('Missing avatar config payload: js/goated-build-lab.avatar-config.js');
            }
            var AV_SKIN = AV_CFG.AV_SKIN;
            var AV_HAIRC = AV_CFG.AV_HAIRC;
            var AV_JERSEY = AV_CFG.AV_JERSEY;
            var AV_BG = AV_CFG.AV_BG;
            var AV_NHAIR = AV_CFG.AV_NHAIR,
              AV_NFACE = AV_CFG.AV_NFACE,
              AV_NACC = AV_CFG.AV_NACC,
              AV_NBODY = AV_CFG.AV_NBODY;
            var AV_LAYERS = AV_CFG.AV_LAYERS;
            function avCfgParse(s) {
                var p = String(s || '').split('.')
                  , out = {};
                for (var i = 0; i < AV_LAYERS.length; i++) {
                    var v = parseInt(p[i], 10);
                    out[AV_LAYERS[i].key] = (isFinite(v) && v >= 0 && v < AV_LAYERS[i].n) ? v : 0;
                }
                return out;
            }
            function avCfgString(c) {
                return AV_LAYERS.map(function(l) {
                    return c[l.key] || 0;
                }).join('.');
            }
            function avCfgFromName(name) {
                var h = 0
                  , t = String(name || '?');
                for (var i = 0; i < t.length; i++)
                    h = (h * 31 + t.charCodeAt(i)) >>> 0;
                var c = {};
                for (var j = 0; j < AV_LAYERS.length; j++) {
                    c[AV_LAYERS[j].key] = h % AV_LAYERS[j].n;
                    h = Math.floor(h / 7) + 13;
                }
                return c;
            }

            /* One renderer for every size. The viewBox is fixed, so the same string draws
   the same face at 18px in a feed row and 116px in the editor. */
            function avSvg(cfg, px) {
                var c = (typeof cfg === 'string') ? avCfgParse(cfg) : (cfg || avCfgParse(''));
                px = px || 40;
                var skin = AV_SKIN[c.skin]
                  , hair = AV_HAIRC[c.hairc];
                var kit = AV_JERSEY[c.jersey] || AV_JERSEY[0]
                  , j1 = kit[1]
                  , j2 = kit[2];
                /* BUILD changes the silhouette, not the face. Two shoulder widths and two
     jaw widths is enough to read as a different person; anything more becomes
     caricature, which is not what people want to see themselves as. */
                var wide = c.body === 0;
                var sw = wide ? 36 : 31;
                /* shoulder half-width */
                var jw = wide ? 21 : 19;
                /* jaw / head half-width */

                var s = '<svg class="avsvg" width="' + px + '" height="' + px + '" viewBox="0 0 100 100" ' + 'aria-hidden="true" focusable="false">';
                s += '<circle cx="50" cy="50" r="50" fill="' + AV_BG[c.bg] + '"/>';
                /* shoulders, then trim, then neck, then head -- painter's order, so the kit
     tucks behind the jaw instead of over it */
                s += '<path d="M' + (50 - sw) + ' 100a' + sw + ' 30 0 0 1 ' + (sw * 2) + ' 0z" fill="' + j1 + '"/>';
                /* collar + shoulder stripe in the secondary colour: the thing that actually
     makes a two-colour kit recognisable */
                s += '<path d="M' + (50 - sw + 4) + ' 100a' + (sw - 4) + ' 26 0 0 1 ' + ((sw - 4) * 2) + ' 0z" fill="none" stroke="' + j2 + '" stroke-width="3" opacity=".9"/>';
                s += '<path d="M41 84q9 9 18 0" fill="none" stroke="' + j2 + '" stroke-width="3.5"/>';
                s += '<path d="M42 78h16v10H42z" fill="' + skin + '"/>';
                s += '<ellipse cx="' + (50 - jw - 10) + '" cy="50" rx="4" ry="6" fill="' + skin + '"/>';
                s += '<ellipse cx="' + (50 + jw + 10) + '" cy="50" rx="4" ry="6" fill="' + skin + '"/>';
                s += '<ellipse cx="50" cy="47" rx="' + jw + '" ry="25" fill="' + skin + '"/>';

                var L = 50 - jw
                  , R = 50 + jw;
                if (c.hair === 1)
                    s += '<path d="M' + L + ' 42a' + jw + ' 23 0 0 1 ' + (jw * 2) + ' 0 34 34 0 0 0-' + (jw * 2) + ' 0z" fill="' + hair + '"/>';
                else if (c.hair === 2)
                    s += '<path d="M' + L + ' 42a' + jw + ' 30 0 0 1 ' + (jw * 2) + ' 0c0-14-6-22-' + jw + '-22S' + L + ' 28 ' + L + ' 42z" fill="' + hair + '"/>';
                else if (c.hair === 3)
                    s += '<circle cx="50" cy="34" r="26" fill="' + hair + '"/>' + '<ellipse cx="50" cy="47" rx="' + jw + '" ry="25" fill="' + skin + '"/>' + '<path d="M' + L + ' 44a' + jw + ' 24 0 0 1 ' + (jw * 2) + ' 0 30 30 0 0 0-' + (jw * 2) + ' 0z" fill="' + hair + '"/>';
                else if (c.hair === 4)
                    s += '<path d="M' + L + ' 44a' + jw + ' 23 0 0 1 ' + (jw * 2) + ' 0 34 34 0 0 0-' + (jw * 2) + ' 0z" fill="' + hair + '"/>' + '<path d="M32 40v26M40 36v30M50 34v32M60 36v30M68 40v26" stroke="' + hair + '" stroke-width="4" stroke-linecap="round" fill="none"/>';
                else if (c.hair === 5)
                    s += '<path d="M' + L + ' 43a' + jw + ' 23 0 0 1 ' + (jw * 2) + ' 0 34 34 0 0 0-' + (jw * 2) + ' 0z" fill="' + hair + '"/>' + '<path d="M33 34h16" stroke="' + skin + '" stroke-width="2.5" stroke-linecap="round"/>';
                else if (c.hair === 6)
                    /* long, straight */
                    s += '<path d="M' + (L - 2) + ' 46a' + (jw + 2) + ' 26 0 0 1 ' + ((jw + 2) * 2) + ' 0v30h-8V48a' + (jw - 6) + ' 15 0 0 0-' + ((jw - 6) * 2) + ' 0v28h-8z" fill="' + hair + '"/>';
                else if (c.hair === 7)
                    /* bun */
                    s += '<circle cx="50" cy="17" r="9" fill="' + hair + '"/>' + '<path d="M' + L + ' 44a' + jw + ' 24 0 0 1 ' + (jw * 2) + ' 0 34 34 0 0 0-' + (jw * 2) + ' 0z" fill="' + hair + '"/>';
                else if (c.hair === 8)
                    /* ponytail */
                    s += '<path d="M' + L + ' 43a' + jw + ' 23 0 0 1 ' + (jw * 2) + ' 0 34 34 0 0 0-' + (jw * 2) + ' 0z" fill="' + hair + '"/>' + '<path d="M' + (R - 2) + ' 36q16 6 12 26-2 10-10 8 8-16-6-28z" fill="' + hair + '"/>';
                else if (c.hair === 9)
                    /* long curly */
                    s += '<path d="M' + (L - 3) + ' 44a' + (jw + 3) + ' 25 0 0 1 ' + ((jw + 3) * 2) + ' 0v18a9 9 0 0 1-9 9 9 9 0 0 0-9 9h-4V52a' + (jw - 7) + ' 13 0 0 0-' + ((jw - 7) * 2) + ' 0v28h-4a9 9 0 0 0-9-9 9 9 0 0 1-9-9z" fill="' + hair + '"/>';
                else if (c.hair === 10)
                    /* twin buns */
                    s += '<circle cx="' + (L + 1) + '" cy="24" r="8" fill="' + hair + '"/>' + '<circle cx="' + (R - 1) + '" cy="24" r="8" fill="' + hair + '"/>' + '<path d="M' + L + ' 43a' + jw + ' 23 0 0 1 ' + (jw * 2) + ' 0 34 34 0 0 0-' + (jw * 2) + ' 0z" fill="' + hair + '"/>';
                else if (c.hair === 11)
                    /* bob */
                    s += '<path d="M' + (L - 2) + ' 47a' + (jw + 2) + ' 25 0 0 1 ' + ((jw + 2) * 2) + ' 0v14h-6V50a' + (jw - 5) + ' 14 0 0 0-' + ((jw - 5) * 2) + ' 0v11h-6z" fill="' + hair + '"/>';

                s += '<path d="M38 43h9M53 43h9" stroke="#2b241f" stroke-width="2.6" stroke-linecap="round"/>';
                s += '<circle cx="42" cy="51" r="3.1" fill="#2b241f"/>' + '<circle cx="58" cy="51" r="3.1" fill="#2b241f"/>';
                /* a small highlight is the difference between a face and a mask */
                s += '<circle cx="43.1" cy="50" r="1" fill="#fff" opacity=".85"/>' + '<circle cx="59.1" cy="50" r="1" fill="#fff" opacity=".85"/>';
                s += '<path d="M44 64q6 5 12 0" stroke="#7d4b39" stroke-width="2.4" fill="none" ' + 'stroke-linecap="round"/>';

                if (c.face === 1)
                    s += '<path d="M' + (L + 2) + ' 56a' + (jw - 2) + ' 20 0 0 0 ' + ((jw - 2) * 2) + ' 0 ' + jw + ' 25 0 0 1-' + ((jw - 2) * 2) + ' 0z" fill="' + hair + '" opacity=".28"/>';
                else if (c.face === 2)
                    s += '<path d="M43 60q7-4 14 0-7 3-14 0z" fill="' + hair + '"/>';
                else if (c.face === 3)
                    s += '<path d="M' + (L + 1) + ' 52a' + (jw - 1) + ' 24 0 0 0 ' + ((jw - 1) * 2) + ' 0 ' + (jw + 1) + ' 30 0 0 1-' + ((jw - 1) * 2) + ' 0z" fill="' + hair + '"/>' + '<path d="M43 60q7-4 14 0-7 3-14 0z" fill="' + hair + '"/>';

                if (c.acc === 1 || c.acc === 3)
                    s += '<path d="M' + L + ' 38a' + jw + ' 21 0 0 1 ' + (jw * 2) + ' 0z" fill="' + j1 + '"/>' + '<path d="M' + L + ' 38a' + jw + ' 21 0 0 1 ' + (jw * 2) + ' 0" stroke="' + j2 + '" stroke-width="2" fill="none"/>';
                if (c.acc === 2 || c.acc === 3)
                    s += '<g fill="none" stroke="#20242a" stroke-width="2.2">' + '<circle cx="42" cy="51" r="7"/><circle cx="58" cy="51" r="7"/>' + '<path d="M49 51h2M35 49l-4-2M65 49l4-2"/></g>';

                return s + '</svg>';
            }

            /* ── ACCOUNTS, WEB BUILD ONLY ─────────────────────────────────────────
   This file ships ONLY in the hosted site, never in the Claude artifact.

   The artifact's CSP blocks every outbound fetch/XHR and every script host but
   a short allowlist, so a published artifact cannot reach Supabase at all --
   not "it would be slow", it cannot connect. Rather than degrade badly there,
   the artifact simply never loads this file and stays what it is: the whole
   builder, free, no sign-in. asmweb.py injects it; asm.py does not.

   Everything here is additive. It creates its own DOM, so ui_shell.html is
   untouched and the two builds cannot drift apart in markup.

   THE KEY BELOW IS MEANT TO BE PUBLIC. Supabase publishable keys are designed
   to ship in the browser; row-level security in schema.sql/schema_builds.sql is
   what actually guards the data, and every policy there is written on the
   assumption that the caller is hostile. The service_role key, which bypasses
   RLS, is never in this file and never in this repo.                        */
            var WEB_CFG = window.GBL_WEB_CONFIG;
            if (!WEB_CFG) {
                throw new Error('Missing web config payload: js/goated-build-lab.web-config.js');
            }
            var SB_URL = WEB_CFG.SB_URL;
            var SB_KEY = WEB_CFG.SB_KEY;

            var SB = null
              , ME = null
              , MYPROFILE = null
              , PROVIDERS = [];
            /* Set while a password-reset link is being honoured. It suppresses the
   ordinary SIGNED_IN close, which would otherwise shut the set-password
   modal the instant it opened. */
            var RECOVERY = false;

            /* The page's own esc() lives inside its IIFE and is NOT global, and this file
   is a separate module, so it cannot borrow it. Its own, rather than leaking a
   helper onto window just to share four lines -- an email address or a handle
   goes through here before it reaches innerHTML. */
            function aesc(s) {
                return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
                    return {
                        '&': '&amp;',
                        '<': '&lt;',
                        '>': '&gt;',
                        '"': '&quot;',
                        "'": '&#39;'
                    }[c];
                });
            }

            /* WHICH LOGINS ACTUALLY WORK, asked of the server rather than hardcoded.
   /auth/v1/settings is public and lists every external provider with a true or
   false. Rendering from it means a button never appears for a provider that is
   switched off -- the alternative is a row of buttons that look fine and fail
   on click, which is indistinguishable from a broken site. */
            var PLABEL = WEB_CFG.PLABEL;

            /* PLATFORM BADGES, not console logos. The PlayStation, Xbox, Steam and Switch
   marks are trademarks and shipping them on a site that will take money is a
   problem nobody needs; a coloured wordmark reads just as clearly in a list and
   is ours to use. Colours are each platform's familiar one, which is not
   protectable the way a logo is. */
            var PLATS = WEB_CFG.PLATS;
            /* WHAT YOU RUN, self-declared. Deliberately the opposite kind of badge from
   `credit` (Tester), which is operator-set so it cannot be self-awarded --
   these say what you PLAY, so there is nothing to verify and nothing to cheat.
   The ids are the closed set the play_styles_known constraint enforces; adding
   one here without adding it there writes a row the database refuses. */
            var STYLES = WEB_CFG.STYLES;
            function styleOf(id) {
                for (var i = 0; i < STYLES.length; i++)
                    if (STYLES[i].id === id)
                        return STYLES[i];
                return null;
            }
            /* Rendered from the ID, never from stored text -- a listing must not print a
   string that arrived from the database even though the constraint limits it. */
            function styleBadges(list) {
                if (!list || !list.length)
                    return '';
                var out = '', i, s;
                for (i = 0; i < list.length; i++) {
                    s = styleOf(list[i]);
                    if (s)
                        out += '<span class="sty" style="--sc:' + s.col + '">' + aesc(s.name) + '</span>';
                }
                return out ? '<span class="stys">' + out + '</span>' : '';
            }

            function platOf(id) {
                for (var i = 0; i < PLATS.length; i++)
                    if (PLATS[i].id === id)
                        return PLATS[i];
                return null;
            }
            /* Shared with the community feed so a row and a profile render identically. */
            function platBadge(id, tag) {
                var p = platOf(id);
                if (!p || !tag)
                    return '';
                return '<span class="plat" style="--pc:' + p.col + '">' + '<i>' + aesc(p.name) + '</i>' + aesc(tag) + '</span>';
            }
            /* NO UPLOADED PICTURES, BY CHOICE.
   Accepting user images on a public feed means running image moderation, and
   there is none here -- so the first swastika or worse sits next to a paid
   product until somebody notices by hand. The storage saving made avatars
   cheap; it never made them safe, and cheap is not the question.

   Generated instead: initials on a colour derived from the name, so people are
   still visually distinct and a profile still looks deliberate. Same hash in
   the feed and the chip, so one person is one colour everywhere.
   `url` is ignored and kept only so existing callers need no change. */
            function avHue(s) {
                var h = 0
                  , t = String(s || '?');
                for (var i = 0; i < t.length; i++)
                    h = (h * 31 + t.charCodeAt(i)) % 360;
                return h;
            }
            /* A built avatar if there is one, otherwise a coloured initial. Callers pass
   the config STRING where they used to pass a url -- the parameter kept its
   position so every call site reads the same. */
            /* THE EFFECTIVE TIER, MIRRORING current_tier() IN SQL.
   Two independent sources: `tier` is Stripe's and the webhook owns it;
   `granted_tier` is a manual comp (schema_grants.sql) that the webhook never
   touches. Whichever is higher wins, each with its own expiry.

   This MUST agree with the SQL function. If it does not, the page and the
   server disagree about what somebody paid for: gates open that the API then
   refuses, or the reverse -- a comped user sees everything locked while their
   solves work. Both are indistinguishable from a billing bug from the outside.

   Read-only and advisory. The server never trusts it; requireTier() asks the
   database with the service role on every call. */
            var TIER_ORDER = WEB_CFG.TIER_ORDER;
            function effectiveTier(s) {
                if (!s)
                    return 'free';
                function live(t, exp) {
                    if (!t || t === 'free')
                        return 'free';
                    if (exp && new Date(exp) < new Date())
                        return 'free';
                    /* null = no expiry */
                    return t;
                }
                var paid = live(s.tier, s.expires_at);
                var comp = live(s.granted_tier, s.grant_expires_at);
                return (TIER_ORDER[comp] || 0) > (TIER_ORDER[paid] || 0) ? comp : paid;
            }

            function avatarHtml(cfg, name, px) {
                px = px || 22;
                if (cfg)
                    return '<span class="av avpic" style="width:' + px + 'px;height:' + px + 'px">' + avSvg(cfg, px) + '</span>';
                var hue = avHue(name);
                return '<span class="av" style="width:' + px + 'px;height:' + px + 'px;font-size:' + Math.round(px * 0.42) + 'px;background:hsl(' + hue + ' 55% 42%);color:#fff">' + aesc(initials(name)) + '</span>';
            }

            function loadProviders() {
                return fetch(SB_URL + '/auth/v1/settings', {
                    headers: {
                        apikey: SB_KEY
                    }
                }).then(function(r) {
                    return r.json();
                }).then(function(j) {
                    var ex = (j && j.external) || {};
                    PROVIDERS = Object.keys(ex).filter(function(k) {
                        return ex[k] && k !== 'email' && k !== 'phone' && k !== 'anonymous_users';
                    });
                }).catch(function() {
                    PROVIDERS = [];
                });
            }

            /* ── "stay signed in" ────────────────────────────────────────────────────
   persistSession + autoRefreshToken keep a session alive across visits: the
   access token lasts an hour, the refresh token far longer. WHERE the session
   is written decides how long "across visits" means.

     localStorage     survives closing the browser   -- stay signed in
     sessionStorage   dies with the tab              -- shared computer

   The client is created ONCE, at load, long before the user ticks anything,
   so the choice cannot be an argument to createClient. It is a storage
   ADAPTER that reads the preference on every write instead.

   The preference itself lives in localStorage on purpose. OAuth and magic
   links leave the page and come back, and a preference held in a variable
   would not survive that round trip -- the session would land in the wrong
   store for exactly the sign-in methods that cannot be re-asked.

   Default ON, so every session that exists today keeps working untouched. */
            var STAYKEY = 'gbl-stay';
            function stayOn() {
                try {
                    return localStorage.getItem(STAYKEY) !== '0';
                } catch (e) {
                    return true;
                }
            }
            function setStay(on) {
                try {
                    localStorage.setItem(STAYKEY, on ? '1' : '0');
                    /* Move a session that is already written, so ticking the box mid-visit
       takes effect now rather than at the next sign-in. */
                    var k = 'gbl-auth'
                      , v = localStorage.getItem(k) || sessionStorage.getItem(k);
                    if (v == null)
                        return;
                    if (on) {
                        localStorage.setItem(k, v);
                        sessionStorage.removeItem(k);
                    } else {
                        sessionStorage.setItem(k, v);
                        localStorage.removeItem(k);
                    }
                } catch (e) {}
            }

            /* Reads look in BOTH stores -- local first, so an existing signed-in user is
   found however the box is set. Writes go to one and clear the other, or a
   stale copy in the store we stopped using would outlive the sign-out. */
            var AUTHSTORE = {
                getItem: function(k) {
                    try {
                        var v = localStorage.getItem(k);
                        return v == null ? sessionStorage.getItem(k) : v;
                    } catch (e) {
                        return null;
                    }
                },
                setItem: function(k, v) {
                    try {
                        if (stayOn()) {
                            localStorage.setItem(k, v);
                            sessionStorage.removeItem(k);
                        } else {
                            sessionStorage.setItem(k, v);
                            localStorage.removeItem(k);
                        }
                    } catch (e) {}
                },
                removeItem: function(k) {
                    try {
                        localStorage.removeItem(k);
                        sessionStorage.removeItem(k);
                    } catch (e) {}
                }
            };

            /* An explicit storageKey means a future change of Supabase project cannot
   collide with a stale session under the library's default key. */
            function sbLoad() {
                if (window.__sbLoading)
                    return window.__sbLoading;
                window.__sbLoading = import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm').then(function(m) {
                    SB = m.createClient(SB_URL, SB_KEY, {
                        auth: {
                            persistSession: true,
                            autoRefreshToken: true,
                            detectSessionInUrl: true,
                            storage: AUTHSTORE,
                            storageKey: 'gbl-auth'
                        }
                    });
                    return SB;
                });
                return window.__sbLoading;
            }

            /* ── the bar ─────────────────────────────────────────────────────────── */
            function authEl() {
                var el = document.getElementById('authbar');
                if (el)
                    return el;
                el = document.createElement('div');
                el.id = 'authbar';
                el.className = 'authbar';
                var host = document.getElementById('tabs');
                if (host && host.parentNode)
                    host.parentNode.insertBefore(el, host.nextSibling);
                else
                    document.body.insertBefore(el, document.body.firstChild);
                return el;
            }

            function authStyle() {
                if (document.getElementById('authcss'))
                    return;
                var s = document.createElement('style');
                s.id = 'authcss';
                s.textContent = '.authbar{display:flex;justify-content:flex-end;align-items:center;gap:8px;' + 'padding:6px 15px 0;font-size:12px;flex-wrap:wrap}' + '.authbar button{font:inherit;cursor:pointer;border:1px solid var(--line);' + 'background:var(--raise);color:var(--ink);padding:5px 11px;border-radius:4px}' + '.authbar button:hover{border-color:var(--cyan)}' + '.authbar button.pri{background:var(--cyan);color:#06202a;border-color:var(--cyan);' + 'font-weight:600}' /* EVERY SELECTOR IN HERE IS SCOPED TO ITS OWN CONTAINER, and it has to be.
     The builder already owns `.chip` (a cap breaker ladder step) and `.alt`
     (a finder alternative-frame button). An unscoped rule here collides.

     The leak is PARTIAL, which is what made it hard to see: at equal
     specificity the page's own <style> still wins every property it declares,
     so only the properties it does NOT declare come through. For .chip that
     was display:flex and border-radius:999px -- padding and text-align held.
     display:flex is the damaging one: the chip's bare "+5" text node becomes
     an anonymous flex item laid out at flex-start, so text-align:center stops
     centring it and the number sat 3.1px left inside its 29px box, wearing a
     pill border-radius. Measured, then measured again with the old rule
     re-injected to confirm it was the cause.

     Checked: .tier is NOT a builder class (it appears there only as a JS
     property), so it is safe unscoped -- it is shared by the authbar, the
     account modal and the pricing modal. */
                /* THE ACCOUNT CHIP. An avatar disc, handle and tier as ONE pressable object.
     The previous version was three spans of plain text that did not look like
     anything you could click, which is why the profile went unnoticed. */
                + '.authbar .chip{display:flex;align-items:center;gap:7px;cursor:pointer;' + 'background:var(--raise);border:1px solid var(--line);border-radius:999px;' + 'padding:3px 11px 3px 4px}' + '.authbar .chip:hover{border-color:var(--cyan)}' + '.authbar .chip .av{width:22px;height:22px;border-radius:50%;display:grid;' + 'place-items:center;background:var(--cyan);color:#06202a;font-weight:700;' + 'font-size:11px;font-family:"Chakra Petch",sans-serif}' + '.authbar .chip .nm{color:var(--ink);font-weight:600;max-width:150px;overflow:hidden;' + 'text-overflow:ellipsis;white-space:nowrap}' + '.tier{font-family:"IBM Plex Mono",monospace;font-size:10px;' + 'text-transform:uppercase;letter-spacing:.06em;padding:2px 6px;border-radius:3px;' + 'background:var(--sunk);color:var(--ink-3)}' + '.tier.mid{background:color-mix(in srgb,var(--cyan) 22%,transparent);color:var(--cyan)}' + '.tier.premium{background:color-mix(in srgb,var(--amber) 24%,transparent);color:var(--amber)}' + '.authbar .msg{color:var(--ink-2)}' + '.authbar .msg.err{color:var(--amber)}' /* modal reuses the builds panel shell */
                + '.amodal{width:min(420px,100%)}' + '.amodal .bbody{padding:15px}' + '.afield{display:block;margin:0 0 10px}' + '.afield span{display:block;font-size:11px;color:var(--ink-3);margin:0 0 4px;' + 'text-transform:uppercase;letter-spacing:.05em}' + '.afield input{width:100%;box-sizing:border-box;font:inherit;font-size:13px;' + 'background:var(--sunk);color:var(--ink);border:1px solid var(--line);' + 'padding:8px 10px;border-radius:4px}' + '.afield input:focus{border-color:var(--cyan);outline:none}' + '.arow{display:flex;gap:8px;margin:12px 0 0}' + '.arow button{flex:1;font:inherit;font-size:13px;cursor:pointer;padding:9px;' + 'border-radius:4px;border:1px solid var(--line);background:var(--raise);' + 'color:var(--ink)}' + '.arow button.pri{background:var(--cyan);color:#06202a;border-color:var(--cyan);' + 'font-weight:600}' + '.amodal .alt{margin:14px 0 0;padding:13px 0 0;border-top:1px solid var(--line-2)}' + '.amodal .alt p{margin:0 0 8px;font-size:11px;color:var(--ink-3);' + 'text-transform:uppercase;letter-spacing:.05em}' + '.amodal .alt .provs{display:flex;gap:8px;flex-wrap:wrap}' + '.amodal .alt .provs button{flex:1;min-width:90px;font:inherit;font-size:13px;' + 'cursor:pointer;padding:9px;border-radius:4px;border:1px solid var(--line);' + 'background:var(--raise);color:var(--ink)}' + '.amodal .alt .provs button:hover{border-color:var(--cyan)}' + '.alink{background:none;border:0;color:var(--cyan);cursor:pointer;font:inherit;' + 'font-size:12px;padding:0;text-decoration:underline}' /* the play-style chips: --sc carries the mode's colour so one rule covers
     all five, in the picker and in every listing */
                + '.stypick{display:flex;gap:6px;flex-wrap:wrap}' + '.stypick button{font:inherit;font-size:12px;cursor:pointer;padding:6px 12px;' + 'border-radius:999px;border:1px solid var(--line);background:var(--sunk);' + 'color:var(--ink-2)}' + '.stypick button:hover{border-color:var(--sc)}' + '.stypick button.on{background:color-mix(in srgb,var(--sc) 22%,transparent);' + 'border-color:var(--sc);color:var(--ink);font-weight:600}' + '.stys{display:inline-flex;gap:4px;flex-wrap:wrap;vertical-align:middle}' + '.sty{font-family:"IBM Plex Mono",monospace;font-size:9.5px;' + 'text-transform:uppercase;letter-spacing:.06em;padding:2px 6px;border-radius:3px;' + 'background:color-mix(in srgb,var(--sc) 24%,transparent);color:var(--sc);' + 'border:1px solid color-mix(in srgb,var(--sc) 45%,transparent)}' + '.acheck{display:flex;gap:9px;align-items:flex-start;margin:0 0 2px;' + 'cursor:pointer;font-size:12px;color:var(--ink-2)}' + '.acheck input{margin:2px 0 0;flex:none;accent-color:var(--cyan);' + 'width:14px;height:14px;cursor:pointer}' + '.acheck em{display:block;font-style:normal;font-size:11px;' + 'color:var(--ink-3);margin:2px 0 0;line-height:1.4}' + '.anote{margin:0 0 12px;font-size:12px;color:var(--ink-2);line-height:1.5}' + '.amsg{margin:10px 0 0;font-size:12px;color:var(--ink-2);min-height:1em}' + '.amsg.err{color:var(--amber)}' + '.akv{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:13px;' + 'margin:0 0 14px}' + '.akv dt{color:var(--ink-3);font-size:11px;text-transform:uppercase;' + 'letter-spacing:.05em;align-self:center}' + '.akv dd{margin:0;color:var(--ink);overflow:hidden;text-overflow:ellipsis}' /* ONE .av box for both shapes -- an <img> when a picture is set, a <span> of
     initials when it is not -- so a missing avatar occupies exactly the same
     space and nothing reflows when one finally loads */
                + 'img.av{border-radius:50%;object-fit:cover;display:block;' + 'background:var(--sunk);flex:0 0 auto}' + 'span.av{border-radius:50%;display:grid;place-items:center;' + 'background:var(--cyan);color:#06202a;font-weight:700;' + 'font-family:"Chakra Petch",sans-serif;flex:0 0 auto}' + '.plat{display:inline-flex;align-items:center;gap:5px;font-size:11px;' + 'font-family:"IBM Plex Mono",monospace;color:var(--ink-2);' + 'background:color-mix(in srgb,var(--pc) 16%,transparent);' + 'border:1px solid color-mix(in srgb,var(--pc) 45%,transparent);' + 'padding:1px 7px;border-radius:999px}' + '.plat i{font-style:normal;font-weight:700;color:var(--pc);font-size:10px;' + 'text-transform:uppercase;letter-spacing:.04em}' + '.afield textarea{width:100%;box-sizing:border-box;font:inherit;font-size:13px;' + 'background:var(--sunk);color:var(--ink);border:1px solid var(--line);' + 'padding:8px 10px;border-radius:4px;resize:vertical;min-height:62px}' + '.afield textarea:focus{border-color:var(--cyan);outline:none}' + '.afield select{width:100%;box-sizing:border-box;font:inherit;font-size:13px;' + 'background:var(--sunk);color:var(--ink);border:1px solid var(--line);' + 'padding:8px 10px;border-radius:4px}' + '.apic{display:flex;align-items:center;gap:12px;margin:0 0 14px}' + '.apic .pb{display:flex;flex-direction:column;gap:6px}' + '.avnote{margin:0;font-size:11px;color:var(--ink-3);max-width:230px;line-height:1.45}' + '.apic button{font:inherit;font-size:12px;cursor:pointer;padding:5px 10px;' + 'border-radius:4px;border:1px solid var(--line);background:var(--raise);' + 'color:var(--ink)}' + '.apic button:hover{border-color:var(--cyan)}' + '.acount{font-size:11px;color:var(--ink-3);text-align:right;margin:-6px 0 10px}' + '.twofield{display:grid;grid-template-columns:1fr 1fr;gap:10px}' + 'span.avpic{background:none;overflow:hidden}' + '.avsvg{display:block;border-radius:50%}' + '.avwrap{display:flex;flex-direction:column;align-items:center;gap:10px;margin:0 0 14px}' + '.avbtns{display:flex;gap:8px}' + '.avbtns button{font:inherit;font-size:12px;cursor:pointer;padding:5px 12px;border-radius:4px;border:1px solid var(--line);background:var(--raise);color:var(--ink)}' + '.avbtns button:hover{border-color:var(--cyan)}' + '.avrow{display:grid;grid-template-columns:1fr auto auto auto;align-items:center;gap:8px;padding:5px 0;border-top:1px solid var(--line-2)}' + '.avlab{font-size:12px;color:var(--ink-2)}' + '.avnum{font-family:"IBM Plex Mono",monospace;font-size:11px;color:var(--ink-3);min-width:34px;text-align:center}' + '.avstep{font:inherit;font-size:15px;line-height:1;cursor:pointer;width:28px;height:26px;border-radius:4px;border:1px solid var(--line);background:var(--raise);color:var(--ink)}' + '.avstep:hover{border-color:var(--cyan)}' + '.avrow.wide{grid-template-columns:1fr}' + '.avrow.wide .avlab{margin-bottom:4px}' + '.avsel{width:100%;box-sizing:border-box;font:inherit;font-size:12px;background:var(--sunk);color:var(--ink);border:1px solid var(--line);padding:6px 8px;border-radius:4px}' + '.avsel:focus{border-color:var(--cyan);outline:none}';
                document.head.appendChild(s);
            }

            function authMsg(t, err) {
                var m = document.getElementById('authmsg');
                if (!m)
                    return;
                m.className = 'msg' + (err ? ' err' : '');
                m.textContent = t || '';
            }

            function initials(s) {
                s = String(s || '?').replace(/[^A-Za-z0-9]/g, '');
                return (s.slice(0, 2) || '?').toUpperCase();
            }

            function paintAuth() {
                authStyle();
                var el = authEl();
                if (!SB) {
                    el.innerHTML = '';
                    return;
                }

                if (!ME) {
                    el.innerHTML = '<span class="msg" id="authmsg"></span>' + '<button type="button" id="community">Community</button>' + '<button type="button" id="authopen" class="pri">Sign in</button>';
                    return;
                }

                var tier = (MYPROFILE && MYPROFILE.tier) || 'free';
                var who = (MYPROFILE && MYPROFILE.handle) || (ME.email || '').split('@')[0] || 'account';
                el.innerHTML = '<span class="msg" id="authmsg"></span>' + '<button type="button" id="savebuild" class="pri">Save &amp; post</button>' + '<button type="button" id="mybuilds">My builds</button>' + '<button type="button" id="community">Community</button>' + '<span class="chip" id="authchip" role="button" tabindex="0" title="Your account">' + avatarHtml(MYPROFILE && MYPROFILE.avatar_cfg, who, 22) + '<span class="nm">' + aesc(who) + '</span></span>';
            }

            /* ── modal plumbing ──────────────────────────────────────────────────── */
            var AMODAL = null;
            function amodal(title, inner) {
                authStyle();
                buildsStyle();
                /* buildsStyle lives in web_builds.js */
                if (!AMODAL) {
                    AMODAL = document.createElement('div');
                    AMODAL.className = 'bov';
                    document.body.appendChild(AMODAL);
                    AMODAL.addEventListener('click', function(e) {
                        if (e.target === AMODAL || e.target.id === 'aclose')
                            closeAmodal();
                    });
                }
                AMODAL.innerHTML = '<div class="bpanel amodal" role="dialog" aria-modal="true">' + '<div class="bhead"><h2>' + aesc(title) + '</h2>' + '<button type="button" id="aclose" aria-label="Close">&times;</button></div>' + '<div class="bbody">' + inner + '</div></div>';
                AMODAL.style.display = 'flex';
            }
            function closeAmodal() {
                if (AMODAL)
                    AMODAL.style.display = 'none';
            }
            function amsg(t, err) {
                var m = document.getElementById('amsg');
                if (m) {
                    m.className = 'amsg' + (err ? ' err' : '');
                    m.textContent = t || '';
                }
            }

            function provButtons() {
                if (!PROVIDERS.length)
                    return '';
                return '<div class="alt"><p>Or continue with</p><div class="provs">' + PROVIDERS.map(function(p) {
                    return '<button type="button" data-prov="' + aesc(p) + '">' + aesc(PLABEL[p] || p) + '</button>';
                }).join('') + '</div></div>';
            }

            function stayBox() {
                return '<label class="acheck"><input type="checkbox" id="a_stay"' + (stayOn() ? ' checked' : '') + '>' + '<span>Stay signed in<em>Leave this off on a shared or public computer ' + '&mdash; you will be signed out when the browser closes.</em></span></label>';
            }

            /* mode: 'in' | 'up' | 'link' | 'reset' */
            function openAuthModal(mode) {
                mode = mode || 'in';
                var title = mode === 'up' ? 'Create an account' : mode === 'link' ? 'Email me a sign-in link' : mode === 'reset' ? 'Reset your password' : 'Sign in';
                var inner;
                if (mode === 'link' || mode === 'reset') {
                    var isReset = mode === 'reset';
                    inner = (isReset ? '<p class="anote">Enter the email on your account and we will send ' + 'you a link to choose a new password.</p>' : '') + '<label class="afield"><span>Email</span>' + '<input id="a_mail" type="email" autocomplete="email" placeholder="you@example.com"></label>' + '<div class="arow"><button type="button" id="' + (isReset ? 'a_reset' : 'a_send') + '" class="pri">' + (isReset ? 'Send reset link' : 'Send link') + '</button></div>' + '<p class="amsg" id="amsg"></p>' + '<div class="alt"><button type="button" class="alink" data-mode="in">' + (isReset ? 'Back to sign in' : 'Use a password instead') + '</button></div>' + (isReset ? '' : provButtons());
                } else {
                    inner = '<label class="afield"><span>Email</span>' + '<input id="a_mail" type="email" autocomplete="email" placeholder="you@example.com"></label>' + '<label class="afield"><span>Password</span>' + '<input id="a_pass" type="password" placeholder="at least 6 characters" ' + 'autocomplete="' + (mode === 'up' ? 'new-password' : 'current-password') + '"></label>' + stayBox() + '<div class="arow">' + (mode === 'up' ? '<button type="button" id="a_up" class="pri">Create account</button>' : '<button type="button" id="a_in" class="pri">Sign in</button>') + '</div>' + '<p class="amsg" id="amsg"></p>' + '<div class="alt">' + (mode === 'up' ? '<button type="button" class="alink" data-mode="in">Already have an account? Sign in</button>' : '<button type="button" class="alink" data-mode="up">Create an account</button>' + ' &middot; <button type="button" class="alink" data-mode="link">Email me a link</button>' + ' &middot; <button type="button" class="alink" data-mode="reset">Forgot password?</button>') + '</div>' + provButtons();
                }
                amodal(title, inner);
                var f = document.getElementById('a_mail');
                if (f)
                    f.focus();
            }

            /* Reached from the emailed link, never from a button. The link signs the user
   in already -- that is how Supabase recovery works -- so this modal is not
   optional decoration: leaving it out would drop somebody into the site with
   the old password still live and no way to change it. */
            function openNewPassword() {
                amodal('Choose a new password', '<p class="anote">You are signed in from the reset link. Set a new ' + 'password now so you can use it next time.</p>' + '<label class="afield"><span>New password</span>' + '<input id="a_np" type="password" autocomplete="new-password" ' + 'placeholder="at least 6 characters"></label>' + '<label class="afield"><span>Repeat it</span>' + '<input id="a_np2" type="password" autocomplete="new-password"></label>' + '<div class="arow"><button type="button" id="a_setpw" class="pri">' + 'Save password</button></div>' + '<p class="amsg" id="amsg"></p>');
                var f = document.getElementById('a_np');
                if (f)
                    f.focus();
            }

            /* ── account panel ───────────────────────────────────────────────────── */
            function openAccount() {
                var P = MYPROFILE || {};
                var tier = P.tier || 'free';
                /* THESE MUST MATCH build_limit_for() IN schema_builds.sql, which is what
     actually refuses the save. They did not: the page promised free 5 / mid
     100 / premium 1000 while the database enforces 3 / 5 / unlimited, so a
     free user was told they had five and got "build limit reached" on their
     fourth. The database is the authority -- it is enforced server-side
     precisely because the page is public -- so the page is what was wrong. */
                var lim = tier === 'free' ? '3' : tier === 'mid' ? '5' : 'unlimited';
                var who = P.handle || (ME.email || '').split('@')[0] || 'account';
                amodal('Your profile', '<div class="apic">' + '<span id="a_avprev">' + avatarHtml(P.avatar_cfg, who, 64) + '</span>' + '<div class="pb">' + '<button type="button" id="a_makeav">' + (P.avatar_cfg ? 'Edit character' : 'Make a character') + '</button>' + (P.avatar_cfg ? '<button type="button" id="a_rmav">Remove</button>' : '') + '</div></div>' + '<label class="afield"><span>Handle &mdash; shown as the author on builds you share</span>' + '<input id="a_handle" type="text" maxlength="20" placeholder="3-20 letters, numbers, _" ' + 'value="' + aesc(P.handle || '') + '"></label>' + '<label class="afield"><span>Bio</span>' + '<textarea id="a_bio" maxlength="300" placeholder="Who you are, what you run.">' + aesc(P.bio || '') + '</textarea></label>' + '<p class="acount" id="a_biocount"></p>' + '<div class="twofield">' + '<label class="afield"><span>Platform</span><select id="a_plat">' + '<option value="">not set</option>' + PLATS.map(function(pl) {
                    return '<option value="' + pl.id + '"' + (P.platform === pl.id ? ' selected' : '') + '>' + aesc(pl.name) + '</option>';
                }).join('') + '</select></label>' + '<label class="afield"><span>Gamertag</span>' + '<input id="a_tag" type="text" maxlength="32" placeholder="how people find you" ' + 'value="' + aesc(P.gamertag || '') + '"></label>' + '</div>' /* Toggle chips, not a multi-select: five options that people pick two or
       three of, and a <select multiple> on a phone is a scroll trap. Pressed
       state lives in aria-pressed so it is not only a colour. */
                + '<div class="afield"><span>What you run &mdash; shown on your profile</span>' + '<div class="stypick" id="a_styles">' + STYLES.map(function(st) {
                    var on = (P.play_styles || []).indexOf(st.id) >= 0;
                    return '<button type="button" data-sty="' + st.id + '" style="--sc:' + st.col + '" class="' + (on ? 'on' : '') + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + aesc(st.name) + '</button>';
                }).join('') + '</div></div>' + '<dl class="akv">' + '<dt>Email</dt><dd>' + aesc(ME.email || '--') + '</dd>' + '<dt>Builder access</dt><dd>All client-side builder features unlocked</dd>' + '<dt>Saved builds</dt><dd>' + (lim === 'unlimited' ? 'unlimited on this account' : 'server limit: up to ' + lim) + '</dd></dl>' + '<div class="arow"><button type="button" id="a_saveprof" class="pri">Save profile</button>' + '<button type="button" id="a_out">Sign out</button></div>' /* Cancelling has to be findable. Before this it lived only inside the
       Plans modal, so the route to cancel was a button labelled "Plans" --
       which reads as the route to buy. billingRow() is web_legal.js and
       returns '' for a free account, where there is nothing to manage. */
                + (typeof billingRow === 'function' ? billingRow() : '') + '<p class="amsg" id="amsg"></p>');
                bioCount();
            }

            function bioCount() {
                var t = document.getElementById('a_bio')
                  , c = document.getElementById('a_biocount');
                if (t && c)
                    c.textContent = (t.value || '').length + ' / 300';
            }

            /* ONE save for the whole profile, not a button per field. Four separate saves
   is four chances to leave a profile half-finished. */
            function saveProfile() {
                var h = ((document.getElementById('a_handle') || {}).value || '').trim();
                var bio = ((document.getElementById('a_bio') || {}).value || '').trim();
                var plat = (document.getElementById('a_plat') || {}).value || '';
                var tag = ((document.getElementById('a_tag') || {}).value || '').trim();
                var sty = [].map.call(document.querySelectorAll('#a_styles button.on'), function(b) {
                    return b.dataset.sty;
                });
                if (h && !/^[A-Za-z0-9_]{3,20}$/.test(h))
                    return amsg('Handle must be 3-20 letters, numbers or underscore.', true);
                /* a gamertag with no platform has no badge to render, so it would simply
     vanish from every listing -- say so rather than saving something invisible */
                if (tag && !plat)
                    return amsg('Pick a platform for that gamertag.', true);
                amsg('Saving...');
                /* null, not [] -- an empty array is a value the listings would have to test
     for separately, and `is not null` is the check every other optional column
     on this table already uses. */
                var patch = {
                    bio: bio || null,
                    platform: plat || null,
                    gamertag: tag || null,
                    play_styles: sty.length ? sty : null,
                    updated_at: new Date().toISOString()
                };
                if (h)
                    patch.handle = h;
                /* PostgREST rejects the WHOLE statement for one unknown column (42703), so
     a page shipped ahead of schema_playstyles.sql would break every profile
     save, not just the badges. Retry once without the new field -- the same
     shape as subRow()'s fallback, and the reason that one exists. */
                var send = function(p) {
                    return SB.from('profiles').update(p).eq('user_id', ME.id).then(function(r) {
                        if (r.error && (r.error.code === '42703' || /play_styles/.test(r.error.message || '')) && p.play_styles !== undefined) {
                            var noSty = {}, k;
                            for (k in p)
                                if (k !== 'play_styles')
                                    noSty[k] = p[k];
                            return SB.from('profiles').update(noSty).eq('user_id', ME.id).then(function(r2) {
                                r2.styleSkipped = true;
                                return r2;
                            });
                        }
                        return r;
                    });
                };
                send(patch).then(function(r) {
                    if (r.error) {
                        amsg(/duplicate|unique/i.test(r.error.message) ? 'That handle is taken.' : r.error.message, true);
                        return;
                    }
                    if (r.styleSkipped)
                        patch.play_styles = MYPROFILE && MYPROFILE.play_styles;
                    MYPROFILE = MYPROFILE || {};
                    if (h)
                        MYPROFILE.handle = h;
                    MYPROFILE.bio = patch.bio;
                    MYPROFILE.platform = patch.platform;
                    MYPROFILE.gamertag = patch.gamertag;
                    MYPROFILE.play_styles = patch.play_styles;
                    paintAuth();
                    amsg('Saved.');
                });
            }

            /* ── character maker ─────────────────────────────────────────────────── */
            var AVDRAFT = null;

            function openAvatarMaker() {
                var P = MYPROFILE || {};
                var who = P.handle || (ME.email || '').split('@')[0] || 'account';
                AVDRAFT = P.avatar_cfg ? avCfgParse(P.avatar_cfg) : avCfgFromName(who);
                amodal('Make your character', '<div class="avwrap"><span id="a_avbig"></span>' + '<div class="avbtns">' + '<button type="button" id="a_avrand">Randomise</button></div></div>' + '<div id="a_avrows"></div>' + '<div class="arow"><button type="button" id="a_avsave" class="pri">Use this</button>' + '<button type="button" id="a_avback">Cancel</button></div>' + '<p class="amsg" id="amsg"></p>');
                paintAvatarMaker();
            }

            function paintAvatarMaker() {
                var big = document.getElementById('a_avbig');
                if (big)
                    big.innerHTML = avSvg(AVDRAFT, 116);
                var rows = document.getElementById('a_avrows');
                if (!rows)
                    return;
                /* Arrows for the small layers -- a grid of every option would be a wall of
     buttons, and the preview explains each step better than a label could.
     A NAMED layer gets a dropdown instead: forty-five kits is thirty clicks to
     reach Utah, and nobody hunts for their team by pressing next. */
                rows.innerHTML = AV_LAYERS.map(function(l) {
                    if (l.list) {
                        return '<div class="avrow wide"><span class="avlab">' + aesc(l.label) + '</span>' + '<select class="avsel" data-k="' + l.key + '">' + l.list.map(function(o, i) {
                            return '<option value="' + i + '"' + ((AVDRAFT[l.key] || 0) === i ? ' selected' : '') + '>' + aesc(o[0]) + '</option>';
                        }).join('') + '</select></div>';
                    }
                    return '<div class="avrow"><span class="avlab">' + aesc(l.label) + '</span>' + '<button type="button" class="avstep" data-k="' + l.key + '" data-d="-1"' + ' aria-label="previous">&#8249;</button>' + '<span class="avnum">' + ((AVDRAFT[l.key] || 0) + 1) + '/' + l.n + '</span>' + '<button type="button" class="avstep" data-k="' + l.key + '" data-d="1"' + ' aria-label="next">&#8250;</button></div>';
                }).join('');
            }

            function avStep(key, d) {
                var l = null;
                for (var i = 0; i < AV_LAYERS.length; i++)
                    if (AV_LAYERS[i].key === key)
                        l = AV_LAYERS[i];
                if (!l)
                    return;
                AVDRAFT[key] = ((AVDRAFT[key] || 0) + d + l.n) % l.n;
                paintAvatarMaker();
            }

            function avRandom() {
                AVDRAFT = {};
                for (var i = 0; i < AV_LAYERS.length; i++)
                    AVDRAFT[AV_LAYERS[i].key] = Math.floor(Math.random() * AV_LAYERS[i].n);
                paintAvatarMaker();
            }

            function avSave() {
                var cfg = avCfgString(AVDRAFT);
                amsg('Saving...');
                SB.from('profiles').update({
                    avatar_cfg: cfg,
                    updated_at: new Date().toISOString()
                }).eq('user_id', ME.id).then(function(r) {
                    if (r.error)
                        return amsg(r.error.message, true);
                    MYPROFILE = MYPROFILE || {};
                    MYPROFILE.avatar_cfg = cfg;
                    paintAuth();
                    openAccount();
                });
            }

            function avRemove() {
                SB.from('profiles').update({
                    avatar_cfg: null,
                    updated_at: new Date().toISOString()
                }).eq('user_id', ME.id).then(function(r) {
                    if (r.error)
                        return amsg(r.error.message, true);
                    MYPROFILE = MYPROFILE || {};
                    MYPROFILE.avatar_cfg = null;
                    paintAuth();
                    openAccount();
                });
            }

            /* ── actions ─────────────────────────────────────────────────────────── */
            function creds() {
                return {
                    mail: ((document.getElementById('a_mail') || {}).value || '').trim(),
                    pass: ((document.getElementById('a_pass') || {}).value || '')
                };
            }
            function badMail(m) {
                return !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m);
            }

            function signInPassword() {
                var c = creds();
                if (badMail(c.mail))
                    return amsg('That does not look like an email address.', true);
                if (!c.pass)
                    return amsg('Enter your password.', true);
                amsg('Signing in...');
                SB.auth.signInWithPassword({
                    email: c.mail,
                    password: c.pass
                }).then(function(r) {
                    if (r.error) {
                        /* Supabase returns "Invalid login credentials" for BOTH a wrong password
         and an account created through Discord that has no password at all.
         Those are different problems and the generic text sends people round
         in circles retyping a password they never set. */
                        amsg(/invalid login/i.test(r.error.message) ? 'Wrong email or password. If you first signed in with Discord or ' + 'Twitch, use that button instead.' : r.error.message, true);
                        return;
                    }
                    closeAmodal();
                });
            }

            function signUpPassword() {
                var c = creds();
                if (badMail(c.mail))
                    return amsg('That does not look like an email address.', true);
                if (c.pass.length < 6)
                    return amsg('Password must be at least 6 characters.', true);
                amsg('Creating account...');
                SB.auth.signUp({
                    email: c.mail,
                    password: c.pass,
                    options: {
                        emailRedirectTo: location.origin + location.pathname
                    }
                }).then(function(r) {
                    if (r.error) {
                        amsg(/already registered/i.test(r.error.message) ? 'That email already has an account. Sign in instead.' : r.error.message, true);
                        return;
                    }
                    /* With email confirmation ON, signUp returns a user but NO session: the
       account exists and is unusable until the link is clicked. Reporting
       "account created" and leaving them signed out reads as a bug. */
                    if (r.data && r.data.session)
                        closeAmodal();
                    else
                        amsg('Account created. Check your email to confirm it, then sign in.');
                });
            }

            function sendLink() {
                var c = creds();
                if (badMail(c.mail))
                    return amsg('That does not look like an email address.', true);
                amsg('Sending...');
                SB.auth.signInWithOtp({
                    email: c.mail,
                    options: {
                        emailRedirectTo: location.origin + location.pathname
                    }
                }).then(function(r) {
                    if (r.error)
                        amsg(r.error.message, true);
                    else
                        amsg('Check your email for the link.');
                });
            }

            /* THE ANSWER IS THE SAME WHETHER OR NOT THE ACCOUNT EXISTS.
   Reporting "no account with that email" turns the reset form into a free
   check of who has signed up here, against a page anybody can open. Supabase
   deliberately returns success either way; the copy has to match, or the
   timing and the wording give back exactly what the API withheld. */
            function sendReset() {
                var c = creds();
                if (badMail(c.mail))
                    return amsg('That does not look like an email address.', true);
                amsg('Sending...');
                SB.auth.resetPasswordForEmail(c.mail, {
                    redirectTo: location.origin + location.pathname
                }).then(function(r) {
                    if (r.error)
                        return amsg(mailErr(r.error.message), true);
                    amsg('If that email has an account, a reset link is on its way. ' + 'It is good for one hour.');
                });
            }

            /* The built-in Supabase mailer is rate limited hard, and its raw text
   ("For security purposes, you can only request this after 51 seconds") reads
   as a rejection of the user rather than of the request. */
            function mailErr(m) {
                m = m || '';
                if (/rate limit|only request this after|too many/i.test(m))
                    return 'Too many emails have gone out just now. Wait a minute and try again.';
                return m;
            }

            function setNewPassword() {
                var a = ((document.getElementById('a_np') || {}).value || '');
                var b = ((document.getElementById('a_np2') || {}).value || '');
                if (a.length < 6)
                    return amsg('Password must be at least 6 characters.', true);
                if (a !== b)
                    return amsg('The two passwords do not match.', true);
                amsg('Saving...');
                SB.auth.updateUser({
                    password: a
                }).then(function(r) {
                    if (r.error) {
                        /* The recovery session is short-lived. An expired one fails here rather
         than on the link, so the message has to say what to do next. */
                        return amsg(/session|jwt|expired|not authenticated/i.test(r.error.message) ? 'That reset link has expired. Request a new one and try again.' : r.error.message, true);
                    }
                    RECOVERY = false;
                    closeAmodal();
                    authMsg('Password updated.');
                });
            }

            function oauth(provider) {
                amsg('Opening ' + (PLABEL[provider] || provider) + '...');
                SB.auth.signInWithOAuth({
                    provider: provider,
                    options: {
                        redirectTo: location.origin + location.pathname
                    }
                }).then(function(r) {
                    if (r.error)
                        amsg(/provider/i.test(r.error.message) ? provider + ' sign-in is not enabled on this project yet.' : r.error.message, true);
                });
            }

            function signOut() {
                SB.auth.signOut().then(function() {
                    ME = null;
                    MYPROFILE = null;
                    closeAmodal();
                    paintAuth();
                    authMsg('Signed out.');
                });
            }

            /* ── binding ─────────────────────────────────────────────────────────── */
            function bindAuth() {
                var el = authEl();
                if (!el.dataset.bound) {
                    el.dataset.bound = '1';
                    el.addEventListener('click', function(e) {
                        var id = e.target.id;
                        if (id === 'authopen')
                            openAuthModal('in');
                        else if (id === 'community')
                            openBuilds('public');
                        else if (id === 'mybuilds')
                            openBuilds('mine');
                        else if (id === 'savebuild')
                            saveCurrentBuild();
                        else if (e.target.closest && e.target.closest('#authchip'))
                            openAccount();
                    });
                    el.addEventListener('keydown', function(e) {
                        if ((e.key === 'Enter' || e.key === ' ') && e.target.id === 'authchip') {
                            e.preventDefault();
                            openAccount();
                        }
                    });
                }
                /* One document-level listener for the modal: its contents are replaced
     wholesale on every open, so binding to the inner nodes would go stale. */
                if (!document.body.dataset.abound) {
                    document.body.dataset.abound = '1';
                    document.addEventListener('click', function(e) {
                        var t = e.target;
                        if (!AMODAL || AMODAL.style.display === 'none' || !AMODAL.contains(t))
                            return;
                        if (t.dataset && t.dataset.prov)
                            return oauth(t.dataset.prov);
                        if (t.dataset && t.dataset.mode)
                            return openAuthModal(t.dataset.mode);
                        if (t.id === 'a_in')
                            signInPassword();
                        else if (t.id === 'a_up')
                            signUpPassword();
                        else if (t.id === 'a_send')
                            sendLink();
                        else if (t.id === 'a_reset')
                            sendReset();
                        else if (t.id === 'a_setpw')
                            setNewPassword();
                        else if (t.id === 'a_out')
                            signOut();
                            /* the chip itself carries the state; saveProfile reads .on off the DOM */
                        else if (t.dataset && t.dataset.sty) {
                            var onNow = t.className !== 'on';
                            t.className = onNow ? 'on' : '';
                            t.setAttribute('aria-pressed', onNow ? 'true' : 'false');
                        } else if (t.id === 'a_saveprof')
                            saveProfile();
                        else if (t.id === 'a_makeav')
                            openAvatarMaker();
                        else if (t.id === 'a_rmav')
                            avRemove();
                        else if (t.id === 'a_avrand')
                            avRandom();
                        else if (t.id === 'a_avsave')
                            avSave();
                        else if (t.id === 'a_avback')
                            openAccount();
                        else if (t.classList && t.classList.contains('avstep'))
                            avStep(t.dataset.k, +t.dataset.d);
                    });
                    /* the file input and the bio counter are re-created on every open, so both
       listen at the document rather than on the elements themselves */
                    document.addEventListener('input', function(e) {
                        if (e.target.id === 'a_bio')
                            bioCount();
                    });
                    document.addEventListener('change', function(e) {
                        /* The preference must be stored BEFORE the sign-in call, because the
         library writes the session the instant that call resolves and the
         adapter reads the preference at that moment. Binding to `change` on
         the box rather than reading it inside signInPassword also means OAuth
         and magic link -- which never come back through that function -- pick
         up the same choice. */
                        if (e.target.id === 'a_stay')
                            return setStay(!!e.target.checked);
                        if (e.target.classList && e.target.classList.contains('avsel')) {
                            AVDRAFT[e.target.dataset.k] = +e.target.value;
                            paintAvatarMaker();
                        }
                    });
                    document.addEventListener('keydown', function(e) {
                        if (e.key === 'Escape') {
                            closeAmodal();
                            if (typeof closeBuilds === 'function')
                                closeBuilds();
                            return;
                        }
                        if (e.key !== 'Enter' || !AMODAL || AMODAL.style.display === 'none')
                            return;
                        var id = e.target.id;
                        if (id === 'a_np' || id === 'a_np2') {
                            var pw = document.getElementById('a_setpw');
                            if (pw)
                                pw.click();
                        } else if (id === 'a_mail' || id === 'a_pass') {
                            var go = document.getElementById('a_in') || document.getElementById('a_up') || document.getElementById('a_send') || document.getElementById('a_reset');
                            if (go)
                                go.click();
                        } else if (id === 'a_handle' || id === 'a_tag')
                            saveProfile();
                    });
                }
            }

            /* THE GRANT COLUMNS MAY NOT EXIST YET.
   Deploys are not atomic: the page can reach Vercel before schema_grants.sql
   has been run. PostgREST rejects the WHOLE select if one column is unknown,
   so asking for granted_tier against an un-migrated database returns an error,
   `s` comes back null, and EVERY PAYING USER SILENTLY READS AS FREE. That is a
   far worse failure than not having comps yet.

   So: ask for the new shape, and fall back to the old one if the column is not
   there. Costs one extra round trip exactly once, on a database that has not
   been migrated, and never again afterwards. */
            var SUBCOLS = 'tier,expires_at,granted_tier,grant_expires_at';
            function subRow() {
                return SB.from('subscriptions').select(SUBCOLS).eq('user_id', ME.id).maybeSingle().then(function(r) {
                    if (!r || !r.error)
                        return r;
                    /* 42703 = undefined_column. Anything else (network, RLS) is a real
         failure and must not be retried into a wrong answer. */
                    var m = (r.error.message || '') + ' ' + (r.error.code || '');
                    if (!/42703|column|does not exist/i.test(m))
                        return r;
                    SUBCOLS = 'tier,expires_at';
                    /* remember, so this happens once */
                    return SB.from('subscriptions').select(SUBCOLS).eq('user_id', ME.id).maybeSingle();
                });
            }

            function loadProfile() {
                if (!ME) {
                    MYPROFILE = null;
                    return Promise.resolve();
                }
                return Promise.all([SB.from('profiles').select('handle,bio,platform,gamertag,avatar_cfg').eq('user_id', ME.id).maybeSingle(), subRow()]).then(function(r) {
                    var p = r[0] && r[0].data
                      , s = r[1] && r[1].data;
                    var tier = effectiveTier(s);
                    MYPROFILE = {
                        handle: p && p.handle,
                        tier: tier,
                        bio: p && p.bio,
                        avatar_cfg: p && p.avatar_cfg,
                        platform: p && p.platform,
                        gamertag: p && p.gamertag
                    };
                }).catch(function() {
                    MYPROFILE = {
                        tier: 'free'
                    };
                });
            }

            /* A RECOVERY LINK ARRIVES TWO DIFFERENT WAYS and only one of them is
   visible in the URL, so both are watched.

     implicit flow   #access_token=...&type=recovery   -- readable here
     PKCE flow       ?code=...                         -- opaque; only the
                                                          PASSWORD_RECOVERY
                                                          event identifies it

   The hash is read BEFORE the client loads, because detectSessionInUrl strips
   it as soon as it has consumed it. Relying on the event alone would break on
   implicit if the event ever arrived before this file finished booting;
   relying on the hash alone would break entirely under PKCE. */
            var URLRECOVERY = (function() {
                try {
                    return /(^|[#&])type=recovery(&|$)/.test(location.hash || '');
                } catch (e) {
                    return false;
                }
            }
            )();

            (function() {
                authStyle();
                if (URLRECOVERY)
                    RECOVERY = true;
                sbLoad().then(function() {
                    bindAuth();
                    return loadProviders();
                }).then(function() {
                    return SB.auth.getSession();
                }).then(function(r) {
                    ME = (r && r.data && r.data.session && r.data.session.user) || null;
                    return loadProfile();
                }).then(function() {
                    paintAuth();
                    if (typeof onAuthChanged === 'function')
                        onAuthChanged();
                    if (typeof onTierReady === 'function')
                        onTierReady();
                    if (RECOVERY && ME)
                        openNewPassword();
                    SB.auth.onAuthStateChange(function(evt, session) {
                        ME = (session && session.user) || null;
                        if (evt === 'PASSWORD_RECOVERY') {
                            RECOVERY = true;
                            openNewPassword();
                        }
                        loadProfile().then(function() {
                            paintAuth();
                            /* SIGNED_IN fires for a recovery link too, and its close lands after a
           network round trip -- i.e. AFTER the modal above has opened. Without
           this guard the set-password form flashes up and vanishes. */
                            if (evt === 'SIGNED_IN' && !RECOVERY)
                                closeAmodal();
                            if (typeof onAuthChanged === 'function')
                                onAuthChanged();
                            if (typeof onTierReady === 'function')
                                onTierReady();
                        });
                    });
                }).catch(function(e) {
                    try {
                        console.warn('auth unavailable:', e && e.message);
                    } catch (_e) {}
                    var el = document.getElementById('authbar');
                    if (el)
                        el.innerHTML = '';
                });
            }
            )();

            /* ── SAVE, SHARE, COMMUNITY ───────────────────────────────────────────
   Web build only, joined into the same module as web_auth.js, so SB / ME /
   MYPROFILE / aesc are shared directly rather than through a window API.

   HOW THIS TALKS TO THE BUILDER. The page is one big IIFE: applyCode, alloc,
   buildCode and the rest are NOT global, so this file cannot call them. It uses
   the page's OWN controls as the interface instead -- read the current build
   from #codeOut, load one by filling #codeIn and clicking Load. That seam is
   stable (it is the paste box users already use), needs no change to the shared
   page, and keeps the artifact and web builds identical in markup.

   THE CODE IS THE TRUTH. Position, height, overall and archetype are stored
   alongside it only so the community feed can sort and filter in Postgres. The
   page recomputes every number from the code on load, so a doctored row can
   mislabel itself in a listing and still cannot produce an illegal build.    */
            var BPANEL = null
              , BMODE = 'mine'
              , BROWS = []
              , BBUSY = false;

            function currentCode() {
                var el = document.getElementById('codeOut');
                return el ? (el.textContent || '').trim() : '';
            }

            /* Load a build by driving the page's own paste box. `input` then `click` --
   the Load handler reads the field, so the value has to be set before it. */
            function applyBuildCode(code) {
                var inp = document.getElementById('codeIn');
                if (!inp)
                    return false;
                inp.value = code;
                inp.dispatchEvent(new Event('input',{
                    bubbles: true
                }));
                var btn = null
                  , all = document.querySelectorAll('.paste-row button');
                for (var i = 0; i < all.length; i++)
                    if (/load/i.test(all[i].textContent)) {
                        btn = all[i];
                        break;
                    }
                if (!btn)
                    return false;
                btn.click();
                return true;
            }

            /* Read what the page is showing, for the listing columns only. */
            function currentMeta() {
                var code = currentCode();
                var mp = /(?:^|&)p=(\d+)/.exec(code)
                  , mh = /(?:^|&)h=(\d+)/.exec(code);
                var ovr = (document.getElementById('ovr') || {}).textContent;
                var arch = (document.getElementById('archName') || {}).textContent;
                return {
                    code: code,
                    pos: mp ? +mp[1] : null,
                    height_in: mh ? +mh[1] : null,
                    overall: /^\d+$/.test((ovr || '').trim()) ? +ovr : null,
                    archetype: (arch || '').trim().slice(0, 60) || null
                };
            }

            var POSL = ['PG', 'SG', 'SF', 'PF', 'C'];
            function ftin(h) {
                return h == null ? '' : (Math.floor(h / 12) + "'" + (h % 12) + '"');
            }

            /* ── panel ───────────────────────────────────────────────────────────── */
            function buildsStyle() {
                if (document.getElementById('bldcss'))
                    return;
                var s = document.createElement('style');
                s.id = 'bldcss';
                s.textContent = '.bov{position:fixed;inset:0;z-index:90;background:rgba(6,10,14,.72);' + 'display:flex;align-items:center;justify-content:center;padding:16px}' + '.bpanel{background:var(--panel);border:1px solid var(--line);border-radius:8px;' + 'width:min(760px,100%);max-height:min(82vh,82dvh);display:flex;flex-direction:column;' + 'box-shadow:0 24px 60px -20px rgba(0,0,0,.7)}' + '.bhead{display:flex;align-items:center;gap:10px;padding:12px 15px;' + 'border-bottom:1px solid var(--line-2);flex:0 0 auto}' + '.bhead h2{margin:0;font-size:15px;flex:1}' + '.bhead button{font:inherit;font-size:12px;cursor:pointer;background:var(--raise);' + 'color:var(--ink);border:1px solid var(--line);padding:5px 10px;border-radius:4px}' + '.bhead button.on{background:var(--cyan);color:#06202a;border-color:var(--cyan)}' /* min-height:0 or the flex child refuses to shrink and never scrolls */
                + '.bbody{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch}' + '.brow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 10px;' + 'padding:10px 15px;border-top:1px solid var(--line-2)}' + '.brow:first-child{border-top:0}' + '.brow:hover{background:var(--raise)}' + '.bnm{font-size:13px;color:var(--ink);overflow:hidden;text-overflow:ellipsis;' + 'white-space:nowrap}' + '.bmeta{grid-column:1;font-size:11px;color:var(--ink-3);' + 'font-family:"IBM Plex Mono",monospace}' + '.bacts{grid-row:1/3;display:flex;align-items:center;gap:6px;flex-wrap:wrap}' + '.bacts button{font:inherit;font-size:11px;cursor:pointer;background:var(--raise);' + 'color:var(--ink);border:1px solid var(--line);padding:4px 8px;border-radius:4px}' + '.bacts button:hover{border-color:var(--cyan)}' + '.bacts button.dang:hover{border-color:var(--amber);color:var(--amber)}' + '.bpub{font-size:10px;font-family:"IBM Plex Mono",monospace;text-transform:uppercase;' + 'letter-spacing:.05em;padding:2px 6px;border-radius:3px;background:var(--sunk);' + 'color:var(--ink-3)}' + '.bpub.on{background:color-mix(in srgb,var(--cyan) 20%,transparent);color:var(--cyan)}' + '.bby{display:inline-flex;align-items:center;gap:6px;margin-left:10px;' + 'vertical-align:middle}' + '.bby .bh{color:var(--ink-2);font-family:"IBM Plex Sans",sans-serif;font-size:11px}' + '.bby .bh.dim{color:var(--ink-3);font-style:italic}' + '.bempty{padding:22px 15px;color:var(--ink-2);font-size:13px}' + '.bfoot{flex:0 0 auto;padding:9px 15px;border-top:1px solid var(--line-2);' + 'font-size:11px;color:var(--ink-3)}' + '@media(max-width:560px){.brow{grid-template-columns:1fr}.bacts{grid-row:auto}}';
                document.head.appendChild(s);
            }

            function openBuilds(mode) {
                buildsStyle();
                peopleStyle();
                BMODE = mode || 'mine';
                if (!BPANEL) {
                    BPANEL = document.createElement('div');
                    BPANEL.className = 'bov';
                    BPANEL.innerHTML = '<div class="bpanel" role="dialog" aria-modal="true" aria-label="Builds">' + '<div class="bhead">' + '<h2 id="btitle">Builds</h2>' + '<button type="button" id="bmine">Mine</button>' + '<button type="button" id="bpublic">Community</button>' + '<button type="button" id="bfollow">Following</button>' + '<button type="button" id="bpeople">People</button>' + '<button type="button" id="bclose" aria-label="Close">&times;</button>' /* The search row is part of the panel rather than injected per view, so
       switching tabs never reflows the header. It is hidden everywhere but
       People -- filtering a build list by handle is a different feature. */
                    + '</div><div class="psearch" id="bsearch" hidden>' + '<input type="search" id="pq" placeholder="Search handles and gamertags"' + ' autocomplete="off" spellcheck="false" aria-label="Search people">' + '</div><div class="bbody" id="bbody"></div>' + '<p class="bfoot" id="bfoot"></p></div>';
                    document.body.appendChild(BPANEL);
                    BPANEL.addEventListener('click', onBuildsClick);
                    /* `input` on the search box, not a keyup: it also fires for the little
       clear cross a type=search field draws, which keyup never sees. */
                    var q = BPANEL.querySelector('#pq');
                    if (q)
                        q.addEventListener('input', function() {
                            PQ = q.value.trim();
                            paintPeople();
                        });
                }
                BPANEL.style.display = 'flex';
                loadBuilds();
            }

            function closeBuilds() {
                if (BPANEL)
                    BPANEL.style.display = 'none';
            }

            function onBuildsClick(e) {
                var t = e.target;
                if (t === BPANEL || t.id === 'bclose') {
                    closeBuilds();
                    return;
                }
                if (t.id === 'bmine') {
                    BMODE = 'mine';
                    loadBuilds();
                    return;
                }
                if (t.id === 'bpublic') {
                    BMODE = 'public';
                    loadBuilds();
                    return;
                }
                if (t.id === 'bfollow') {
                    BMODE = 'follow';
                    loadBuilds();
                    return;
                }
                if (t.id === 'bpeople') {
                    BMODE = 'people';
                    loadBuilds();
                    return;
                }

                /* PEOPLE ROUTES FIRST, and each one returns. A person row and a build row
     both carry data-act, so falling through to the build handler below would
     look up a build id that is not there. */
                if (t.dataset.act === 'follow') {
                    toggleFollow(t.dataset.uid, t);
                    return;
                    /* never opens the row */
                }
                if (t.dataset.act === 'people') {
                    BMODE = 'people';
                    loadBuilds();
                    return;
                }
                var prow = t.closest ? t.closest('.prow') : null;
                if (prow) {
                    openPerson(prow.dataset.uid);
                    return;
                }

                var row = t.closest ? t.closest('[data-id]') : null;
                if (!row)
                    return;
                var id = row.dataset.id
                  , act = t.dataset.act;

                /* The author line on a community row is a way in to that person. Only when
     there IS an author_id -- an anonymous row has nothing to open. */
                if (!act && t.closest('.bby') && row.dataset.authorId) {
                    openPerson(row.dataset.authorId);
                    return;
                }
                if (!act)
                    return;
                if (act === 'load')
                    loadBuildRow(id);
                else if (act === 'share')
                    shareBuild(id, row.dataset.slug);
                else if (act === 'pub')
                    togglePublic(id, row.dataset.pub === '1');
                else if (act === 'del')
                    deleteBuild(id, row.dataset.name);
                else if (act === 'like')
                    toggleLike(id);
                    /* openReport lives in web_legal.js -- same module scope. Dispatched from
     here, where the row is already in hand, rather than from a second
     document-level listener that would have to stopPropagation to keep this
     one from also acting on the click. */
                else if (act === 'report' && typeof openReport === 'function')
                    openReport(id, row.dataset.name, row.dataset.author, row.dataset.authorId);
            }

            function bfoot(t) {
                var f = document.getElementById('bfoot');
                if (f)
                    f.textContent = t || '';
            }

            function loadBuilds() {
                var body = document.getElementById('bbody');
                if (!body)
                    return;
                document.getElementById('btitle').textContent = BMODE === 'mine' ? 'My builds' : BMODE === 'follow' ? 'Following' : BMODE === 'people' ? 'People' : 'Community builds';
                document.getElementById('bmine').className = BMODE === 'mine' ? 'on' : '';
                document.getElementById('bpublic').className = BMODE === 'public' ? 'on' : '';
                document.getElementById('bfollow').className = BMODE === 'follow' ? 'on' : '';
                document.getElementById('bpeople').className = BMODE === 'people' ? 'on' : '';
                document.getElementById('bmine').hidden = !ME;
                document.getElementById('bfollow').hidden = !ME;
                /* the search box belongs to People and nowhere else */
                document.getElementById('bsearch').hidden = BMODE !== 'people';

                if (BMODE === 'people') {
                    loadPeople();
                    return;
                }
                if (BMODE === 'follow') {
                    loadFollowFeed();
                    return;
                }

                if (BMODE === 'mine' && !ME) {
                    body.innerHTML = '<p class="bempty">Sign in to save builds.</p>';
                    bfoot('');
                    return;
                }
                body.innerHTML = '<p class="bempty">Loading&hellip;</p>';

                var q = BMODE === 'mine' ? SB.from('builds').select('*').eq('user_id', ME.id).order('updated_at', {
                    ascending: false
                }) : SB.from('public_builds').select('*').order('like_count', {
                    ascending: false
                }).order('created_at', {
                    ascending: false
                }).limit(100);

                q.then(function(r) {
                    if (r.error) {
                        body.innerHTML = '<p class="bempty">Could not load builds: ' + aesc(r.error.message) + '</p>';
                        return;
                    }
                    BROWS = r.data || [];
                    paintBuilds();
                });
            }

            function paintBuilds() {
                var body = document.getElementById('bbody');
                if (!BROWS.length) {
                    body.innerHTML = '<p class="bempty">' + (BMODE === 'mine' ? 'No saved builds yet. Build something, then hit <b>Save build</b>.' : 'No public builds yet. Save one and mark it public to be first.') + '</p>';
                    bfoot('');
                    return;
                }
                /* THREE VIEWS SHARE THIS RENDERER, NOT TWO. Community, Following and one
     person's page are all lists of OTHER people's public builds, so every
     `BMODE === 'public'` test below became "not mine" when Following and the
     profile page were added -- otherwise the author line, the like button and
     the report flag silently vanish on two of the three. */
                var mine = BMODE === 'mine';
                body.innerHTML = BROWS.map(function(b) {
                    var meta = [POSL[b.pos] || '?', ftin(b.height_in), b.overall ? b.overall + ' ovr' : '', b.archetype || ''].filter(Boolean).join('  ·  ');
                    var acts = '<button type="button" data-act="load">Load</button>';
                    if (mine) {
                        acts += '<button type="button" data-act="pub">' + (b.is_public ? 'Unshare' : 'Share') + '</button>' + (b.is_public ? '<button type="button" data-act="share">Copy link</button>' : '') + '<button type="button" data-act="del" class="dang">Delete</button>';
                    } else {
                        acts += '<button type="button" data-act="like">&#9825; ' + (b.like_count || 0) + '</button>';
                    }
                    /* The author line carries a face, a handle and a gamertag badge -- all
       three come back on the same row from public_builds, so the feed is still
       one request rather than a profile lookup per build. */
                    var by = '';
                    if (!mine) {
                        by = '<span class="bby">' + avatarHtml(b.avatar_cfg, b.author || '?', 18) + (b.author ? '<span class="bh">@' + aesc(b.author) + '</span>' : '<span class="bh dim">anonymous</span>') /* Credit badge. The label is operator-set: `credit` is deliberately
            absent from the authenticated update grant, so this is the one
            thing on the row a user cannot write about themselves. Escaped
            anyway -- it is still text arriving from the database. */
                        + creditBadge(b.credit) + platBadge(b.platform, b.gamertag) + styleBadges(b.play_styles) + '</span>';
                    }
                    /* Report is offered on the COMMUNITY list only -- on your own builds it
       would be noise. data-author / data-authorid ride on the row so the
       handler needs no lookup; author_id comes from public_builds (added in
       schema_reports.sql) because a profile report targets the USER, not the
       build. */
                    if (!mine)
                        acts += '<button type="button" class="breport" data-act="report" ' + 'title="Report this build or user" aria-label="Report">&#9873;</button>';

                    return '<div class="brow" data-id="' + b.id + '" data-slug="' + aesc(b.slug || '') + '" data-pub="' + (b.is_public ? 1 : 0) + '" data-name="' + aesc(b.name) + '"' /* data-author-id, hyphenated: dataset.authorId only maps to the
         hyphenated form. data-authorid would read back as dataset.authorid and
         the profile report would silently lose its target. */
                    + ' data-author="' + aesc(b.author || '') + '"' + ' data-author-id="' + aesc(b.author_id || '') + '">' + '<span class="bnm">' + aesc(b.name) + (mine && b.is_public ? ' <span class="bpub on">public</span>' : '') + '</span>' + '<span class="bacts">' + acts + '</span>' + '<span class="bmeta">' + aesc(meta) + by + '</span></div>';
                }).join('');
                bfoot(BROWS.length + (BROWS.length === 1 ? ' build' : ' builds'));
            }

            function rowById(id) {
                for (var i = 0; i < BROWS.length; i++)
                    if (BROWS[i].id === id)
                        return BROWS[i];
                return null;
            }

            function loadBuildRow(id) {
                var b = rowById(id);
                if (!b)
                    return;
                if (applyBuildCode(b.code)) {
                    closeBuilds();
                    authMsg('Loaded "' + b.name + '".');
                }
            }

            /* ── saving ──────────────────────────────────────────────────────────── */
            /* ── SAVING, AND POSTING ─────────────────────────────────────────────────
   THE OLD FLOW WAS NINE STEPS AND NOBODY FINISHED IT. Measured on the live
   database: 27 accounts, 14 claimed handles, and exactly ONE build ever marked
   public. To publish you had to Save build (a window.prompt), answer a second
   window.prompt for a handle, then open the panel, switch to Mine, find the
   row and press Share -- and nothing in the save told you sharing existed at
   all. Saving was private by default with the publish action three clicks away
   in a different panel.

   Now it is one dialog with two buttons, and the choice is explicit rather
   than a default: POST TO COMMUNITY or SAVE PRIVATELY, equal weight, one click
   each. Publishing is outward-facing, so it is never pre-ticked and never
   happens as a side effect of saving -- but it is no longer harder than the
   thing nobody wanted.                                                      */

            function buildSummary(meta) {
                return [POSL[meta.pos] || '?', ftin(meta.height_in), meta.overall ? meta.overall + ' ovr' : '', meta.archetype || ''].filter(Boolean).join('  ·  ');
            }

            /* `post` only preselects which button is primary. Both are always offered. */
            function saveCurrentBuild() {
                openPostBuild(true);
            }

            function openPostBuild(post) {
                if (!ME) {
                    openAuthModal('in');
                    return;
                }
                var meta = currentMeta();
                if (!meta.code) {
                    authMsg('Nothing to save yet.', true);
                    return;
                }

                var needHandle = !(MYPROFILE && MYPROFILE.handle);
                amodal(post ? 'Post this build' : 'Save this build', '<p class="psum">' + aesc(buildSummary(meta)) + '</p>' + '<label class="afield"><span>Build name</span>' + '<input id="pbname" type="text" maxlength="60" autocomplete="off" value="' + aesc(meta.archetype || 'My build') + '"></label>' /* The handle is asked for HERE, in the same dialog, rather than as a
       second window.prompt after the fact. It is only ever needed once and
       only when posting -- a private save stays anonymous quite happily. */
                + (needHandle ? '<label class="afield"><span>Your handle &mdash; shown as the author</span>' + '<input id="pbhandle" type="text" maxlength="20" autocomplete="off"' + ' placeholder="3-20 letters, numbers or underscore"></label>' : '') + '<div class="arow">' + '<button type="button" id="pbpost" class="pri">Post to Community</button>' + '<button type="button" id="pbpriv">Save privately</button>' + '</div>' + '<p class="pbnote">Posting shows this build, your handle and your ' + 'gamertag to anyone. You can unshare it any time from <b>My builds</b>.</p>' + '<p class="amsg" id="amsg"></p>');

                var nm = document.getElementById('pbname');
                if (nm) {
                    nm.focus();
                    nm.select();
                }
                document.getElementById('pbpost').onclick = function() {
                    doSave(true);
                }
                ;
                document.getElementById('pbpriv').onclick = function() {
                    doSave(false);
                }
                ;
                /* Enter posts, because that is the button people came for. */
                AMODAL.onkeydown = function(e) {
                    if (e.key === 'Enter')
                        doSave(true);
                }
                ;
            }

            function doSave(publish) {
                if (BBUSY)
                    return;
                var meta = currentMeta();
                var nmEl = document.getElementById('pbname');
                var name = ((nmEl && nmEl.value) || '').trim().slice(0, 60) || meta.archetype || 'My build';
                var hEl = document.getElementById('pbhandle');
                var handle = hEl ? hEl.value.trim() : '';

                /* A POST WITHOUT A HANDLE IS REFUSED, not quietly published as anonymous.
     The author line is the whole reason posting is worth doing, and somebody
     who typed nothing into a field labelled "shown as the author" has not
     decided to be anonymous -- they have missed the field. */
                if (publish && hEl && !handle) {
                    amsg('Pick a handle so people can find you.', true);
                    hEl.focus();
                    return;
                }
                if (handle && !/^[A-Za-z0-9_]{3,20}$/.test(handle)) {
                    amsg('Handle must be 3-20 letters, numbers or underscore.', true);
                    hEl.focus();
                    return;
                }

                BBUSY = true;
                amsg(publish ? 'Posting…' : 'Saving…');
                setHandle(handle).then(function(err) {
                    if (err) {
                        BBUSY = false;
                        amsg(err, true);
                        return null;
                    }
                    return SB.from('builds').insert({
                        user_id: ME.id,
                        name: name,
                        code: meta.code,
                        pos: meta.pos,
                        height_in: meta.height_in,
                        overall: meta.overall,
                        archetype: meta.archetype,
                        is_public: !!publish
                    }).select().single();
                }).then(function(r) {
                    if (!r)
                        return;
                    BBUSY = false;
                    if (r.error) {
                        amsg(/build limit/i.test(r.error.message) ? r.error.message : 'Could not save: ' + r.error.message, true);
                        return;
                    }
                    if (publish)
                        postedPanel(r.data, name);
                    else {
                        closeAmodal();
                        /* Saved privately -- offer the other half right here rather than making
         them find it later. This is the step that used to be invisible. */
                        authMsg('Saved "' + name + '" privately.');
                        pendPost(r.data.id, name);
                    }
                }).catch(function(e) {
                    BBUSY = false;
                    amsg('Could not save: ' + (e && e.message ? e.message : e), true);
                });
            }

            /* Resolves to an error STRING or null, never rejects -- the caller chains a
   single .then and a thrown handle error would otherwise land in the generic
   "Could not save" catch and blame the wrong thing. */
            function setHandle(h) {
                if (!h || (MYPROFILE && MYPROFILE.handle))
                    return Promise.resolve(null);
                return SB.from('profiles').update({
                    handle: h,
                    updated_at: new Date().toISOString()
                }).eq('user_id', ME.id).then(function(r) {
                    if (r.error)
                        return /duplicate|unique/i.test(r.error.message) ? 'That handle is taken -- pick another.' : r.error.message;
                    MYPROFILE = MYPROFILE || {};
                    MYPROFILE.handle = h;
                    paintAuth();
                    return null;
                });
            }

            /* What "it worked" looks like: the link, ready to paste, and a way straight to
   the feed it just joined. A toast that vanishes is not a share flow. */
            function postedPanel(row, name) {
                var url = shareLink(row.slug);
                amodal('Posted', '<p class="psum">“' + aesc(name) + '” is now in the Community feed.</p>' + '<label class="afield"><span>Share link</span>' + '<input id="pblink" type="text" readonly value="' + aesc(url) + '"></label>' + '<div class="arow">' + '<button type="button" id="pbcopy" class="pri">Copy link</button>' + '<button type="button" id="pbsee">See it in Community</button>' + '</div><p class="amsg" id="amsg"></p>');
                var f = document.getElementById('pblink');
                if (f) {
                    f.focus();
                    f.select();
                }
                document.getElementById('pbcopy').onclick = function() {
                    if (navigator.clipboard && navigator.clipboard.writeText)
                        navigator.clipboard.writeText(url).then(function() {
                            amsg('Link copied.');
                        }, function() {
                            f.select();
                            amsg('Press Ctrl+C to copy.');
                        });
                    else {
                        f.select();
                        amsg('Press Ctrl+C to copy.');
                    }
                }
                ;
                document.getElementById('pbsee').onclick = function() {
                    closeAmodal();
                    openBuilds('public');
                }
                ;
                paintPostPanel();
            }

            /* The offer after a private save. One click, and it uses the row that was just
   written rather than re-saving a second copy. */
            function pendPost(id, name) {
                var host = document.getElementById('postPanel');
                if (!host)
                    return;
                host.dataset.pending = id;
                paintPostPanel(name);
            }

            function publishPending(id) {
                SB.from('builds').update({
                    is_public: true,
                    updated_at: new Date().toISOString()
                }).eq('id', id).select().single().then(function(r) {
                    if (r.error) {
                        authMsg('Could not post: ' + r.error.message, true);
                        return;
                    }
                    var host = document.getElementById('postPanel');
                    if (host)
                        delete host.dataset.pending;
                    postedPanel(r.data, r.data.name);
                });
            }

            /* ── THE POST PANEL, IN "SAVE & SHARE" ───────────────────────────────────
   Posting was nine steps behind two window.prompts and a panel nobody opened.
   This is the one place that says, where the build is finished, that the
   Community exists and that posting to it is one click.

   It was first built into the empty left column under the attribute board
   (`.work` is `minmax(0,1fr) 318px` with `align-items:start`, so a third child
   at `grid-column:1` lands in the gap the rail leaves). The user turned that
   down -- the gap is still open for something else and is NOT the home for
   this.

   WEB BUILD ONLY -- mounted from JS, never in ui_shell.html. The artifact has
   no accounts and no community, so a Post button there would be a dead
   control, and the shared markup stays identical between the two builds. */
            function mountPostPanel() {
                if (document.getElementById('postPanel'))
                    return;
                /* IT GOES AT THE TOP OF "SAVE & SHARE", not in the empty left column below
     the attribute board. That gap was offered as a home for it and turned
     down -- and the section named Save & share, which until now held Build
     card / Copy code / Send to 2K HQ and no way to actually share to the
     site, is where somebody looking to post will already be. */
                var host = document.querySelector('section.out');
                if (!host)
                    return;
                var el = document.createElement('section');
                el.id = 'postPanel';
                el.className = 'ppanel';
                host.insertBefore(el, host.firstChild);
                el.addEventListener('click', function(e) {
                    var b = e.target.closest('button');
                    if (!b)
                        return;
                    if (b.dataset.act === 'post')
                        openPostBuild(true);
                    else if (b.dataset.act === 'priv')
                        openPostBuild(false);
                    else if (b.dataset.act === 'pending')
                        publishPending(el.dataset.pending);
                    else if (b.dataset.act === 'feed')
                        openBuilds('public');
                    else if (b.dataset.act === 'people')
                        openBuilds('people');
                    else if (b.dataset.act === 'signin')
                        openAuthModal('in');
                });
                paintPostPanel();

                /* THE SUMMARY LINE HAS TO FOLLOW THE SLIDERS. render() lives inside the
     page's own IIFE and cannot be hooked from a module, but it rewrites
     #codeOut on every change -- so watching that one node is the same signal
     without touching the shared page. Skipped while an offer to post a
     just-saved build is showing: that offer is about a row already written,
     and the build moving on does not invalidate it. */
                var out = document.getElementById('codeOut');
                if (out && window.MutationObserver)
                    new MutationObserver(function() {
                        if (!el.dataset.pending)
                            paintPostPanel();
                    }
                    ).observe(out, {
                        childList: true,
                        characterData: true,
                        subtree: true
                    });
            }

            function postStyle() {
                if (document.getElementById('ppncss'))
                    return;
                var s = document.createElement('style');
                s.id = 'ppncss';
                s.textContent = /* grid-column:1 is what puts it in the gap; on the stacked layout under
       1080px the grid is one column and it simply follows the board. */
                '.ppanel{background:var(--sunk);border:1px solid var(--line);' + 'border-radius:6px;padding:14px 15px;margin:0 0 14px}' + '.ppanel h2{margin:0 0 4px;font-size:14px;color:var(--ink);' + 'font-family:"Chakra Petch",sans-serif;letter-spacing:.02em}' + '.ppanel p{margin:0;font-size:12.5px;color:var(--ink-2);line-height:1.55}' + '.ppanel .pacts{display:flex;gap:8px;flex-wrap:wrap;margin:13px 0 0}' + '.ppanel .pacts button{font:inherit;font-size:12.5px;cursor:pointer;' + 'padding:8px 14px;border-radius:4px;border:1px solid var(--line);' + 'background:var(--raise);color:var(--ink)}' + '.ppanel .pacts button:hover{border-color:var(--cyan)}' + '.ppanel .pacts button.pri{background:var(--cyan);color:#06202a;' + 'border-color:var(--cyan);font-weight:600}' + '.ppanel .pacts button.pri:hover{filter:brightness(1.08)}' + '.psum{font-family:"IBM Plex Mono",monospace;font-size:11.5px;' + 'color:var(--ink-3);margin:0 0 12px}' + '.pbnote{margin:12px 0 0;font-size:11px;color:var(--ink-3);line-height:1.5}' + '.amodal .psum{margin:0 0 13px}' + '.amodal input[readonly]{color:var(--ink-2)}';
                document.head.appendChild(s);
            }

            function paintPostPanel(justSaved) {
                postStyle();
                var el = document.getElementById('postPanel');
                if (!el)
                    return;

                if (!ME) {
                    el.innerHTML = '<h2>Share this build</h2>' + '<p>Post it to the Community feed so other players can load it, and ' + 'follow the people whose builds you want to see.</p>' + '<div class="pacts"><button type="button" class="pri" data-act="signin">' + 'Sign in to post</button>' + '<button type="button" data-act="feed">Browse Community</button></div>';
                    return;
                }

                /* A build was just saved privately -- the ONE click that used to be nine. */
                if (el.dataset.pending) {
                    el.innerHTML = '<h2>Saved privately</h2>' + '<p>“' + aesc(justSaved || 'That build') + '” is in <b>My builds</b>. ' + 'Nobody else can see it yet.</p>' + '<div class="pacts"><button type="button" class="pri" data-act="pending">' + 'Post it to Community</button>' + '<button type="button" data-act="feed">Not now</button></div>';
                    return;
                }

                el.innerHTML = '<h2>Share this build</h2>' + '<p class="psum">' + aesc(buildSummary(currentMeta())) + '</p>' + '<p>Post it to the Community feed and anyone can load it, like it and ' + 'follow you. Or keep it to yourself — saving does not share it.</p>' + '<div class="pacts">' + '<button type="button" class="pri" data-act="post">Post to Community</button>' + '<button type="button" data-act="priv">Save privately</button>' + '<button type="button" data-act="people">Find people</button></div>';
            }

            /* ── DELETING ────────────────────────────────────────────────────────────
   THIS FUNCTION HAD NEVER EXISTED. The Delete button has shipped with
   `data-act="del"` since My builds was written and the handler has always
   dispatched to `deleteBuild(...)` -- which was defined nowhere, in any commit.
   Every click threw a ReferenceError inside the listener and died there, so
   the button looked inert rather than broken and nobody could tell why.

   Reported as "I'm not able to delete builds now": the "now" is the tell that
   made it worth checking history rather than the recent diff. It was not a
   regression -- it was never once wired up, and it only surfaced when the
   People/follow work gave people a reason to open My builds at all.

   CONFIRM FIRST, ALWAYS. There is no undo and no trash: the row is gone, and
   with it the share link, so anyone holding that URL gets nothing. The prompt
   names the build rather than asking "are you sure?" about an unnamed thing.  */
            function deleteBuild(id, name) {
                var b = rowById(id);
                if (!b || BBUSY)
                    return;
                var was = b.is_public;
                if (!window.confirm('Delete "' + (name || b.name) + '" permanently?' + (was ? '\n\nIt is posted to the Community, so it will disappear from the ' + 'feed and its share link will stop working.' : '') + '\n\nThis cannot be undone.'))
                    return;

                BBUSY = true;
                SB.from('builds').delete().eq('id', id).then(function(r) {
                    BBUSY = false;
                    if (r.error) {
                        authMsg('Could not delete: ' + r.error.message, true);
                        return;
                    }
                    /* Drop it from the list in hand and repaint, rather than refetching --
       the row is gone and a round trip would only prove it again. Falling to
       zero rows must go through loadBuilds so the empty state is drawn. */
                    for (var i = 0; i < BROWS.length; i++)
                        if (BROWS[i].id === id) {
                            BROWS.splice(i, 1);
                            break;
                        }
                    if (BROWS.length)
                        paintBuilds();
                    else
                        loadBuilds();
                    authMsg('Deleted "' + (name || b.name) + '".');
                }).catch(function(e) {
                    BBUSY = false;
                    authMsg('Could not delete: ' + (e && e.message ? e.message : e), true);
                });
            }

            /* ── sharing ─────────────────────────────────────────────────────────── */
            function togglePublic(id, isPub) {
                var b = rowById(id);
                if (!b)
                    return;
                SB.from('builds').update({
                    is_public: !isPub,
                    updated_at: new Date().toISOString()
                }).eq('id', id).then(function(r) {
                    if (r.error) {
                        authMsg(r.error.message, true);
                        return;
                    }
                    b.is_public = !isPub;
                    paintBuilds();
                    if (b.is_public)
                        shareBuild(id, b.slug);
                    else
                        authMsg('"' + b.name + '" is private again.');
                });
            }

            function shareLink(slug) {
                return location.origin + location.pathname + '?b=' + slug;
            }

            function shareBuild(id, slug) {
                var b = rowById(id);
                if (!b || !slug)
                    return;
                var url = shareLink(slug);
                var done = function() {
                    authMsg('Share link copied.');
                };
                if (navigator.clipboard && navigator.clipboard.writeText)
                    navigator.clipboard.writeText(url).then(done, function() {
                        window.prompt('Copy this link:', url);
                    });
                else
                    window.prompt('Copy this link:', url);
            }

            function toggleLike(id) {
                if (!ME) {
                    authMsg('Sign in to like builds.', true);
                    return;
                }
                var b = rowById(id);
                if (!b)
                    return;
                /* The primary key on (build_id, user_id) is what stops a double like, and
     the count is maintained by a trigger -- so this only has to try, and treat
     a duplicate as "already liked, undo it". */
                SB.from('build_likes').insert({
                    build_id: id,
                    user_id: ME.id
                }).then(function(r) {
                    if (r.error && /duplicate|unique/i.test(r.error.message)) {
                        return SB.from('build_likes').delete().eq('build_id', id).eq('user_id', ME.id).then(function() {
                            b.like_count = Math.max(0, (b.like_count || 0) - 1);
                            paintBuilds();
                        });
                    }
                    if (r.error) {
                        authMsg(r.error.message, true);
                        return;
                    }
                    b.like_count = (b.like_count || 0) + 1;
                    paintBuilds();
                });
            }

            /* ── a shared link ───────────────────────────────────────────────────── */
            /* ?b=<slug> loads that build straight into the builder. Works signed out:
   public_builds is readable by anyone, which is the whole point of a share
   link -- a recipient should not have to make an account to look. */
            function openSharedBuild() {
                var m = /[?&]b=([A-Za-z0-9]+)/.exec(location.search);
                if (!m)
                    return;
                var slug = m[1];
                SB.from('public_builds').select('name,code,author').eq('slug', slug).maybeSingle().then(function(r) {
                    if (r.error || !r.data) {
                        authMsg('That shared build is not available (it may have been unshared).', true);
                        return;
                    }
                    if (applyBuildCode(r.data.code))
                        authMsg('Loaded "' + r.data.name + '"' + (r.data.author ? ' by @' + r.data.author : '') + '.');
                    /* Drop the parameter once it is loaded, so a refresh does not fight the
         user's edits by reloading the shared build over them. */
                    try {
                        history.replaceState(null, '', location.origin + location.pathname);
                    } catch (e) {}
                });
            }

            /* Called by web_auth.js whenever the session settles. Runs the share-link load
   once, and refreshes an open panel so it is not stale after a sign-in. */
            var SHAREDONE = false;
            function onAuthChanged() {
                if (!SB)
                    return;
                if (!SHAREDONE) {
                    SHAREDONE = true;
                    openSharedBuild();
                }
                if (BPANEL && BPANEL.style.display !== 'none')
                    loadBuilds();
                /* Signing in or out changes what the panel in the gap can offer, and
     mountPostPanel is idempotent, so this is also where it first appears. */
                mountPostPanel();
                paintPostPanel();
                /* WHO YOU FOLLOW IS PER ACCOUNT. Dropping the cache on any auth change is
     what stops a signed-out viewer inheriting the previous user's Following
     state -- null means "not loaded", which is the state that hides the
     button entirely rather than showing a wrong one. */
                PFOLL = null;
                if (ME)
                    loadFollowing();
            }

            /* ── PEOPLE: LOOK SOMEBODY UP, FOLLOW THEM, READ THEIR BUILDS ─────────────
   Web build only, same module scope as web_auth / web_builds, so SB, ME, aesc,
   avatarHtml, platBadge and creditBadge are reached directly.

   WHY THE COMMUNITY TAB LOOKED BROKEN. It was not. Measured against the live
   database: 14 accounts have claimed a handle and exactly ONE build in the
   whole table is marked public -- the owner's own -- so the feed correctly
   rendered a single row and read as a dead feature. Nothing was failing; there
   was simply no reason for anyone to publish, because there was no way to find
   a person or be found by one. This is that half.

   Three things, one panel:
     People     the directory of everyone with a handle, searchable
     @someone   one person: their card, and their public builds
     Following  the community feed narrowed to people you follow

   The follow graph lives in server/schema_follows.sql. Counts come off the
   public_profiles view in the SAME request as the list, so browsing the
   directory is one round trip rather than one per person.                   */

            var PROWS = []
              , PQ = ''
              , PUSER = null
              , PFOLL = null
              , PBUSY = false;

            /* WHO YOU FOLLOW, FETCHED ONCE AND KEPT. The button state is needed on every
   row of the directory and on every profile card, and asking per row would be
   one request per person. Null means "not loaded yet", which is NOT the same
   as "follows nobody" -- a signed-out viewer never loads it and must see no
   button at all rather than an inviting "Follow" that cannot work. */
            function followSet() {
                return PFOLL;
            }

            function loadFollowing() {
                if (!ME || !SB) {
                    PFOLL = null;
                    return Promise.resolve(null);
                }
                return SB.from('follows').select('followee_id').eq('follower_id', ME.id).then(function(r) {
                    PFOLL = {};
                    if (!r.error)
                        (r.data || []).forEach(function(f) {
                            PFOLL[f.followee_id] = 1;
                        });
                    return PFOLL;
                });
            }

            function iFollow(uid) {
                return !!(PFOLL && PFOLL[uid]);
            }

            /* ── styling, scoped ──────────────────────────────────────────────────────
   Every class here is prefixed `p`- and none of them exists in the builder.
   That is not fussiness: these stylesheets are injected at runtime so they
   land AFTER the page's own <style> and win every tie at equal specificity --
   which is how `.chip`, `.alt` and `.plan` each silently restyled a builder
   control once already. build/asmweb.py fails the build if this slips. */
            function peopleStyle() {
                if (document.getElementById('ppcss'))
                    return;
                var s = document.createElement('style');
                s.id = 'ppcss';
                s.textContent = '.psearch{flex:0 0 auto;padding:10px 15px;border-bottom:1px solid var(--line-2)}' + '.psearch input{width:100%;font:inherit;font-size:13px;background:var(--sunk);' + 'color:var(--ink);border:1px solid var(--line);border-radius:4px;padding:7px 10px}' + '.psearch input:focus{outline:0;border-color:var(--cyan)}' + '.prow{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:3px 11px;' + 'align-items:center;padding:10px 15px;border-top:1px solid var(--line-2);cursor:pointer}' + '.prow:first-child{border-top:0}' + '.prow:hover{background:var(--raise)}' + '.prow .av{grid-row:span 2}' + '.pnm{font-size:13px;color:var(--ink);font-weight:600;overflow:hidden;' + 'text-overflow:ellipsis;white-space:nowrap}' + '.pmeta{grid-column:2;font-size:11px;color:var(--ink-3);' + 'font-family:"IBM Plex Mono",monospace}' + '.pfol{grid-row:span 2;font:inherit;font-size:11px;cursor:pointer;' + 'background:var(--raise);color:var(--ink);border:1px solid var(--line);' + 'padding:5px 11px;border-radius:4px;white-space:nowrap}' + '.pfol:hover{border-color:var(--cyan)}' + '.pfol.on{background:color-mix(in srgb,var(--cyan) 18%,transparent);' + 'color:var(--cyan);border-color:var(--cyan)}' + '.pfol.on:hover{border-color:var(--amber);color:var(--amber)}' + '.pcard{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:4px 13px;' + 'align-items:center;padding:15px;border-bottom:1px solid var(--line-2);' + 'background:var(--raise)}' + '.pcard .av{grid-row:span 3}' + '.pcard h3{margin:0;font-size:17px;color:var(--ink)}' + '.pcard .pbio{grid-column:2;font-size:12px;color:var(--ink-2);margin:0;' + 'overflow-wrap:anywhere}' + '.pcard .pcount{grid-column:2;font-size:11px;color:var(--ink-3);' + 'font-family:"IBM Plex Mono",monospace}' + '.pcard .pcount b{color:var(--ink-2)}' + '.pback{font:inherit;font-size:11px;cursor:pointer;background:none;border:0;' + 'color:var(--ink-3);padding:0;text-decoration:underline}' + '.pback:hover{color:var(--cyan)}';
                document.head.appendChild(s);
            }

            /* ── the directory ───────────────────────────────────────────────────────
   Ordered by followers, then by how many builds they have actually shared, so
   the top of the list is people worth following rather than whoever signed up
   first. Handle ascending last so the order is stable across reloads. */
            function loadPeople() {
                var body = document.getElementById('bbody');
                if (!body || !SB)
                    return;
                body.innerHTML = '<p class="bempty">Loading&hellip;</p>';

                Promise.resolve(PFOLL === null && ME ? loadFollowing() : null).then(function() {
                    return SB.from('public_profiles').select('*').order('follower_count', {
                        ascending: false
                    }).order('build_count', {
                        ascending: false
                    }).order('handle', {
                        ascending: true
                    }).limit(200);
                }).then(function(r) {
                    if (r.error) {
                        /* 42P01 is "relation does not exist" -- the migration has not been run.
         Say THAT, rather than a raw Postgres string nobody can act on. */
                        body.innerHTML = '<p class="bempty">' + (/public_profiles/.test(r.error.message || '') ? 'People search is not switched on yet for this site.' : 'Could not load people: ' + aesc(r.error.message)) + '</p>';
                        bfoot('');
                        return;
                    }
                    PROWS = r.data || [];
                    paintPeople();
                });
            }

            function peopleMatching() {
                var q = PQ.toLowerCase();
                if (!q)
                    return PROWS;
                return PROWS.filter(function(p) {
                    return (p.handle || '').toLowerCase().indexOf(q) >= 0 || (p.gamertag || '').toLowerCase().indexOf(q) >= 0;
                });
            }

            function followBtn(uid) {
                /* No button at all when signed out or still loading -- an inviting "Follow"
     that opens a sign-in wall is worse than no button. */
                if (!ME || PFOLL === null)
                    return '';
                if (uid === ME.id)
                    return '';
                /* no self-follow */
                var on = iFollow(uid);
                return '<button type="button" class="pfol' + (on ? ' on' : '') + '" data-act="follow"' + ' data-uid="' + aesc(uid) + '">' + (on ? 'Following' : 'Follow') + '</button>';
            }

            function paintPeople() {
                var body = document.getElementById('bbody')
                  , rows = peopleMatching();
                if (!rows.length) {
                    body.innerHTML = '<p class="bempty">' + (PQ ? 'Nobody matches <b>' + aesc(PQ) + '</b>.' : 'No handles yet. Set one in your account to be findable.') + '</p>';
                    bfoot('');
                    return;
                }
                body.innerHTML = rows.map(function(p) {
                    var bits = [p.build_count + (p.build_count === 1 ? ' build' : ' builds'), p.follower_count + (p.follower_count === 1 ? ' follower' : ' followers')];
                    return '<div class="prow" data-uid="' + aesc(p.user_id) + '" data-act="open">' + avatarHtml(p.avatar_cfg, p.handle || '?', 30) + '<span class="pnm">@' + aesc(p.handle) + creditBadge(p.credit) + platBadge(p.platform, p.gamertag) + styleBadges(p.play_styles) + '</span>' + followBtn(p.user_id) + '<span class="pmeta">' + aesc(bits.join('  ·  ')) + '</span></div>';
                }).join('');
                bfoot(rows.length + (rows.length === 1 ? ' person' : ' people') + (PQ ? ' matching' : ''));
            }

            function profileByUid(uid) {
                for (var i = 0; i < PROWS.length; i++)
                    if (PROWS[i].user_id === uid)
                        return PROWS[i];
                return null;
            }

            /* ── one person ──────────────────────────────────────────────────────────
   The card is drawn from the directory row already in hand where possible, so
   opening somebody is ONE request (their builds) rather than two. When the row
   is not in hand -- arriving from an author line in the feed -- it is fetched. */
            function openPerson(uid) {
                var p = profileByUid(uid);
                PUSER = uid;
                BMODE = 'user';
                /* the search box belongs to the directory; a profile page is not a search */
                var sb = document.getElementById('bsearch');
                if (sb)
                    sb.hidden = true;
                var on = ['bmine', 'bpublic', 'bfollow', 'bpeople'], k;
                for (k = 0; k < on.length; k++) {
                    var el = document.getElementById(on[k]);
                    if (el)
                        el.className = '';
                }
                if (p)
                    return paintPerson(p);
                SB.from('public_profiles').select('*').eq('user_id', uid).maybeSingle().then(function(r) {
                    if (r.error || !r.data) {
                        document.getElementById('bbody').innerHTML = '<p class="bempty">That profile is not available.</p>';
                        return;
                    }
                    PROWS.push(r.data);
                    paintPerson(r.data);
                });
            }

            function paintPerson(p) {
                var body = document.getElementById('bbody');
                document.getElementById('btitle').textContent = '@' + (p.handle || 'someone');

                var card = '<div class="pcard">' + avatarHtml(p.avatar_cfg, p.handle || '?', 46) + '<h3>@' + aesc(p.handle) + creditBadge(p.credit) + platBadge(p.platform, p.gamertag) + styleBadges(p.play_styles) + '</h3>' + followBtn(p.user_id) + (p.bio ? '<p class="pbio">' + aesc(p.bio) + '</p>' : '') + '<span class="pcount"><b>' + p.build_count + '</b> public &middot; <b>' + p.follower_count + '</b> followers &middot; <b>' + p.following_count + '</b> following &nbsp; <button type="button" class="pback" data-act="people">' + '&larr; everyone</button></span>' + '</div><p class="bempty">Loading builds&hellip;</p>';
                body.innerHTML = card;

                SB.from('public_builds').select('*').eq('author_id', p.user_id).order('like_count', {
                    ascending: false
                }).order('created_at', {
                    ascending: false
                }).limit(100).then(function(r) {
                    /* The card must survive a failed build fetch -- the Follow button on it
         is the thing the user came for and it works regardless. */
                    var tail;
                    if (r.error)
                        tail = '<p class="bempty">Could not load their builds: ' + aesc(r.error.message) + '</p>';
                    else {
                        BROWS = r.data || [];
                        if (!BROWS.length)
                            tail = '<p class="bempty">@' + aesc(p.handle) + ' has not shared a build yet.</p>';
                        else {
                            paintBuilds();
                            return body.insertAdjacentHTML('afterbegin', card);
                        }
                    }
                    body.innerHTML = card.replace('<p class="bempty">Loading builds&hellip;</p>', tail);
                    bfoot('');
                });
            }

            /* ── following / unfollowing ─────────────────────────────────────────────
   Optimistic: the button flips first and reverts if the write is refused.
   A follow is a two-column insert and an unfollow is a delete of your OWN row
   -- both are exactly what the RLS policies allow, so a refusal here means
   signed out or offline, not a permissions bug to paper over. */
            function toggleFollow(uid, btn) {
                if (!ME) {
                    if (typeof openAuthModal === 'function')
                        openAuthModal('in');
                    return;
                }
                if (!uid || uid === ME.id || PBUSY)
                    return;
                PBUSY = true;

                var was = iFollow(uid);
                if (PFOLL) {
                    if (was)
                        delete PFOLL[uid];
                    else
                        PFOLL[uid] = 1;
                }
                if (btn) {
                    btn.className = 'pfol' + (was ? '' : ' on');
                    btn.textContent = was ? 'Follow' : 'Following';
                }

                var q = was ? SB.from('follows').delete().eq('follower_id', ME.id).eq('followee_id', uid) : SB.from('follows').insert({
                    follower_id: ME.id,
                    followee_id: uid
                });

                q.then(function(r) {
                    PBUSY = false;
                    if (!r.error)
                        return;
                    if (PFOLL) {
                        if (was)
                            PFOLL[uid] = 1;
                        else
                            delete PFOLL[uid];
                    }
                    if (btn) {
                        btn.className = 'pfol' + (was ? ' on' : '');
                        btn.textContent = was ? 'Following' : 'Follow';
                    }
                    /* authMsg is the web modules' one notice surface -- there is no toast here,
       and a silent revert would look like the click never registered. */
                    if (typeof authMsg === 'function')
                        authMsg('Could not save that follow: ' + r.error.message, true);
                });
            }

            /* ── the Following feed ──────────────────────────────────────────────────
   The community feed narrowed to people you follow. Empty is the NORMAL first
   state, so it says what to do about it instead of reading as an error. */
            function loadFollowFeed() {
                var body = document.getElementById('bbody');
                if (!ME) {
                    body.innerHTML = '<p class="bempty">Sign in to follow people.</p>';
                    bfoot('');
                    return;
                }
                body.innerHTML = '<p class="bempty">Loading&hellip;</p>';

                Promise.resolve(PFOLL === null ? loadFollowing() : null).then(function() {
                    var ids = Object.keys(PFOLL || {});
                    if (!ids.length) {
                        body.innerHTML = '<p class="bempty">You are not following anyone yet. ' + 'Open <b>People</b> and follow a few &mdash; their builds land here.</p>';
                        bfoot('');
                        return null;
                    }
                    return SB.from('public_builds').select('*').in('author_id', ids).order('created_at', {
                        ascending: false
                    }).limit(100);
                }).then(function(r) {
                    if (!r)
                        return;
                    if (r.error) {
                        body.innerHTML = '<p class="bempty">Could not load that feed: ' + aesc(r.error.message) + '</p>';
                        return;
                    }
                    BROWS = r.data || [];
                    if (!BROWS.length) {
                        body.innerHTML = '<p class="bempty">Nobody you follow has shared a build yet.</p>';
                        bfoot('');
                        return;
                    }
                    paintBuilds();
                });
            }

            /* ── TIERS, GATES AND PRICING ─────────────────────────────────────────
   Web build only. Joined into the same module as web_auth.js, so ME and
   MYPROFILE are shared directly.

   FREE EDITION. The original web build used client-side tier gates here.
   Those gates are deliberately disabled in this edition: all client-side
   builder data, solvers, planners, thresholds and catalogues are available
   without a paid tier. Backend rules (for example saved-build limits) remain
   authoritative until their server/schema configuration is changed.

   What is actually enforced lives elsewhere and is enforced properly:
     saved builds   a database trigger, in schema_builds.sql
     server solves  the Render API reads the tier with the service role
   So the honest pitch is convenience and support, not secrecy, and the page
   never pretends otherwise.

   The gates work by CAPTURE-PHASE interception rather than by editing the
   page: the builder is one IIFE and its handlers are unreachable from a
   module, so this listens first, decides, and stops the event before the
   page's own handler ever sees it. That also means adding a gate never risks
   breaking the feature it guards. */

            var API_BASE = 'https://build-lab-api.onrender.com';
            var TIER_RANK = {
                free: 0,
                mid: 1,
                premium: 2
            };
            var FREE_SEARCHES = 5;

            /* FREE EDITION: tiers remain on profiles for backend compatibility and
   existing subscription management, but they no longer gate client-side
   builder features. */
            function myTier() {
                return 'premium';
            }
            function tierOk(need) {
                return true;
            }

            /* ── the daily finder allowance ──────────────────────────────────────────
   SIGNED IN: counted in the database (schema_finder_uses.sql), because
   localStorage does not survive the browsers people actually arrive in. Both
   halves of the old counter swallowed their exceptions, so wherever storage
   was blocked it read "0 used" forever and the limit never fired -- reported
   as "Build Limit resets every time I refresh (im on phone)". Links opened
   from Twitter and Discord run in those apps' in-app browsers, which routinely
   have ephemeral storage, and Twitter is the launch channel.

   SIGNED OUT: still localStorage, still soft. There is no id to attribute a
   count to, and putting a sign-in wall in front of the thing people came for
   costs more than it protects.

   SRV_USED is a cache of the server's number, refreshed when the session
   settles and after every counted search. The gate that reads it is a click
   handler and has to answer synchronously, so it reads the cache and the RPC
   reconciles behind it; the increment is applied optimistically so a fast
   double-click cannot buy a free extra search. */
            var SRV_USED = null;
            /* null = signed out, or not yet loaded */

            function searchKey() {
                var d = new Date();
                return 'gbl-find-' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
            }
            function lsUsed() {
                try {
                    return parseInt(localStorage.getItem(searchKey()) || '0', 10) || 0;
                } catch (e) {
                    return 0;
                }
            }
            function searchesUsed() {
                return 0;
            }
            function noteSearch() {
                /* FREE EDITION: finder searches are unlimited and are not counted. */
            }
            function loadSearchCount() {
                return Promise.resolve();
            }
            function searchesLeft() {
                return Infinity;
            }

            /* ── pricing ─────────────────────────────────────────────────────────── */
            var PLANINFO = null;

            var TIER_COPY = {
                mid: {
                    name: 'Mid',
                    blurb: 'Work without limits.',
                    items: ['Unlimited build searches', 'Badge token and Fuse planner', 'Optimize this build', '5 saved builds']
                },
                /* SELL ONLY WHAT SHIPS -- and check the SHIP, not the shelf label.
     "Compare builds side by side" was a genuine ghost and is gone.

     The two solvers are NOT: solveNames() and solveShades() in ui_solve.js do
     exactly what these bullets say. I cut them on a bad search -- looked for
     callers of the server endpoints /solve/name and /solve/shade, found none,
     and concluded the features were vapour. They are client-side, like every
     other computation in this product. Restored.

     Both halves of the lesson are worth keeping: do not sell what does not
     exist, and do not conclude something does not exist from one grep. */
                premium: {
                    name: 'Premium',
                    blurb: 'The part nobody else can compute.',
                    items: ['Everything in Mid', 'Full cap breaker audit — every position, height and attribute', 'The ranked view across all 918 frame-and-attribute cells', 'Name solver — click any build name, get a build that earns it', 'Shade solver — build toward any NBA player, up to three at once', 'Every threshold worth hitting on any attribute, and what it buys', 'Build for a specific animation, height band included', 'The full 2,494-animation list, searchable', 'Unlimited saved builds']
                }
            };

            /* "DID NOT ANSWER" IS NOT "SAID NO".
   This used to catch every fetch failure into { configured:false }, which the
   modal renders as "Subscriptions are not switched on yet." Render's free tier
   sleeps after ~15 minutes and takes about a minute to wake, so the first
   visitor after any quiet gap was told the product does not take payments --
   and because the failure was cached in PLANINFO, it stayed wrong for the rest
   of their session even once the server was up. On a launch day of bursty
   traffic that is most of the early arrivals.

   So: a transport failure sets PLANWAKING and is NOT cached, a real answer is.
   The modal can then say "waking up" and retry instead of lying. */
            var PLANWAKING = false;

            function loadPlans() {
                if (PLANINFO)
                    return Promise.resolve(PLANINFO);
                /* A cold Render instance can take ~50s. Give it room, but bound it so the UI
     is never stuck with no explanation. */
                var ctl = (typeof AbortController === 'function') ? new AbortController() : null;
                var timer = setTimeout(function() {
                    if (ctl)
                        ctl.abort();
                }, 70000);
                return fetch(API_BASE + '/billing/plans', ctl ? {
                    signal: ctl.signal
                } : undefined).then(function(r) {
                    if (!r.ok)
                        throw new Error('http ' + r.status);
                    return r.json();
                }).then(function(j) {
                    clearTimeout(timer);
                    PLANWAKING = false;
                    PLANINFO = j;
                    /* cache ONLY a real answer */
                    return j;
                }).catch(function() {
                    clearTimeout(timer);
                    PLANWAKING = true;
                    /* deliberately NOT cached in PLANINFO */
                    return null;
                });
            }

            function priceRow(plan, label, price, note) {
                if (!PLANINFO || !PLANINFO.plans || !PLANINFO.plans[plan])
                    return '';
                return '<button type="button" class="buy" data-plan="' + plan + '">' + '<span class="bl">' + aesc(label) + '</span>' + '<span class="bp">' + aesc(price) + '</span>' + (note ? '<span class="bn">' + aesc(note) + '</span>' : '') + '</button>';
            }

            /* RENDER FIRST, PRICE SECOND.
   The first version awaited loadPlans() before showing anything, and Render's
   free tier sleeps -- so clicking Plans did nothing at all for up to a minute
   while a cold server woke up. The plans list only decides which BUY buttons
   exist; everything that explains the product is local. So paint immediately
   and fill the buttons in when (or if) the API answers. */
            function openPricing(reason) {
                buildsStyle();
                authStyle();
                tierStyle();
                paintPricing(reason);
                loadPlans().then(function(got) {
                    paintPricing(reason);
                    /* Cold instance: it is awake NOW because we just woke it, so one retry
       lands. Without this the visitor has to close and reopen the modal to
       see prices that were never actually unavailable. */
                    if (!got && PLANWAKING)
                        setTimeout(function() {
                            loadPlans().then(function() {
                                paintPricing(reason);
                            });
                        }, 3000);
                });
            }

            function paintPricing(reason) {
                var mine = myTier();
                var body = '';
                if (reason)
                    body += '<p class="gwhy">' + aesc(reason) + '</p>';
                /* Three different states, and they used to collapse into the worst one.
     PLANINFO set + configured false  the server really says no -> say so
     PLANWAKING                        it did not answer -> say THAT, and retry
     neither                           still in flight -> the per-tier spinner */
                if (PLANINFO && !PLANINFO.configured)
                    body += '<p class="gsoon">Subscriptions are not switched on yet. ' + 'Everything free stays free either way.</p>';
                else if (!PLANINFO && PLANWAKING)
                    body += '<p class="gsoon">Waking the server up — prices in a few ' + 'seconds. (It sleeps when nobody is using it.)</p>';
                ['mid', 'premium'].forEach(function(t) {
                    var c = TIER_COPY[t]
                      , have = TIER_RANK[mine] >= TIER_RANK[t];
                    body += '<div class="plan' + (have ? ' have' : '') + '">' + '<div class="ph"><b>' + aesc(c.name) + '</b>' + (have ? '<span class="tier ' + t + '">current</span>' : '') + '</div>' + '<p class="pb">' + aesc(c.blurb) + '</p>' + '<ul class="pl">' + c.items.map(function(i) {
                        return '<li>' + aesc(i) + '</li>';
                    }).join('') + '</ul>';
                    if (!have) {
                        if (!PLANINFO)
                            body += '<p class="gsoon">Checking prices…</p>';
                        else if (PLANINFO.configured)
                            body += '<div class="buys">' + priceRow(t === 'mid' ? 'mid_month' : 'premium_month', 'Monthly', t === 'mid' ? '$4.99' : '$9.99', '') /* The saving is NOT the same on both tiers, and the old copy said
             "save 50%" on each. Mid is 29.99 against 12 x 4.99 = 59.88, so 50%
             is right. Premium is 49.99 against 12 x 9.99 = 119.88, which is
             58% -- the page was UNDERSELLING it. Quote each one truthfully. */
                            + priceRow(t === 'mid' ? 'mid_year' : 'premium_year', 'Yearly', t === 'mid' ? '$29.99' : '$49.99', t === 'mid' ? 'save 50%' : 'save 58%') + '</div>';
                    }
                    body += '</div>';
                });
                if (ME && TIER_RANK[mine] > 0)
                    body += '<div class="arow"><button type="button" id="g_portal">' + 'Manage subscription</button></div>';
                if (!ME)
                    body += '<p class="gsoon">You will need an account to subscribe.</p>';
                body += '<p class="amsg" id="amsg"></p>' + '<p class="gfine">Everything in the builder — ceilings, cap breaker ' + 'ladders, badges, the 99 wall — is free and stays free. Paid tiers buy ' + 'the search and the solvers, not the numbers.</p>';
                amodal('Plans', body);
            }

            function startCheckout(plan) {
                if (!ME)
                    return amsg('Sign in first, then pick a plan.', true);
                amsg('Opening checkout...');
                SB.auth.getSession().then(function(r) {
                    var tok = r && r.data && r.data.session && r.data.session.access_token;
                    if (!tok)
                        return amsg('Session expired. Sign in again.', true);
                    return fetch(API_BASE + '/billing/checkout', {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                            authorization: 'Bearer ' + tok
                        },
                        body: JSON.stringify({
                            plan: plan
                        })
                    }).then(function(res) {
                        return res.json().then(function(j) {
                            return {
                                s: res.status,
                                j: j
                            };
                        });
                    }).then(function(o) {
                        if (o.j && o.j.url) {
                            /* The server sends an existing subscriber to the billing portal
             rather than a second checkout, so say so before the redirect --
             landing on a page you did not ask for reads as a bug, even when it
             is the right page. */
                            if (o.j.switching)
                                amsg('You already have a plan — opening your billing page, where ' + 'switching is prorated. You only pay the difference.', false);
                            location.href = o.j.url;
                            return;
                        }
                        /* Render free spins down, so the first call after idle can simply time
           out. Say that rather than "something went wrong". */
                        amsg((o.j && o.j.error) || 'Could not reach billing. The server may be ' + 'waking up — try once more in a few seconds.', true);
                    });
                }).catch(function() {
                    amsg('Could not reach billing. Try again in a moment.', true);
                });
            }

            function openPortal() {
                amsg('Opening...');
                SB.auth.getSession().then(function(r) {
                    var tok = r && r.data && r.data.session && r.data.session.access_token;
                    return fetch(API_BASE + '/billing/portal', {
                        method: 'POST',
                        headers: {
                            authorization: 'Bearer ' + tok
                        }
                    }).then(function(res) {
                        return res.json();
                    }).then(function(j) {
                        if (j && j.url)
                            location.href = j.url;
                        else
                            amsg((j && j.error) || 'Could not open the portal.', true);
                    });
                }).catch(function() {
                    amsg('Could not open the portal.', true);
                });
            }

            /* ── the gates ───────────────────────────────────────────────────────── */
            /* selector -> what it needs and why. Kept as data so the list is readable and
   a gate is never buried in a handler. */
            var GATES = [{
                sel: 'section.plan',
                need: 'mid',
                why: 'The badge token and Fuse planner is part of Mid.'
            }, {
                sel: '#optimize',
                need: 'mid',
                why: 'Optimize this build is part of Mid.'
            }, /* THESE TWO ARE REAL SOLVERS AND THE GATES BELONG HERE.
     I removed them once on the false premise that nothing was behind them,
     having grepped for the SERVER endpoints (/solve/name, /solve/shade) and
     found no caller. The solvers are CLIENT-side -- solveNames() and
     solveShades() in ui_solve.js -- which is how the whole product is built,
     and is the first place I should have looked. Clicking a name searches
     frames, returns builds that earn it, loads the best and offers the rest.

     Compare-builds really was a ghost and stays cut. These are not. */
            {
                sel: '#nmList .nm-row',
                need: 'premium',
                why: 'Building a chosen archetype name is a Premium solver.'
            }, {
                sel: '#shSetGo',
                need: 'premium',
                why: 'Building toward an NBA player is a Premium solver.'
            }, /* Picking tiers and reading what each one asks for is free; turning a set
     of badges into a build is the solver, and solvers are Premium. Gating
     the list instead would hide the badge table itself, which the rail has
     shown to everyone since launch. */
            {
                sel: '#bpGo',
                need: 'premium',
                why: 'Building for a set of badges is a Premium solver.'
            }, /* THE TAB IS PREMIUM, THE BOX UNDER THE BOARD IS FREE -- and the split is
     deliberate, not a paywall drawn at random. The box answers the question
     you have while dragging a slider (what do I have, what is two points
     away) and everyone gets it; the tab is the searchable 2,494-row
     catalogue, which is the part worth paying for. Gating the box instead
     would make the sliders less informative for free users, which is the
     wrong thing to sell. */
            /* Every route INTO the tab, not just the tab button: the box's category
     tiles and its "See all" link call showTab('anims') from inside the page's
     own IIFE, which `guard` (a capture-phase document listener) can stop only
     if the element it fires on is named here. Gating the button alone would
     leave two doors open. */
            /* The strip renders locked on its own (it reads the tier off the document),
     so this gate is only what makes the locked chip DO something -- the page's
     own IIFE cannot reach openPricing. */
            /* Building FOR a named animation is the same solver as the threshold
     strip, so it carries the same price -- including from the free box under
     the attributes, where the button is otherwise reachable. */
            {
                sel: '.an-go',
                need: 'premium',
                why: 'Building toward a specific animation is Premium. Seeing what you ' + 'have and what is closest stays free.'
            }, {
                sel: '.thchip.lock',
                need: 'premium',
                why: 'Finding the numbers worth hitting on an attribute is Premium. ' + 'Typing a number you already know stays free.'
            }, /* `#animBox [data-c]` USED TO BE IN HERE AND WAS A REAL BUG. When a category
     click jumped to the Animations tab, gating it was right. It now expands
     IN PLACE inside the box -- which is the free surface, and the behaviour
     that was explicitly asked for -- so the gate was paywalling the free
     feature. Only the two routes into the TAB are gated: its button, and the
     box's "See all" link.

     Worth remembering: a gate is written against a BEHAVIOUR, and it does not
     follow the behaviour when that changes. Re-read the gates whenever a
     gated control learns to do something else. */
            {
                sel: '#tabs button[data-t="anims"], #animBox [data-t]',
                need: 'premium',
                why: 'The full animation list is Premium. The box under the attributes ' + 'is free -- it shows what this build unlocks and what is closest.'
            }];

            function gateFor(el) {
                for (var i = 0; i < GATES.length; i++) {
                    if (el.closest && el.closest(GATES[i].sel))
                        return GATES[i];
                }
                return null;
            }

            function guard(e) {
                /* never block inside our own modals */
                if (e.target.closest && (e.target.closest('.bov') || e.target.closest('#authbar')))
                    return;

                var g = gateFor(e.target);
                if (g && !tierOk(g.need)) {
                    e.preventDefault();
                    e.stopPropagation();
                    openPricing(g.why);
                    return;
                }

                /* the finder meter: allowed, but counted */
                if (e.target.closest && e.target.closest('#goTick')) {
                    if (!tierOk('mid')) {
                        if (searchesLeft() <= 0) {
                            e.preventDefault();
                            e.stopPropagation();
                            openPricing('You have used today’s ' + FREE_SEARCHES + ' free searches. Mid removes the limit.');
                            return;
                        }
                        noteSearch();
                        setTimeout(paintMeter, 50);
                    }
                }
            }

            /* THE CAP BREAKER AUDIT: premium sees every frame, everyone else sees the
   BEST THREE of whatever they pick.

   The first cut locked the whole tab to one attribute, and it read as
   arbitrary -- the honest reaction to a view pinned to Driving Dunk is "why
   Driving Dunk?", which makes the gate look random rather than principled.
   Letting anyone choose the attribute and cutting the LIST is the same amount
   of withholding without the confusion: the rows shown are real, the reason
   the rest are missing is obvious, and nobody has to wonder why the page
   picked that attribute for them.

   Re-applied through a MutationObserver rather than at open, because the page
   repaints this list on every attribute, position and breaker-count change and
   those handlers live inside the builder's IIFE where this file cannot reach
   them. The observer is the seam that needs no cooperation from the page. */
            var FREE_PARK_ROWS = 3;

            function trimParks() {
                if (tierOk('premium'))
                    return;
                var list = document.getElementById('pkList');
                if (!list)
                    return;
                var rows = list.querySelectorAll('.pk-row');
                /* <= the cap means this is already trimmed -- the guard that stops the
     observer re-entering on its own edits */
                if (rows.length <= FREE_PARK_ROWS)
                    return;
                var hidden = rows.length - FREE_PARK_ROWS, i;
                for (i = FREE_PARK_ROWS; i < rows.length; i++)
                    rows[i].remove();
                var note = document.createElement('p');
                note.className = 'pkgate';
                note.innerHTML = '<b>' + hidden + ' more frame' + (hidden === 1 ? '' : 's') + '</b> for this attribute, and the ranked view across all 918 cells, ' + 'with Premium. ' + '<button type="button" id="g_parks" class="alink">See Premium</button>';
                list.appendChild(note);
            }

            function gateParks() {
                var list = document.getElementById('pkList');
                if (!list || tierOk('premium'))
                    return;
                trimParks();
                if (list.dataset.watched)
                    return;
                list.dataset.watched = '1';
                try {
                    new MutationObserver(function() {
                        trimParks();
                    }
                    ).observe(list, {
                        childList: true
                    });
                } catch (e) {/* no observer: the one-shot trim above still applies */
                }
            }

            function paintMeter() {
                /* FREE EDITION: no daily finder allowance or upsell meter. */
                var el = document.getElementById('findmeter');
                if (el)
                    el.remove();
            }

            function tierStyle() {
                if (document.getElementById('tiercss'))
                    return;
                var s = document.createElement('style');
                s.id = 'tiercss';
                s.textContent = '.amodal .plan{border:1px solid var(--line);border-radius:6px;padding:12px 14px;' + 'margin:0 0 12px;background:var(--sunk)}' + '.amodal .plan.have{border-color:var(--cyan)}' + '.ph{display:flex;align-items:center;gap:8px}' + '.ph b{font-size:15px;font-family:"Chakra Petch",sans-serif}' + '.pb{margin:2px 0 8px;font-size:12px;color:var(--ink-2)}' + '.pl{margin:0;padding:0 0 0 16px;font-size:12px;color:var(--ink-2);line-height:1.7}' + '.buys{display:flex;gap:8px;margin:11px 0 0}' + '.buy{flex:1;display:flex;flex-direction:column;gap:1px;cursor:pointer;' + 'padding:8px 10px;border-radius:4px;border:1px solid var(--line);' + 'background:var(--raise);color:var(--ink);font:inherit;text-align:left}' + '.buy:hover{border-color:var(--cyan)}' + '.buy .bl{font-size:11px;color:var(--ink-3);text-transform:uppercase;' + 'letter-spacing:.05em}' + '.buy .bp{font-size:16px;font-weight:700;font-family:"Chakra Petch",sans-serif}' + '.buy .bn{font-size:10px;color:var(--amber);font-family:"IBM Plex Mono",monospace}' + '.gwhy{margin:0 0 12px;padding:9px 11px;border-radius:4px;font-size:12px;' + 'background:color-mix(in srgb,var(--amber) 13%,transparent);color:var(--ink)}' + '.gsoon{margin:0 0 12px;font-size:12px;color:var(--ink-3)}' + '.gfine{margin:12px 0 0;font-size:11px;color:var(--ink-3);line-height:1.6}' + '.fmeter{font-size:11px;color:var(--ink-3);margin-right:10px}' + '.pkgate{margin:0;padding:10px 15px;font-size:12px;color:var(--ink-2);' + 'background:color-mix(in srgb,var(--amber) 10%,transparent);' + 'border-bottom:1px solid var(--line-2)}';
                document.head.appendChild(s);
            }

            (function() {
                tierStyle();
                /* capture phase, so this runs BEFORE the page's own delegated handlers and
     can stop the event reaching them */
                document.addEventListener('click', guard, true);

                document.addEventListener('click', function(e) {
                    /* CLOSEST, NOT e.target. The buy button wraps three spans -- label, price,
       "save 50%" -- so a click almost anywhere on it reports the SPAN as the
       target, and a span carries no data-plan. Reading e.target directly meant
       the buttons did nothing at all unless you happened to hit the 1px of
       padding around the text. */
                    var t = e.target
                      , hit = t.closest ? t.closest('[data-plan]') : null;
                    if (hit)
                        return startCheckout(hit.dataset.plan);
                    var btn = t.closest ? t.closest('button, .alink') : null;
                    var id = (btn && btn.id) || t.id;
                    if (id === 'g_more' || id === 'g_parks')
                        openPricing('');
                    else if (id === 'g_portal')
                        openPortal();
                    /* re-gate the parks tab whenever it is opened */
                    if (e.target.closest && e.target.closest('#tabs button[data-t="parks"]'))
                        setTimeout(gateParks, 60);
                });

                /* Coming back from Stripe: the webhook may land a moment after the redirect,
     so refresh the profile shortly after rather than showing a stale tier. */
                if (/[?&]billing=ok/.test(location.search)) {
                    setTimeout(function() {
                        if (typeof loadProfile === 'function')
                            loadProfile().then(function() {
                                paintAuth();
                                paintMeter();
                            });
                    }, 2500);
                    try {
                        history.replaceState(null, '', location.origin + location.pathname);
                    } catch (e) {}
                }
            }
            )();

            /* called from web_auth once the session settles */
            function onTierReady() {
                /* PUBLISH THE TIER TO THE PAGE. The builder is one IIFE and this is an ES
     module, so neither can call into the other -- the document is the only
     seam. The threshold strip reads this attribute, and the event tells it to
     repaint: it paints at load, long before a module has run, so its first
     render is always the signed-out one until this fires. */
                try {
                    document.documentElement.dataset.tier = 'premium';
                    document.dispatchEvent(new CustomEvent('gbl:tier'));
                } catch (e) {}
                paintMeter();
                gateParks();
                /* Re-read the allowance from the server on every session settle -- which
     includes a plain refresh. That is the whole point: clearing storage, or
     arriving in a browser that never kept any, no longer resets the count. */
                loadSearchCount();
            }

            /* ── LEGAL LINKS, AND A CANCEL PATH PEOPLE CAN FIND ───────────────────
   Web build only, and that is the whole reason this file exists: /privacy and
   /terms are pages on the SITE. The artifact has no such URLs, so putting these
   links in the shared shell would ship the artifact two dead links. The
   affiliation notice IS in the shared footer, because it is true of both.

   Stripe's activation form asks for a privacy policy URL and a terms URL, and
   a modal has no URL to give it. So these are real pages at real addresses
   rather than another amodal(). */

            function legalLinks() {
                var host = document.getElementById('legalLinks');
                if (!host || host.dataset.done)
                    return;
                host.dataset.done = '1';
                host.innerHTML = '<a href="/privacy">Privacy Policy</a> &middot; ' + '<a href="/terms">Terms of Service</a> &middot; ' + '<a href="mailto:GoatedGames@Yahoo.com">Contact</a>';
            }

            /* ── CANCELLING MUST BE AS EASY AS SUBSCRIBING ────────────────────────
   Stripe hosts the cancellation itself -- openPortal() opens the billing
   portal and the subscription.updated / .deleted webhooks write the tier back,
   so none of that flow is ours to get wrong.

   What WAS wrong is finding it. "Manage subscription" rendered only inside the
   Plans modal, and only for a subscriber -- so the way to cancel was to press
   a button labelled "Plans", which reads like the way to BUY. A cancel path
   buried behind an upsell is how you earn chargebacks, and in the US the FTC's
   negative-option rule expects cancelling to be about as easy as signing up.

   So it also goes in the account panel, which is where someone looks for it,
   and it is not rendered at all for a free account (there is nothing to
   manage). openPortal() lives in web_tiers.js -- same module scope. */
            function billingRow() {
                if (!ME || typeof myTier !== 'function' || myTier() === 'free')
                    return '';
                return '<div class="arow"><button type="button" id="g_portal">' + 'Manage subscription</button>' + '<span class="gfine">Cancel or change plan. Opens Stripe. ' + 'Access runs to the end of the period you have paid for.</span></div>';
            }

            /* ── REPORTING ────────────────────────────────────────────────────────
   Section 3 of the terms forbids hate speech, harassment and the rest. A rule
   nobody can report against is decoration, so this is the other half.

   Scope: the COMMUNITY list only. Reporting is for other people's public
   content -- offering it on your own builds would be noise.

   One modal handles both targets, because the thing that is actually wrong is
   often the author rather than the build: a clean build can sit under a handle
   or a bio that breaks the rules, and a reporter who can only flag the build
   has no way to say so. */
            var REPORT = null;
            /* { kind, id, name, author } */

            var RSN = [['hate', 'Hate speech or slurs'], ['harassment', 'Harassment or threats'], ['sexual', 'Sexual content involving minors'], ['spam', 'Spam, advertising or a scam'], ['impersonation', 'Impersonation'], ['other', 'Something else']];

            function openReport(id, name, author, authorId) {
                if (!ME)
                    return authMsg('Sign in to report something.', true);
                REPORT = {
                    kind: 'build',
                    id: id,
                    name: name,
                    author: author,
                    authorId: authorId || null
                };
                var opts = RSN.map(function(r, i) {
                    return '<label class="rrow"><input type="radio" name="r_reason" value="' + r[0] + '"' + (i === 0 ? ' checked' : '') + '><span>' + aesc(r[1]) + '</span></label>';
                }).join('');

                amodal('Report content', '<p class="pb">Reported to the site operator. Reports are private ' + '&mdash; the person you are reporting is not told who reported them.</p>' + '<div class="rtarget">' + '<label class="rrow"><input type="radio" name="r_kind" value="build" checked>' + '<span>This build &mdash; <b>' + aesc(name || 'untitled') + '</b></span></label>' + (author ? '<label class="rrow"><input type="radio" name="r_kind" value="profile">' + '<span>This user &mdash; <b>@' + aesc(author) + '</b> ' + '(their name, bio or gamertag)</span></label>' : '') + '</div>' + '<p class="rlbl">What is wrong?</p>' + '<div class="rreasons">' + opts + '</div>' + '<label class="afield"><span>Anything to add (optional)</span>' + '<textarea id="r_note" maxlength="500" ' + 'placeholder="Only if it is not obvious from the content itself."></textarea></label>' + '<div class="arow"><button type="button" id="r_send" class="pri">Send report</button>' + '<button type="button" id="r_cancel">Cancel</button></div>' + '<p class="amsg" id="amsg"></p>');
            }

            function sendReport() {
                if (!REPORT || !ME)
                    return;
                var kindEl = document.querySelector('input[name="r_kind"]:checked');
                var rsnEl = document.querySelector('input[name="r_reason"]:checked');
                var noteEl = document.getElementById('r_note');
                var kind = kindEl ? kindEl.value : 'build';

                /* A profile report must carry the AUTHOR's id, not the build's. Sending the
     build id under kind 'profile' would file a report that points at nothing
     and read as handled-but-empty later. */
                var targetId = (kind === 'profile') ? REPORT.authorId : REPORT.id;
                if (!targetId)
                    return amsg('Could not identify what to report. Try the build instead.', true);

                amsg('Sending...');
                SB.from('content_reports').insert({
                    reporter_id: ME.id,
                    target_kind: kind,
                    target_id: targetId,
                    reason: rsnEl ? rsnEl.value : 'other',
                    note: (noteEl && noteEl.value.trim()) || null
                }).then(function(r) {
                    if (r.error) {
                        /* The unique key is what stops the button being held down, so a repeat
         is an expected outcome, not a failure to apologise for. */
                        if (/duplicate|unique/i.test(r.error.message))
                            return amsg('You have already reported this. It is in the queue.', false);
                        return amsg(r.error.message, true);
                    }
                    amsg('Reported. Thank you — it will be looked at.', false);
                    setTimeout(function() {
                        if (typeof closeAmodal === 'function')
                            closeAmodal();
                    }, 1400);
                });
            }

            /* ── TESTER CREDIT BADGE ──────────────────────────────────────────────
   Awarded by the operator with credit_tester(); `credit` is not in the
   authenticated update grant, so nobody can hand themselves one. That is what
   makes it worth showing -- a self-assigned badge says nothing.

   Escaped regardless. It is operator-set today, but it is still a text column
   coming back from the database, and "trusted source" is exactly the reasoning
   that puts unescaped strings into innerHTML. */
            function creditBadge(label) {
                if (!label)
                    return '';
                return '<span class="crd" title="Credited by Goated Build Lab">' + aesc(label) + '</span>';
            }

            function reportStyle() {
                if (document.getElementById('repcss'))
                    return;
                var s = document.createElement('style');
                s.id = 'repcss';
                s.textContent = '.amodal .rrow{display:flex;gap:8px;align-items:flex-start;margin:0 0 7px;' + 'font-size:13px;color:var(--ink-2);cursor:pointer;line-height:1.45}' + '.amodal .rrow input{margin:3px 0 0;flex:0 0 auto}' + '.amodal .rrow b{color:var(--ink)}' + '.amodal .rtarget{border:1px solid var(--line);border-radius:5px;' + 'padding:10px 12px 4px;margin:0 0 14px;background:var(--sunk)}' + '.amodal .rlbl{margin:0 0 7px;font-size:11px;letter-spacing:.05em;' + 'text-transform:uppercase;color:var(--ink-3)}' + '.amodal .rreasons{margin:0 0 12px}' + '.brow .breport{opacity:.5;font-size:12px}' + '.brow:hover .breport,.brow .breport:focus-visible{opacity:1}' + '.brow .breport:hover{color:var(--rose);border-color:var(--rose)}' /* Scoped to .brow, like everything else here. Amber rather than the cyan
     accent so it reads as an award and not as another platform chip sitting
     next to it. */
                + '.brow .crd{font-family:"IBM Plex Mono",monospace;font-size:9.5px;' + 'text-transform:uppercase;letter-spacing:.06em;padding:1px 5px;' + 'border-radius:3px;margin-left:5px;white-space:nowrap;' + 'background:color-mix(in srgb,var(--amber) 20%,transparent);' + 'color:var(--amber);border:1px solid color-mix(in srgb,var(--amber) 35%,transparent)}';
                document.head.appendChild(s);
            }

            (function() {
                legalLinks();
                /* The footer exists at load, but the tabs module reshuffles sections after
     it, so re-assert once the page has settled. dataset.done makes it a no-op
     the second time. */
                setTimeout(legalLinks, 300);
                reportStyle();

                /* Only the MODAL's buttons need a document-level listener. The report button
     itself is dispatched by onBuildsClick in web_builds.js, which is bound to
     the builds panel and already has the row -- so there is no second handler
     racing it and nothing to stopPropagation. The modal is appended to <body>,
     outside that panel, hence this.

     closest('button') because a button with children reports the child as
     e.target -- the trap that made the Buy buttons dead on click. */
                document.addEventListener('click', function(e) {
                    var btn = e.target.closest && e.target.closest('button');
                    if (!btn)
                        return;
                    if (btn.id === 'r_send')
                        sendReport();
                    else if (btn.id === 'r_cancel' && typeof closeAmodal === 'function')
                        closeAmodal();
                });
            }
            )();

            /* ── RUNNING AS AN INSTALLED APP ──────────────────────────────────────────
   Web build only, for the same reason the manifest and the worker are: the
   artifact has no origin of its own to install from.

   Three jobs, and each fixes something the manifest alone gets wrong:

     1. the manifest's shortcuts point at ?tab=..., and nothing read that
     2. nobody discovers an installable site unless it says so
     3. offline the builder works and sign-in does not, which reads as broken
        unless the page says which is which

   Everything here goes through the DOM. `showTab` lives inside the builder's
   IIFE and this is an ES module, so the two cannot call each other -- the tab
   BUTTON is the seam, exactly as web_builds drives the builder through
   #codeIn. */

            /* ── 1. deep links ───────────────────────────────────────────────────────
   The manifest offers Badge builder / Animations / Community as long-press
   shortcuts. A shortcut that opens the plain builder is worse than no
   shortcut, because it looks like the app ignored the tap. */
            var TABMAP = {
                badges: 'badges',
                anims: 'anims',
                animations: 'anims',
                names: 'names',
                shades: 'shades',
                parks: 'parks',
                build: 'build',
                builder: 'build'
            };

            /* THE TARGET MAY NOT EXIST YET, and that is not a race worth losing.
   The tab strip is in the shipped markup, but the auth bar -- which owns the
   Community button -- is built by web_auth only after the Supabase client has
   loaded over the network. A deep link fired at DOMContentLoaded finds nothing
   and does nothing, which is precisely how ?tab=community shipped broken:
   silently, and only on the slower of the two paths. */
            function waitFor(sel, ms, fn) {
                var t0 = Date.now();
                (function tick() {
                    var el = document.querySelector(sel);
                    if (el)
                        return fn(el);
                    if (Date.now() - t0 > ms)
                        return;
                    /* give up quietly, never throw */
                    setTimeout(tick, 120);
                }
                )();
            }

            function openDeepLink() {
                var m = /[?&]tab=([a-z]+)/i.exec(location.search);
                if (!m)
                    return;
                var key = m[1].toLowerCase();

                /* `community` is not a tab -- it is the builds panel, opened by its own
     button in the auth bar. Worth special-casing rather than dropping, since
     it is one of the three shortcuts the manifest offers. */
                if (key === 'community')
                    return waitFor('#community', 8000, function(el) {
                        el.click();
                    });

                var want = TABMAP[key];
                if (!want)
                    return;
                /* A gated tab (Animations is Premium) will open the pricing modal instead,
     which is the same thing tapping the tab does. That is correct, not a
     failure: the shortcut behaves exactly as the tab it points at. */
                waitFor('#tabs button[data-t="' + want + '"]', 8000, function(el) {
                    el.click();
                });
            }

            /* ── 2. install ──────────────────────────────────────────────────────────
   Chrome and Edge fire beforeinstallprompt and let the page trigger the real
   installer. Safari fires nothing and has no API at all, so iOS gets written
   instructions instead -- Share, then Add to Home Screen. Anything else would
   be a button that does nothing on the platform where most of the traffic is. */
            var DEFERRED = null;

            function isStandalone() {
                return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
            }
            function isIOS() {
                return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
            }

            function appStyle() {
                if (document.getElementById('appcss'))
                    return;
                var s = document.createElement('style');
                s.id = 'appcss';
                s.textContent = '.appbar{position:fixed;left:0;right:0;bottom:0;z-index:60;display:flex;' + 'gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;' + 'padding:10px 14px calc(10px + env(safe-area-inset-bottom));' + 'background:var(--panel,#141a20);border-top:1px solid var(--line,#26313a);' + 'font-size:12.5px;color:var(--ink-2,#9fb0bd)}' + '.appbar button{font:inherit;font-size:12.5px;cursor:pointer;padding:7px 13px;' + 'border:1px solid var(--cyan,#00a8f8);background:var(--cyan,#00a8f8);' + 'color:#06202a;border-radius:4px;font-weight:600}' + '.appbar .x{background:none;border:1px solid var(--line,#26313a);' + 'color:var(--ink-3,#7b8b98);font-weight:400}' + '.appbar b{color:var(--ink,#e7edf2)}' /* OFFLINE. Sits at the top because it changes what the page can do, and a
     notice about capability that scrolls away is not a notice. */
                + '.offbar{position:fixed;left:0;right:0;top:0;z-index:61;' + 'padding:calc(6px + env(safe-area-inset-top)) 14px 6px;text-align:center;' + 'background:#7a4a12;color:#ffe9c9;font-size:12.5px}' + '.offbar b{color:#fff}';
                document.head.appendChild(s);
            }

            function dismissed() {
                try {
                    return localStorage.getItem('gbl-installed-no') === '1';
                } catch (e) {
                    return false;
                }
            }
            function dismiss() {
                try {
                    localStorage.setItem('gbl-installed-no', '1');
                } catch (e) {}
            }

            function showInstallBar() {
                if (document.getElementById('appbar'))
                    return;
                appStyle();
                var el = document.createElement('div');
                el.id = 'appbar';
                el.className = 'appbar';
                el.innerHTML = DEFERRED ? '<span>Install <b>Build Lab</b> &mdash; it works offline.</span>' + '<button type="button" id="appGo">Install</button>' + '<button type="button" class="x" id="appNo">Not now</button>' : '<span>Add <b>Build Lab</b> to your home screen: tap Share, then ' + '<b>Add to Home Screen</b>.</span>' + '<button type="button" class="x" id="appNo">Got it</button>';
                document.body.appendChild(el);

                var go = document.getElementById('appGo');
                if (go)
                    go.addEventListener('click', function() {
                        var p = DEFERRED;
                        DEFERRED = null;
                        el.remove();
                        if (!p)
                            return;
                        p.prompt();
                        /* userChoice settles once; a declined install should not be re-offered on
       the next page view, which is what makes this a prompt rather than nagging. */
                        p.userChoice.then(function(r) {
                            if (r && r.outcome !== 'accepted')
                                dismiss();
                        }).catch(function() {});
                    });
                var no = document.getElementById('appNo');
                if (no)
                    no.addEventListener('click', function() {
                        dismiss();
                        el.remove();
                    });
            }

            /* ── 3. offline ──────────────────────────────────────────────────────────
   The honest message, because the two halves genuinely differ: every table is
   in the page so the builder is complete offline, while sign-in, saved builds
   and the community feed need the network. */
            function paintOffline() {
                var have = document.getElementById('offbar');
                if (navigator.onLine) {
                    if (have)
                        have.remove();
                    return;
                }
                if (have)
                    return;
                appStyle();
                var el = document.createElement('div');
                el.id = 'offbar';
                el.className = 'offbar';
                el.innerHTML = '<b>Offline.</b> The builder, badges, animations and shades ' + 'all still work. Sign-in and the community feed need a connection.';
                document.body.appendChild(el);
            }

            /* ── 4. the back button ──────────────────────────────────────────────────
   Installed, there is no browser chrome: Android's back gesture is the only
   back there is, and with no history to pop it CLOSES THE APP. So opening the
   Badge builder and pressing back quits, and dismissing a dialog quits. Both
   read as a crash.

   The fix is a shadow stack. Each thing that can be "backed out of" pushes a
   history entry with the URL UNCHANGED -- `?b=` shared builds and `?billing=ok`
   are read from the query string by other modules, and churning it to express
   navigation would break them.

   Closing goes through the DOM seam, not through the modules: both overlays
   already close on Escape, so dispatching Escape reuses the shipped close path
   instead of reaching into two IIFEs that cannot be called from here. */
            var NAV = []
              , UNWIND = false
              , MODALWAS = false
              , RESTORING = false;

            function navPush(kind, data) {
                NAV.push({
                    kind: kind,
                    data: data
                });
                try {
                    history.pushState({
                        gbl: NAV.length
                    }, '', location.href);
                } catch (e) {}
            }

            function escape_() {
                document.dispatchEvent(new KeyboardEvent('keydown',{
                    key: 'Escape',
                    bubbles: true
                }));
            }

            function modalOpen() {
                var n = document.querySelectorAll('.bov');
                for (var i = 0; i < n.length; i++)
                    if (n[i].style.display && n[i].style.display !== 'none')
                        return true;
                return false;
            }

            window.addEventListener('popstate', function() {
                if (UNWIND) {
                    UNWIND = false;
                    return;
                }
                /* our own unwind, not a user press */
                var top = NAV.pop();
                if (!top)
                    return;
                /* not ours -- let the browser act */
                if (top.kind === 'modal') {
                    if (modalOpen())
                        escape_();
                    return;
                }
                if (top.kind === 'tab') {
                    var b = document.querySelector('#tabs button[data-t="' + top.data + '"]');
                    if (b && !b.classList.contains('on')) {
                        /* RESTORING BREAKS A FEEDBACK LOOP. Going back clicks the previous tab's
         button, the capture listener sees that click like any other and pushes
         a fresh entry recording where it came from -- so back oscillated
         between two tabs forever instead of walking out. Measured: shades ->
         badges -> shades. The flag clears on a timer registered AFTER the
         click, so it lands after the listener's own deferred check. */
                        RESTORING = true;
                        b.click();
                        setTimeout(function() {
                            RESTORING = false;
                        }, 0);
                    }
                }
            });

            function historyInit() {
                /* A tab press records where it came FROM. Nothing is pushed when leaving the
     Builder is not involved -- on the home tab, back should exit, which is what
     Android users expect and what a pushed state would wrongly prevent. */
                /* CAPTURE PHASE, and that is load-bearing. Bound on the bubble like everything
     else this module does, the handler runs AFTER the page has already switched
     tabs, so "where we came from" reads as the tab we just arrived at, the
     comparison below always matches, and nothing is ever pushed. Back then left
     the site entirely. Capture reads the state before the page changes it. */
                document.addEventListener('click', function(e) {
                    var b = e.target.closest ? e.target.closest('#tabs button[data-t]') : null;
                    if (!b)
                        return;
                    var from = document.querySelector('#tabs button.on');
                    var fromT = from && from.dataset.t;
                    /* read AFTER the page's own handler has run, so a gated tab that never
       switched does not leave a bogus entry on the stack */
                    setTimeout(function() {
                        if (RESTORING)
                            return;
                        /* this click IS the back button */
                        var now = document.querySelector('#tabs button.on');
                        if (!now || !fromT || now.dataset.t === fromT)
                            return;
                        navPush('tab', fromT);
                    }, 0);
                }, true);

                /* Modals are opened from several places and none of them is reachable from
     this module, so watch the overlay itself. */
                if (window.MutationObserver) {
                    var mo = new MutationObserver(function() {
                        var open = modalOpen();
                        if (open && !MODALWAS) {
                            MODALWAS = true;
                            navPush('modal');
                            return;
                        }
                        if (!open && MODALWAS) {
                            MODALWAS = false;
                            /* Closed by its own X or by Escape. Drop our entry and unwind the
           history state we pushed, or it would silently eat the next back. */
                            if (NAV.length && NAV[NAV.length - 1].kind === 'modal') {
                                NAV.pop();
                                UNWIND = true;
                                try {
                                    history.back();
                                } catch (e) {
                                    UNWIND = false;
                                }
                            }
                        }
                    }
                    );
                    mo.observe(document.body, {
                        subtree: true,
                        childList: true,
                        attributes: true,
                        attributeFilter: ['style']
                    });
                }
            }

            /* ── 5. the native share sheet ───────────────────────────────────────────
   "Copy image" is a desktop verb. On a phone the thing people actually want is
   the system sheet -- Instagram, X, Messages, the group chat -- and copying a
   PNG to the clipboard reaches none of those in one step.

   WEB ONLY and FEATURE-DETECTED. navigator.share must be called from a user
   gesture and canShare({files}) is false on most desktop browsers, so the
   button is injected only where it will actually work rather than shipped and
   then apologised for.

   The canvas lives in the builder's IIFE (LASTCARD) and cannot be reached from
   a module -- but showCard() renders it as an <img> with a data URL, so the
   rendered card is readable straight off the DOM. Same seam as everything else
   here. */
            function canShareFiles() {
                try {
                    if (!navigator.share || !navigator.canShare)
                        return false;
                    var probe = new File([new Blob(['x'],{
                        type: 'image/png'
                    })],'card.png',{
                        type: 'image/png'
                    });
                    return navigator.canShare({
                        files: [probe]
                    });
                } catch (e) {
                    return false;
                }
            }

            /* The build code doubles as a permalink: ui_logic boots with
   applyCode(location.hash), so origin + '#' + code opens that exact build. */
            function buildLink() {
                var out = document.getElementById('codeOut');
                var code = out ? (out.value || out.textContent || '').trim() : '';
                if (!code)
                    return location.origin + '/';
                return location.origin + '/#' + code.replace(/^#/, '');
            }

            function cardImage() {
                var im = document.querySelector('#cardWrap img');
                if (im && im.src)
                    return Promise.resolve(im.src);
                /* Not rendered yet: press the page's own button and wait for the <img>. */
                var mk = document.getElementById('mkcard');
                if (!mk)
                    return Promise.resolve(null);
                mk.click();
                return new Promise(function(res) {
                    var t0 = Date.now();
                    (function tick() {
                        var i2 = document.querySelector('#cardWrap img');
                        if (i2 && i2.src)
                            return res(i2.src);
                        if (Date.now() - t0 > 4000)
                            return res(null);
                        setTimeout(tick, 100);
                    }
                    )();
                }
                );
            }

            function shareCard(btn) {
                var old = btn.textContent;
                btn.textContent = 'Preparing...';
                cardImage().then(function(src) {
                    if (!src)
                        throw new Error('no card');
                    return fetch(src).then(function(r) {
                        return r.blob();
                    });
                }).then(function(blob) {
                    var name = (document.querySelector('#archName, .arch h1, h1') || {}).textContent || '2K27 build';
                    var file = new File([blob],'2k27-build.png',{
                        type: 'image/png'
                    });
                    var payload = {
                        files: [file],
                        title: name.trim().slice(0, 60)
                    };
                    /* The link goes in `text`, not `url`: several platforms silently drop `url`
       when files are attached, and a shared card nobody can open is half a
       share. */
                    payload.text = name.trim() + '\n' + buildLink();
                    if (!navigator.canShare(payload))
                        payload = {
                            files: [file]
                        };
                    return navigator.share(payload);
                }).then(function() {
                    btn.textContent = 'Shared';
                    setTimeout(function() {
                        btn.textContent = old;
                    }, 1600);
                }).catch(function(e) {
                    /* A cancelled sheet rejects with AbortError. That is the user choosing, not
       a failure, so it must not be reported as one. */
                    btn.textContent = (e && e.name === 'AbortError') ? old : 'Could not share';
                    setTimeout(function() {
                        btn.textContent = old;
                    }, 1800);
                });
            }

            function shareInit() {
                if (!canShareFiles())
                    return;
                var copy = document.getElementById('copycard');
                if (!copy || document.getElementById('sharecard'))
                    return;
                var b = document.createElement('button');
                b.type = 'button';
                b.id = 'sharecard';
                b.className = copy.className;
                b.textContent = 'Share card';
                copy.parentNode.insertBefore(b, copy);
                /* before Copy: it is the likelier tap */
                b.addEventListener('click', function() {
                    shareCard(b);
                });
            }

            /* ── boot ────────────────────────────────────────────────────────────────── */
            window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                /* keep it, show our own bar instead */
                DEFERRED = e;
                if (!isStandalone() && !dismissed())
                    showInstallBar();
            });
            window.addEventListener('appinstalled', function() {
                DEFERRED = null;
                var b = document.getElementById('appbar');
                if (b)
                    b.remove();
            });
            window.addEventListener('online', paintOffline);
            window.addEventListener('offline', paintOffline);

            function boot() {
                openDeepLink();
                paintOffline();
                historyInit();
                shareInit();
                if (isStandalone()) {
                    document.documentElement.dataset.app = '1';
                    /* CSS hook for app-only rules */
                    return;
                    /* already installed */
                }
                /* iOS never fires beforeinstallprompt, so offer the written route -- but
     only after a moment, so it does not land on top of a first paint. */
                if (isIOS() && !dismissed())
                    setTimeout(function() {
                        if (!DEFERRED)
                            showInstallBar();
                    }, 4000);
            }

            if (document.readyState === 'loading')
                document.addEventListener('DOMContentLoaded', boot);
            else
                boot();
