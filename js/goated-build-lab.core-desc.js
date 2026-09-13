            /* Archetype names, exactly as NBA 2K27 computes them.
 *
 * Port of ATTRIBUTES_DetermineDescription (0x299860) plus its calibration
 * routine (0x299c6c) and the engine's own sort (0x3633f4). Verified against the
 * running engine on 300,000 builds x 5 positions, exact on the returned
 * description id including the position-indexed record slot.
 *
 * The 137,959-key mask table is not shipped. Its keys are exactly every 20-bit
 * mask with 2..7 bits set, minus 0x18624, with 0x1a624 duplicated -- so a row
 * index is a combinatorial rank (DESC_row below).
 */
            (function(global) {
                "use strict";

                /* attribute -> engine category; 6 is Physicals, the group calib nudges first */
                var CAT = [1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 6, 6, 6, 6];
                var IDX = [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
                /* skips Free Throw */

                var THR = null
                  , PRIO = null;
                /* filled by init */
                var NAMES = null
                  , TUPLES = null
                  , INDEX = null;

                /* ---- the engine's sort, 0x3633f4 -------------------------------------- */
                /* Not stable. Where two records compare fully equal the winner is this
     algorithm's permutation, and that decides which attribute calib pardons. */
                function mkCtx(a, cmp, swap) {
                    return {
                        a: a,
                        c: swap ? function(i, j) {
                            return cmp(a[j], a[i]);
                        }
                        : function(i, j) {
                            return cmp(a[i], a[j]);
                        }
                        ,
                        sw: function(i, j) {
                            if (i !== j) {
                                var t = a[i];
                                a[i] = a[j];
                                a[j] = t;
                            }
                        }
                    };
                }
                function vcMed3(x, a, b, c) {
                    if (x.c(a, b) <= 0) {
                        if (x.c(b, c) < 1)
                            return b;
                        return x.c(c, a) < 1 ? a : c;
                    }
                    if (x.c(a, c) < 1)
                        return a;
                    return x.c(c, b) < 1 ? b : c;
                }
                function vcPivot(x, lo, hi) {
                    /* 0x37aed4 */
                    var n = hi - lo, s;
                    if (n < 0x2e)
                        return vcMed3(x, lo, lo + (n >> 1), hi - 1);
                    s = n >> 3;
                    /* ninther from 46 up */
                    return vcMed3(x, vcMed3(x, lo, lo + s, lo + 2 * s), vcMed3(x, lo + 3 * s, lo + 4 * s, lo + 5 * s), vcMed3(x, lo + 6 * s, lo + 7 * s, hi - 1));
                }
                /* 0x379260: the depth-limit fallback for n > 16. Heap built by sift-up; each
     extraction walks the root's hole down the larger children to a leaf, parks
     the last element there and sifts it back up. */
                function vcHeap(x, lo, n) {
                    var i, p, c, k, m, h, lc, rc, ch, last;
                    for (i = 1; i < n; i++) {
                        c = i;
                        p = (i - 1) >> 1;
                        for (; ; ) {
                            if (x.c(lo + p, lo + c) > 0)
                                break;
                            x.sw(lo + p, lo + c);
                            if (p === 0)
                                break;
                            c = p;
                            p = (p - 1) >> 1;
                        }
                    }
                    for (k = 0; k < n - 1; k++) {
                        m = n - k;
                        h = 0;
                        if (m >= 2) {
                            lc = 1;
                            rc = 2;
                            for (; ; ) {
                                ch = lc;
                                if (m > rc && x.c(lo + lc, lo + rc) < 1)
                                    ch = rc;
                                x.sw(lo + h, lo + ch);
                                h = ch;
                                lc = 2 * h + 1;
                                rc = 2 * h + 2;
                                if (m <= lc)
                                    break;
                            }
                        }
                        last = m - 1;
                        if (h === last)
                            continue;
                        x.sw(lo + h, lo + last);
                        if (h === 0)
                            continue;
                        c = h;
                        p = (c - 1) >> 1;
                        for (; ; ) {
                            if (x.c(lo + c, lo + p) < 1)
                                break;
                            x.sw(lo + p, lo + c);
                            if (p === 0)
                                break;
                            c = p;
                            p = (p - 1) >> 1;
                        }
                    }
                }
                function vcPartition(x, lo, hi, pivotIdx) {
                    /* 0x37b208 */
                    if (hi - lo <= 0)
                        return lo;
                    var hi1 = hi - 1;
                    if (pivotIdx !== hi1)
                        x.sw(hi1, pivotIdx);
                    var half = (hi - lo) >> 1, mid = lo + half, i = lo, j = mid, k, found, hit;
                    if (mid < hi1 && half >= 1) {
                        for (; ; ) {
                            k = i;
                            i = mid > k + 1 ? mid : k + 1;
                            found = false;
                            while (k < mid) {
                                if (x.c(k, hi1) > 0) {
                                    i = k;
                                    found = true;
                                    break;
                                }
                                k++;
                            }
                            if (j >= hi1)
                                break;
                            hit = false;
                            while (j < hi1) {
                                if (x.c(j, hi1) < 1) {
                                    hit = true;
                                    break;
                                }
                                j++;
                            }
                            if (!hit) {
                                j = hi1;
                                break;
                            }
                            if (found) {
                                x.sw(i, j);
                                i++;
                                j++;
                            }
                            if (j >= hi1 || i >= mid)
                                break;
                        }
                    }
                    var w28 = mid;
                    if (i < mid) {
                        k = i;
                        for (; ; ) {
                            if (x.c(k, hi1) < 1) {
                                k++;
                                if (k >= w28)
                                    break;
                                continue;
                            }
                            w28--;
                            if (w28 === k)
                                break;
                            x.sw(w28, k);
                            if (k >= w28)
                                break;
                        }
                        i = k;
                    }
                    if (j < hi1) {
                        var w21 = w28;
                        for (; ; ) {
                            if (x.c(j, hi1) > 0) {
                                j++;
                                if (j >= hi1)
                                    break;
                                continue;
                            }
                            w28 = w21 + 1;
                            if (w21 === j)
                                j = w28;
                            else
                                x.sw(w21, j);
                            w21 = w28;
                            if (j >= hi1)
                                break;
                        }
                    }
                    if (w28 !== hi1)
                        x.sw(hi1, w28);
                    return w28;
                }
                function vcShell(x, lo, n) {
                    /* 0x37874c */
                    var gapPrev = n, gap, j, k;
                    for (; ; ) {
                        gap = gapPrev >> 1;
                        if (gap < n) {
                            for (j = gap; j < n; j++) {
                                k = j - gap;
                                while (k >= 0 && x.c(lo + k, lo + gap + k) >= 1) {
                                    x.sw(lo + k, lo + gap + k);
                                    k -= gap;
                                }
                            }
                        }
                        if (gapPrev < 4)
                            return;
                        gapPrev = gap;
                    }
                }
                function vcRec(x, lo, hi, depth, limit) {
                    var n = hi - lo;
                    if (n < 2)
                        return;
                    if (depth >= limit) {
                        if (n <= 16)
                            vcShell(x, lo, n);
                        else
                            vcHeap(x, lo, n);
                        return;
                    }
                    for (; ; ) {
                        n = hi - lo;
                        if (n <= 8) {
                            vcShell(x, lo, n);
                            return;
                        }
                        var m = vcPartition(x, lo, hi, vcPivot(x, lo, hi));
                        depth++;
                        if ((hi - m) <= (m - lo)) {
                            vcRec(x, m + 1, hi, depth, limit);
                            hi = m;
                        } else {
                            vcRec(x, lo, m, depth, limit);
                            lo = m + 1;
                        }
                        n = hi - lo;
                        if (n < 2)
                            return;
                        if (depth >= limit) {
                            if (n <= 16)
                                vcShell(x, lo, n);
                            else
                                vcHeap(x, lo, n);
                            return;
                        }
                    }
                }
                function vcSort(a, cmp, swapArgs) {
                    var n = a.length;
                    if (n < 2)
                        return;
                    vcRec(mkCtx(a, cmp, swapArgs), 0, n, 0, 31 - Math.clz32(n | 1));
                }

                /* ---- comparators, as they sit in .data -------------------------------- */
                function cmpA(a, b) {
                    return a[3] - b[3];
                }
                /* 0x7a8500 */
                function mkCmpBC(fl) {
                    /* B / C    */
                    return function(a, b) {
                        var pa = CAT[a[0]] === 6
                          , pb = CAT[b[0]] === 6;
                        var wa = fl ? pa : !pa
                          , wb = fl ? pb : !pb;
                        if (wa && !wb)
                            return -1;
                        if (!wa && wb)
                            return 1;
                        if (b[1] !== a[1])
                            return b[1] - a[1];
                        return a[2] - b[2];
                    }
                    ;
                }
                function mkCmp2(pos) {
                    /* 0x7a8508 */
                    var p = PRIO[pos];
                    return function(a, b) {
                        if (a[3] !== b[3])
                            return a[3] - b[3];
                        var ta = p[a[0]]
                          , tb = p[b[0]];
                        return ta < tb ? 1 : (ta > tb ? -1 : 0);
                    }
                    ;
                }

                /* ---- calib, 0x299c6c -------------------------------------------------- */
                function calib(v, rec, count, thr, flag) {
                    var step = count <= 7 ? -1 : 1, fl = flag & 1, s, i, d;
                    for (s = 0; s < 21; s++)
                        if (fl !== (CAT[s] !== 6 ? 1 : 0))
                            thr[s] += step;
                    var cnt = 0;
                    rec.length = 0;
                    for (s = 0; s < IDX.length; s++) {
                        i = IDX[s];
                        d = v[i] - thr[i];
                        rec.push([i, v[i], thr[i], d]);
                        if (d >= 0)
                            cnt++;
                    }
                    vcSort(rec, cmpA, 1);
                    if (count < 8 || cnt > 6)
                        return cnt;
                    vcSort(rec, mkCmpBC(fl), 0);
                    var w22 = 0, w25, w27, k;
                    for (; ; ) {
                        if (fl === (CAT[rec[w22][0]] !== 6 ? 1 : 0) || rec[w22][3] !== -1) {
                            if (w22 > 18 || cnt > 6)
                                return cnt;
                            w22++;
                            continue;
                        }
                        rec[w22][3] = 0;
                        w25 = cnt + 1;
                        if (w22 > 18)
                            return w25;
                        w27 = w22;
                        k = w22 + 1;
                        for (; ; ) {
                            if (rec[k][3] !== -1)
                                break;
                            if (rec[k][1] !== rec[k - 1][1])
                                break;
                            if (rec[k][2] !== rec[k - 1][2])
                                break;
                            if (fl === (CAT[rec[k][0]] !== 6 ? 1 : 0))
                                return w25;
                            rec[k - 1][3] = 0;
                            k++;
                            w25++;
                            w27++;
                            if (k > 19)
                                return cnt - w22 + 20;
                        }
                        w22 = w27;
                        cnt = w25;
                        if (w22 > 18 || cnt > 6)
                            return cnt;
                        w22++;
                    }
                }

                /* ---- 0x299860: build -> mask ------------------------------------------ */
                function maskFor(v, pos) {
                    var thr = [], a, i, d;
                    for (a = 0; a < 21; a++)
                        thr.push(THR[a][pos]);
                    var rec = []
                      , w21 = 0;
                    for (a = 0; a < IDX.length; a++) {
                        i = IDX[a];
                        d = v[i] - thr[i];
                        rec.push([i, v[i], thr[i], d]);
                        if (d >= 0)
                            w21++;
                    }
                    vcSort(rec, cmpA, 1);
                    var w20 = w21, w22, w23, w8;

                    if (w21 >= 8) {
                        /* 0x299a1c */
                        w22 = 1;
                        for (; ; ) {
                            w22 ^= 1;
                            w20 = calib(v, rec, w20, thr, 1);
                            w22 |= (w20 < 8) ? 1 : 0;
                            if ((w22 & 1) === 0)
                                continue;
                            if (w20 < 8)
                                break;
                            w20 = calib(v, rec, w20, thr, 0);
                            if (w20 <= 7)
                                break;
                        }
                    } else if (w21 <= 2) {
                        /* 0x299ae0 */
                        w22 = 3;
                        w23 = 1;
                        for (; ; ) {
                            if (w20 <= 2) {
                                w20 = calib(v, rec, w20, thr, 0);
                                if (w20 <= 2) {
                                    w20 = calib(v, rec, w20, thr, 0);
                                    if (w20 <= 2) {
                                        w20 = calib(v, rec, w20, thr, 0);
                                        if (w20 < 3)
                                            w20 = calib(v, rec, w20, thr, 1);
                                    }
                                }
                            }
                            w8 = w23 === 0 ? 1 : 0;
                            w23 -= 1;
                            w22 -= w8;
                            if (w20 >= w22)
                                break;
                        }
                    }

                    vcSort(rec, mkCmp2(pos), 1);
                    /* 0x299a80 / 0x299ba8 */

                    var n = (w21 >= 3 && w21 <= 7) ? w21 : w20;
                    if (n <= 2) {
                        w8 = w21 > 3 ? w21 : 3;
                        n = w8 < 7 ? w8 : 7;
                    }
                    if (n < 1)
                        return 0;
                    if (n > 7)
                        n = 7;
                    var m = 0;
                    for (a = 0; a < n; a++) {
                        i = rec[a][0];
                        m |= 1 << (i - (i > 6 ? 1 : 0));
                    }
                    return m;
                }

                /* ---- mask -> row, by combinatorial rank ------------------------------- */
                var C = [];
                (function() {
                    for (var i = 0; i <= 20; i++) {
                        C.push([]);
                        for (var j = 0; j <= 20; j++)
                            C[i].push(j > i ? 0 : (j === 0 || j === i ? 1 : C[i - 1][j - 1] + C[i - 1][j]));
                    }
                }
                )();
                function descRow(m) {
                    /* count of x < m with 2..7 bits set, then the two table irregularities */
                    var r = 0, ones = 0, i, c, lo, hi;
                    for (i = 19; i >= 0; i--) {
                        if ((m >> i) & 1) {
                            lo = Math.max(0, 2 - ones);
                            hi = Math.min(7 - ones, i);
                            for (c = lo; c <= hi; c++)
                                r += C[i][c];
                            ones++;
                            if (ones > 7)
                                break;
                        }
                    }
                    if (m > 0x18624)
                        r -= 1;
                    /* the one 2..7-bit mask absent from the table */
                    if (m > 0x1a624)
                        r += 1;
                    /* the one duplicated key, which owns two rows */
                    return r;
                }

                /* ---- payload ---------------------------------------------------------- */
                function b64bytes(s) {
                    var bin = atob(s)
                      , n = bin.length
                      , out = new Uint8Array(n);
                    for (var i = 0; i < n; i++)
                        out[i] = bin.charCodeAt(i);
                    return out;
                }
                function inflate(bytes) {
                    var ds = new DecompressionStream("deflate");
                    var w = ds.writable.getWriter();
                    w.write(bytes);
                    w.close();
                    return new Response(ds.readable).arrayBuffer();
                }

                var ready = null;
                function init(payload, thresholds, priority) {
                    THR = thresholds;
                    PRIO = priority;
                    ready = Promise.all([inflate(b64bytes(payload.names)), inflate(b64bytes(payload.tuples)), inflate(b64bytes(payload.index))]).then(function(bufs) {
                        NAMES = new TextDecoder().decode(bufs[0]).split("\n");
                        TUPLES = new Uint16Array(bufs[1]);
                        INDEX = new Uint16Array(bufs[2]);
                        return true;
                    });
                    return ready;
                }

                /* the archetype name the game would show, or null */
                function describe(v, pos) {
                    if (!INDEX)
                        return null;
                    var m = maskFor(v, pos);
                    if (!m)
                        return null;
                    var bits = 0
                      , t = m;
                    while (t) {
                        bits += t & 1;
                        t >>>= 1;
                    }
                    if (bits < 2 || bits > 7)
                        return null;
                    /* not a key the table carries */
                    if (m === 0x18624)
                        return null;
                    var row = descRow(m);
                    if (row < 0 || row >= INDEX.length)
                        return null;
                    return NAMES[TUPLES[INDEX[row] * 5 + pos]] || null;
                }

                /* THE NAME DIRECTORY, built from the table already shipped here.
     Every row is one attribute profile and carries a name per position, so
     walking the rows gives, for each name, how many profiles earn it (its
     rarity) and which positions can. No extra payload: this is the same data
     `describe` already reads. Cached -- it is a 137,959 x 5 walk. */
                var TALLY = null;
                /* WHICH ROWS A BUILD CAN ACTUALLY LAND ON.
     maskFor forces n >= 3, so the 190 two-bit masks exist in the table and can
     never be emitted by a real build. Counting them made the directory promise
     positions that the solver then refused -- "available at PG" followed by
     "no legal build earns this at PG", which is the contradiction a user sees.
     Rank is computed by ENUMERATION rather than by calling descRow a million
     times: masks ascend, so the k-th qualifying mask has rank k, and the two
     table irregularities are the same two descRow applies. */
                var REACH = null;
                function reachRows() {
                    if (REACH)
                        return REACH;
                    REACH = new Uint8Array(INDEX.length);
                    var m, b, t, row, k = 0;
                    for (m = 0; m < (1 << 20); m++) {
                        b = 0;
                        t = m;
                        while (t) {
                            b += t & 1;
                            t >>>= 1;
                        }
                        if (b < 2 || b > 7)
                            continue;
                        row = k++;
                        if (m > 0x18624)
                            row -= 1;
                        if (m > 0x1a624)
                            row += 1;
                        if (b >= 3 && row >= 0 && row < REACH.length)
                            REACH[row] = 1;
                    }
                    return REACH;
                }

                function tally() {
                    if (TALLY)
                        return TALLY;
                    if (!INDEX)
                        return null;
                    var out = Object.create(null), r, p, nm, e, base, R = reachRows();
                    for (r = 0; r < INDEX.length; r++) {
                        base = INDEX[r] * 5;
                        for (p = 0; p < 5; p++) {
                            nm = NAMES[TUPLES[base + p]];
                            if (!nm)
                                continue;
                            e = out[nm] || (out[nm] = {
                                c: 0,
                                p: 0,
                                cr: 0,
                                pr: 0
                            });
                            /* c/p are the TABLE facts; cr/pr are what a build can actually earn */
                            e.c++;
                            e.p |= 1 << p;
                            if (R[r]) {
                                e.cr++;
                                e.pr |= 1 << p;
                            }
                        }
                    }
                    TALLY = out;
                    return out;
                }

                global.VCSORT = vcSort;
                /* also the shades matcher's final sort */
                global.DescName = {
                    init: init,
                    describe: describe,
                    maskFor: maskFor,
                    descRow: descRow,
                    tally: tally,
                    /* The name SOLVER needs to walk the table itself: a name maps to a set of
       masks, and a mask is the top n attributes by (value - threshold). Both
       the tables and THR are closure-private, so they are exposed here rather
       than duplicated -- the solver must read the same data `describe` does or
       it would be solving against a copy. */
                    tables: function() {
                        return INDEX ? {
                            names: NAMES,
                            tuples: TUPLES,
                            index: INDEX
                        } : null;
                    },
                    thresholds: function() {
                        return THR || null;
                    },
                    whenReady: function() {
                        return ready;
                    }
                };
            }
            )(typeof window !== "undefined" ? window : globalThis);
