            /* "Shades of": the NBA players a build resembles, exactly as the game picks them.
 *
 * Port of ATTRIBUTES_FindClosestMatches (0x235ffc -> 0x27f26c), verified
 * 3000/3000 exact against the engine on score, count and ranked picks:
 *
 *   score = |floor(h - ch)|                 height, cm, float32
 *         + |floor((w - cw) * 0.2f)|        weight, lb, float32
 *         + SUM |(build[a] - cand[a]) * m|  21 attrs, walked in the BUILD's
 *                                           order (value desc, index asc)
 *   m = 12 for Three-Point, 6 for the build's first five non-physical
 *       attributes, else 1 (Speed/Agility/Strength/Vertical are physical).
 *
 * Ranked with the engine's own unstable sort (core_desc.js VCSORT), then later
 * copies of one name are dropped and at most ONE throwback survives.
 *
 * THE POOL, confirmed against the in-game screen (6'6" lock -> 10-11 Kobe,
 * Mikal Bridges, V.J. Edgecombe, exactly 3):
 *   same position, OVR >= 82, |height - build| <= 3in (widening to 4 then 5
 *   until at least 6 qualify), ALL-TIME teams excluded (dropped from the pack),
 *   throwback = not on one of the 30 current NBA teams.
 * The build side is the ALLOCATED values, not the post-breaker ones.
 */
            (function(global) {
                "use strict";

                var PHYS = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1];
                var NONPHYS = 17
                  , THREE = 6
                  , MAXC = 0x400;
                var MINOVR = 82
                  , TOL0 = 3
                  , TOLMAX = 5
                  , NEED = 6;
                var F02 = Math.fround(0.2);

                function attrOrder(b) {
                    var o = [], i;
                    for (i = 0; i < 21; i++)
                        o.push(i);
                    o.sort(function(x, y) {
                        return (b[y] - b[x]) || (x - y);
                    });
                    return o;
                }
                function scoreOf(b, ord, h, w, C, i) {
                    var s = Math.abs(Math.floor(Math.fround(h - C.h[i]))) + Math.abs(Math.floor(Math.fround(Math.fround(w - C.w[i]) * F02)));
                    var k = 0, six = 0, base = i * 21, t, a, d, m;
                    for (t = 0; t < 21; t++) {
                        a = ord[t];
                        d = b[a] - C.v[base + a];
                        if (!PHYS[a]) {
                            k++;
                            if (six <= 4) {
                                m = a === THREE ? 12 : 6;
                                six++;
                            } else if (NONPHYS - k >= 5 && a !== THREE)
                                m = 1;
                            else
                                m = a === THREE ? 12 : 1;
                            d *= m;
                        }
                        s += d < 0 ? -d : d;
                    }
                    return s;
                }
                function match(b, h, w, C, maxOut) {
                    h = Math.fround(h);
                    w = Math.fround(w);
                    var ord = attrOrder(b), n = Math.min(C.n, MAXC), p = new Array(n), i, j;
                    for (i = 0; i < n; i++)
                        p[i] = [i, scoreOf(b, ord, h, w, C, i)];
                    global.VCSORT(p, function(x, y) {
                        return x[1] > y[1] ? 1 : x[1] < y[1] ? -1 : 0;
                    }, false);
                    var mx = Math.min(maxOut, MAXC)
                      , cnt = n
                      , lim = function() {
                        return Math.min(cnt, mx);
                    };
                    for (i = 0; i + 1 < lim(); i++)
                        for (j = i + 1; j < lim(); ) {
                            if (C.key[p[i][0]] === C.key[p[j][0]]) {
                                p.splice(j, 1);
                                cnt--;
                            } else
                                j++;
                        }
                    var seen = 0, k, e;
                    for (k = 0; k < lim(); k++) {
                        seen += C.hist[p[k][0]];
                        if (seen < 2)
                            continue;
                        for (e = k + 1; e < cnt && C.hist[p[e][0]]; e++)
                            ;
                        if (e >= cnt)
                            continue;
                        p.splice(k, e - k);
                        cnt -= e - k;
                        seen--;
                    }
                    var out = [];
                    for (i = 0; i < lim(); i++)
                        out.push(p[i][0]);
                    return out;
                }

                global.SHADES_match = match;
                global.SHADES_score = function(b, h, w, C, i) {
                    return scoreOf(b, attrOrder(b), Math.fround(h), Math.fround(w), C, i);
                }
                ;

                /* "LAL2010" -> "10-11", "CHI96" -> "96-97": the era the game labels a
     throwback with. Current NBA teams carry no year, so they get nothing. */
                function eraOf(t) {
                    var m = /^[A-Za-z]+(\d{2,4})$/.exec(t || '');
                    if (!m)
                        return '';
                    var y = parseInt(m[1], 10);
                    if (y >= 1900)
                        y %= 100;
                    var n = (y + 1) % 100;
                    return (y < 10 ? '0' + y : y) + '-' + (n < 10 ? '0' + n : n);
                }

                /* ALL-TIME DECADE TEAMS ARE NOT SHADE CANDIDATES.
     2K's All-Time rosters come in two shapes: per franchise (ATPHI, ATLAL) and
     per decade (60s, 70s, 80s, 90s, 00s, 10s). The extraction filtered on the
     `all_time` roster_type and that caught the franchise teams only, so 88
     decade entries survived into the pool -- and they are the strongest
     versions of the greatest players ever, so they won the single throwback
     slot on almost every big.

     Caught by two in-game screenshots, 2026-09-13. A 7'2" centre read
     "Wilt Chamberlain [60s]" here and "David Robinson" in game; a 7'3" read
     Wilt again against "Patrick Ewing". Dropping the decade teams reproduces
     BOTH, exactly and in order -- Robinson [SA1991] and Ewing [NY1991] -- and
     leaves the validated 6'6" lock untouched.

     Classic SEASON teams stay: 10-11 Kobe [LAL2010] is a real shade and was
     the original ground truth. Only `<digits>0s` is an all-time decade code;
     current teams are letters and season teams are letters plus a year, so the
     pattern cannot catch either. */
                var ALLTIME = /^\d0s$/;

                var POOL = null;
                function build() {
                    var D = global.SHADES_DATA;
                    if (!D)
                        return null;
                    var bin = atob(D.pack)
                      , N = D.n
                      , names = D.names.split('\n')
                      , teams = D.teams.split('\n');
                    var byPos = [[], [], [], [], []], keyOf = {}, nextKey = 1, i;
                    for (i = 0; i < N; i++) {
                        var o = i * 27
                          , pos = bin.charCodeAt(o);
                        var rec = {
                            name: names[i],
                            team: teams[i],
                            hin: bin.charCodeAt(o + 1),
                            wt: bin.charCodeAt(o + 2) | (bin.charCodeAt(o + 3) << 8),
                            ovr: bin.charCodeAt(o + 4),
                            hist: bin.charCodeAt(o + 5),
                            v: new Uint8Array(21)
                        };
                        for (var a = 0; a < 21; a++)
                            rec.v[a] = bin.charCodeAt(o + 6 + a);
                        if (keyOf[rec.name] === undefined)
                            keyOf[rec.name] = nextKey++;
                        rec.key = keyOf[rec.name];
                        if (byPos[pos] && !ALLTIME.test(rec.team))
                            byPos[pos].push(rec);
                    }
                    POOL = byPos.map(function(list) {
                        var n = list.length
                          , C = {
                            n: n,
                            list: list,
                            h: new Float32Array(n),
                            w: new Float32Array(n),
                            v: new Uint8Array(n * 21),
                            hist: new Uint8Array(n),
                            key: new Int32Array(n)
                        };
                        for (i = 0; i < n; i++) {
                            var r = list[i];
                            C.h[i] = Math.round(r.hin * 2.54);
                            C.w[i] = r.wt;
                            C.hist[i] = r.hist;
                            C.key[i] = r.key;
                            for (var a = 0; a < 21; a++)
                                C.v[i * 21 + a] = r.v[a];
                        }
                        return C;
                    });
                    return POOL;
                }
                function pool() {
                    return POOL || build();
                }

                function sub(C, keep) {
                    var n = keep.length, S = {
                        n: n,
                        list: [],
                        h: new Float32Array(n),
                        w: new Float32Array(n),
                        v: new Uint8Array(n * 21),
                        hist: new Uint8Array(n),
                        key: new Int32Array(n)
                    }, i, a;
                    for (i = 0; i < n; i++) {
                        var j = keep[i];
                        S.list.push(C.list[j]);
                        S.h[i] = C.h[j];
                        S.w[i] = C.w[j];
                        S.hist[i] = C.hist[j];
                        S.key[i] = C.key[j];
                        for (a = 0; a < 21; a++)
                            S.v[i * 21 + a] = C.v[j * 21 + a];
                    }
                    return S;
                }

                /* The build's shades. `vals` must be the ALLOCATED values. */
                function matchBuild(pos, hin, wlb, vals, want) {
                    want = want || 3;
                    var P = pool();
                    if (!P || !P[pos] || !P[pos].n)
                        return [];
                    var C = P[pos], keep = [], tol, i, r;
                    for (tol = TOL0; tol <= TOLMAX; tol++) {
                        keep = [];
                        for (i = 0; i < C.n; i++) {
                            r = C.list[i];
                            if (r.ovr < MINOVR)
                                continue;
                            if (Math.abs(r.hin - hin) > tol)
                                continue;
                            keep.push(i);
                        }
                        if (keep.length >= NEED)
                            break;
                    }
                    if (!keep.length)
                        return [];
                    var S = sub(C, keep)
                      , idx = match(vals, hin * 2.54, wlb, S, 16);
                    var ord = attrOrder(vals)
                      , h = Math.fround(hin * 2.54)
                      , w = Math.fround(wlb)
                      , out = [];
                    for (i = 0; i < idx.length && out.length < want; i++) {
                        r = S.list[idx[i]];
                        out.push({
                            name: r.name,
                            ovr: r.ovr,
                            hin: r.hin,
                            hist: r.hist,
                            team: r.team,
                            era: eraOf(r.team),
                            score: scoreOf(vals, ord, h, w, S, idx[i])
                        });
                    }
                    return out;
                }

                /* Everyone at a position who can ACTUALLY COME BACK as a shade.
     This was "unfiltered", and it listed 3,449 rows of which only 420 are
     reachable -- so most of the directory was players nobody's build is ever
     compared to. Two pool rules decide it before any search, and neither was
     being applied here:

       ovr >= 82   MINOVR is a hard gate in matchBuild, so a player under it is
                   in nobody's pool at any height. 2,757 of the 3,449 rows.
       one per name  match() drops later copies of a FullNameCrc, so a player's
                   other roster entries can never be displayed however they
                   score. Mike Conley appeared three times, Klay Thompson three.

     Keep the FIRST record of each name, not the highest-OVR one: that is the
     record solveShades looks up when the row is clicked, so the height and OVR
     shown always describe the build a click will actually make.

     Height needs no filter. Measured across all five positions: the legal build
     heights span far enough that the 3-5in tolerance reaches every 82+
     candidate, so it removes nobody and a height rule here would only be
     decoration. */
                function browse(pos) {
                    var P = pool();
                    if (!P || !P[pos])
                        return [];
                    var C = P[pos]
                      , rows = []
                      , seen = {};
                    for (var i = 0; i < C.n; i++) {
                        var r = C.list[i];
                        if (r.ovr < MINOVR)
                            continue;
                        if (seen['n' + r.name])
                            continue;
                        /* 'n' so a name cannot hit Object.prototype */
                        seen['n' + r.name] = 1;
                        rows.push({
                            name: r.name,
                            ovr: r.ovr,
                            hin: r.hin,
                            hist: r.hist,
                            team: r.team,
                            era: eraOf(r.team)
                        });
                    }
                    return rows;
                }

                global.SHADES = {
                    matchBuild: matchBuild,
                    browse: browse,
                    eraOf: eraOf,
                    /* the SOLVER needs each player's 21 attributes to build
                       toward them; browse() deliberately strips those out */
                    pool: pool,
                    ready: function() {
                        return !!global.SHADES_DATA;
                    }
                };
            }
            )(window);
