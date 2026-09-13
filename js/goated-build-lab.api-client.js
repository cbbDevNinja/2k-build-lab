(function (global) {
  "use strict";

  function trimRightSlash(s) {
    return String(s || "").replace(/\/+$/, "");
  }

  function defaultBaseUrl() {
    var cfg = global.GBL_WEB_CONFIG || {};
    if (cfg.API_BASE_URL) return trimRightSlash(cfg.API_BASE_URL);
    if (typeof location !== "undefined" && /^https?:/.test(location.origin)) {
      return trimRightSlash(location.origin);
    }
    return "http://localhost:8787";
  }

  async function evaluateBuild(payload, opts) {
    var base = (opts && opts.baseUrl) || defaultBaseUrl();
    var token = opts && opts.bearer;
    var headers = { "content-type": "application/json" };
    if (token) headers.Authorization = "Bearer " + token;

    var res = await fetch(base + "/api/solver/evaluate", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    var data = await res.json().catch(function () {
      return { error: "Invalid JSON response" };
    });

    if (!res.ok) {
      throw new Error(data && data.error ? data.error : "API request failed");
    }

    return data;
  }

  global.GBLApi = { evaluateBuild: evaluateBuild };
})(typeof window !== "undefined" ? window : globalThis);
