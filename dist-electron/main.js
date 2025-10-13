import F from "node:path";
import { fileURLToPath as Ut } from "node:url";
import { ipcMain as Bt, dialog as Jt, app as de, BrowserWindow as Ze } from "electron";
import et from "fs";
import Vt from "constants";
import qt from "stream";
import Ht from "util";
import Yt from "assert";
import M from "path";
import Gt from "sharp";
const Kt = {
  darwin: [
    { envVar: "SHARP_DARWIN_X64_PATH", filename: "sharp-darwin-x64.node" },
    { envVar: "SHARP_DARWIN_ARM64_PATH", filename: "sharp-darwin-arm64.node" }
  ],
  win32: [
    { envVar: "SHARP_WIN32_X64_PATH", filename: "sharp-win32-x64.node" }
  ],
  linux: [
    { envVar: "SHARP_LINUX_X64_PATH", filename: "sharp-linux-x64.node" },
    { envVar: "SHARP_LINUX_ARM64_PATH", filename: "sharp-linux-arm64.node" }
  ]
};
function zt() {
  return process.env.NODE_ENV === "development" ? F.join(process.cwd(), "node_modules/sharp/build/Release") : F.join(process.resourcesPath, "app.asar.unpacked", "node_modules", "sharp", "build", "Release");
}
function Xt() {
  const e = Kt[process.platform];
  if (!e)
    return;
  const t = zt();
  for (const { envVar: n, filename: i } of e)
    process.env[n] = F.join(t, i);
}
var ge = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, A = {}, O = {};
O.fromCallback = function(e) {
  return Object.defineProperty(function(...t) {
    if (typeof t[t.length - 1] == "function") e.apply(this, t);
    else
      return new Promise((n, i) => {
        t.push((r, o) => r != null ? i(r) : n(o)), e.apply(this, t);
      });
  }, "name", { value: e.name });
};
O.fromPromise = function(e) {
  return Object.defineProperty(function(...t) {
    const n = t[t.length - 1];
    if (typeof n != "function") return e.apply(this, t);
    t.pop(), e.apply(this, t).then((i) => n(null, i), n);
  }, "name", { value: e.name });
};
var q = Vt, Qt = process.cwd, me = null, Zt = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
  return me || (me = Qt.call(process)), me;
};
try {
  process.cwd();
} catch {
}
if (typeof process.chdir == "function") {
  var Le = process.chdir;
  process.chdir = function(e) {
    me = null, Le.call(process, e);
  }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, Le);
}
var en = tn;
function tn(e) {
  q.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && t(e), e.lutimes || n(e), e.chown = o(e.chown), e.fchown = o(e.fchown), e.lchown = o(e.lchown), e.chmod = i(e.chmod), e.fchmod = i(e.fchmod), e.lchmod = i(e.lchmod), e.chownSync = c(e.chownSync), e.fchownSync = c(e.fchownSync), e.lchownSync = c(e.lchownSync), e.chmodSync = r(e.chmodSync), e.fchmodSync = r(e.fchmodSync), e.lchmodSync = r(e.lchmodSync), e.stat = l(e.stat), e.fstat = l(e.fstat), e.lstat = l(e.lstat), e.statSync = d(e.statSync), e.fstatSync = d(e.fstatSync), e.lstatSync = d(e.lstatSync), e.chmod && !e.lchmod && (e.lchmod = function(a, u, f) {
    f && process.nextTick(f);
  }, e.lchmodSync = function() {
  }), e.chown && !e.lchown && (e.lchown = function(a, u, f, s) {
    s && process.nextTick(s);
  }, e.lchownSync = function() {
  }), Zt === "win32" && (e.rename = typeof e.rename != "function" ? e.rename : function(a) {
    function u(f, s, y) {
      var v = Date.now(), w = 0;
      a(f, s, function E(W) {
        if (W && (W.code === "EACCES" || W.code === "EPERM" || W.code === "EBUSY") && Date.now() - v < 6e4) {
          setTimeout(function() {
            e.stat(s, function(I, re) {
              I && I.code === "ENOENT" ? a(f, s, E) : y(W);
            });
          }, w), w < 100 && (w += 10);
          return;
        }
        y && y(W);
      });
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(u, a), u;
  }(e.rename)), e.read = typeof e.read != "function" ? e.read : function(a) {
    function u(f, s, y, v, w, E) {
      var W;
      if (E && typeof E == "function") {
        var I = 0;
        W = function(re, Ie, Re) {
          if (re && re.code === "EAGAIN" && I < 10)
            return I++, a.call(e, f, s, y, v, w, W);
          E.apply(this, arguments);
        };
      }
      return a.call(e, f, s, y, v, w, W);
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(u, a), u;
  }(e.read), e.readSync = typeof e.readSync != "function" ? e.readSync : /* @__PURE__ */ function(a) {
    return function(u, f, s, y, v) {
      for (var w = 0; ; )
        try {
          return a.call(e, u, f, s, y, v);
        } catch (E) {
          if (E.code === "EAGAIN" && w < 10) {
            w++;
            continue;
          }
          throw E;
        }
    };
  }(e.readSync);
  function t(a) {
    a.lchmod = function(u, f, s) {
      a.open(
        u,
        q.O_WRONLY | q.O_SYMLINK,
        f,
        function(y, v) {
          if (y) {
            s && s(y);
            return;
          }
          a.fchmod(v, f, function(w) {
            a.close(v, function(E) {
              s && s(w || E);
            });
          });
        }
      );
    }, a.lchmodSync = function(u, f) {
      var s = a.openSync(u, q.O_WRONLY | q.O_SYMLINK, f), y = !0, v;
      try {
        v = a.fchmodSync(s, f), y = !1;
      } finally {
        if (y)
          try {
            a.closeSync(s);
          } catch {
          }
        else
          a.closeSync(s);
      }
      return v;
    };
  }
  function n(a) {
    q.hasOwnProperty("O_SYMLINK") && a.futimes ? (a.lutimes = function(u, f, s, y) {
      a.open(u, q.O_SYMLINK, function(v, w) {
        if (v) {
          y && y(v);
          return;
        }
        a.futimes(w, f, s, function(E) {
          a.close(w, function(W) {
            y && y(E || W);
          });
        });
      });
    }, a.lutimesSync = function(u, f, s) {
      var y = a.openSync(u, q.O_SYMLINK), v, w = !0;
      try {
        v = a.futimesSync(y, f, s), w = !1;
      } finally {
        if (w)
          try {
            a.closeSync(y);
          } catch {
          }
        else
          a.closeSync(y);
      }
      return v;
    }) : a.futimes && (a.lutimes = function(u, f, s, y) {
      y && process.nextTick(y);
    }, a.lutimesSync = function() {
    });
  }
  function i(a) {
    return a && function(u, f, s) {
      return a.call(e, u, f, function(y) {
        S(y) && (y = null), s && s.apply(this, arguments);
      });
    };
  }
  function r(a) {
    return a && function(u, f) {
      try {
        return a.call(e, u, f);
      } catch (s) {
        if (!S(s)) throw s;
      }
    };
  }
  function o(a) {
    return a && function(u, f, s, y) {
      return a.call(e, u, f, s, function(v) {
        S(v) && (v = null), y && y.apply(this, arguments);
      });
    };
  }
  function c(a) {
    return a && function(u, f, s) {
      try {
        return a.call(e, u, f, s);
      } catch (y) {
        if (!S(y)) throw y;
      }
    };
  }
  function l(a) {
    return a && function(u, f, s) {
      typeof f == "function" && (s = f, f = null);
      function y(v, w) {
        w && (w.uid < 0 && (w.uid += 4294967296), w.gid < 0 && (w.gid += 4294967296)), s && s.apply(this, arguments);
      }
      return f ? a.call(e, u, f, y) : a.call(e, u, y);
    };
  }
  function d(a) {
    return a && function(u, f) {
      var s = f ? a.call(e, u, f) : a.call(e, u);
      return s && (s.uid < 0 && (s.uid += 4294967296), s.gid < 0 && (s.gid += 4294967296)), s;
    };
  }
  function S(a) {
    if (!a || a.code === "ENOSYS")
      return !0;
    var u = !process.getuid || process.getuid() !== 0;
    return !!(u && (a.code === "EINVAL" || a.code === "EPERM"));
  }
}
var Ae = qt.Stream, nn = rn;
function rn(e) {
  return {
    ReadStream: t,
    WriteStream: n
  };
  function t(i, r) {
    if (!(this instanceof t)) return new t(i, r);
    Ae.call(this);
    var o = this;
    this.path = i, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, r = r || {};
    for (var c = Object.keys(r), l = 0, d = c.length; l < d; l++) {
      var S = c[l];
      this[S] = r[S];
    }
    if (this.encoding && this.setEncoding(this.encoding), this.start !== void 0) {
      if (typeof this.start != "number")
        throw TypeError("start must be a Number");
      if (this.end === void 0)
        this.end = 1 / 0;
      else if (typeof this.end != "number")
        throw TypeError("end must be a Number");
      if (this.start > this.end)
        throw new Error("start must be <= end");
      this.pos = this.start;
    }
    if (this.fd !== null) {
      process.nextTick(function() {
        o._read();
      });
      return;
    }
    e.open(this.path, this.flags, this.mode, function(a, u) {
      if (a) {
        o.emit("error", a), o.readable = !1;
        return;
      }
      o.fd = u, o.emit("open", u), o._read();
    });
  }
  function n(i, r) {
    if (!(this instanceof n)) return new n(i, r);
    Ae.call(this), this.path = i, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, r = r || {};
    for (var o = Object.keys(r), c = 0, l = o.length; c < l; c++) {
      var d = o[c];
      this[d] = r[d];
    }
    if (this.start !== void 0) {
      if (typeof this.start != "number")
        throw TypeError("start must be a Number");
      if (this.start < 0)
        throw new Error("start must be >= zero");
      this.pos = this.start;
    }
    this.busy = !1, this._queue = [], this.fd === null && (this._open = e.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush());
  }
}
var on = an, cn = Object.getPrototypeOf || function(e) {
  return e.__proto__;
};
function an(e) {
  if (e === null || typeof e != "object")
    return e;
  if (e instanceof Object)
    var t = { __proto__: cn(e) };
  else
    var t = /* @__PURE__ */ Object.create(null);
  return Object.getOwnPropertyNames(e).forEach(function(n) {
    Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(e, n));
  }), t;
}
var P = et, sn = en, un = nn, ln = on, le = Ht, C, he;
typeof Symbol == "function" && typeof Symbol.for == "function" ? (C = Symbol.for("graceful-fs.queue"), he = Symbol.for("graceful-fs.previous")) : (C = "___graceful-fs.queue", he = "___graceful-fs.previous");
function fn() {
}
function tt(e, t) {
  Object.defineProperty(e, C, {
    get: function() {
      return t;
    }
  });
}
var K = fn;
le.debuglog ? K = le.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (K = function() {
  var e = le.format.apply(le, arguments);
  e = "GFS4: " + e.split(/\n/).join(`
GFS4: `), console.error(e);
});
if (!P[C]) {
  var yn = ge[C] || [];
  tt(P, yn), P.close = function(e) {
    function t(n, i) {
      return e.call(P, n, function(r) {
        r || We(), typeof i == "function" && i.apply(this, arguments);
      });
    }
    return Object.defineProperty(t, he, {
      value: e
    }), t;
  }(P.close), P.closeSync = function(e) {
    function t(n) {
      e.apply(P, arguments), We();
    }
    return Object.defineProperty(t, he, {
      value: e
    }), t;
  }(P.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
    K(P[C]), Yt.equal(P[C].length, 0);
  });
}
ge[C] || tt(ge, P[C]);
var te = Oe(ln(P));
process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !P.__patched && (te = Oe(P), P.__patched = !0);
function Oe(e) {
  sn(e), e.gracefulify = Oe, e.createReadStream = Ie, e.createWriteStream = Re;
  var t = e.readFile;
  e.readFile = n;
  function n(m, p, h) {
    return typeof p == "function" && (h = p, p = null), x(m, p, h);
    function x(T, _, g, b) {
      return t(T, _, function($) {
        $ && ($.code === "EMFILE" || $.code === "ENFILE") ? X([x, [T, _, g], $, b || Date.now(), Date.now()]) : typeof g == "function" && g.apply(this, arguments);
      });
    }
  }
  var i = e.writeFile;
  e.writeFile = r;
  function r(m, p, h, x) {
    return typeof h == "function" && (x = h, h = null), T(m, p, h, x);
    function T(_, g, b, $, N) {
      return i(_, g, b, function(k) {
        k && (k.code === "EMFILE" || k.code === "ENFILE") ? X([T, [_, g, b, $], k, N || Date.now(), Date.now()]) : typeof $ == "function" && $.apply(this, arguments);
      });
    }
  }
  var o = e.appendFile;
  o && (e.appendFile = c);
  function c(m, p, h, x) {
    return typeof h == "function" && (x = h, h = null), T(m, p, h, x);
    function T(_, g, b, $, N) {
      return o(_, g, b, function(k) {
        k && (k.code === "EMFILE" || k.code === "ENFILE") ? X([T, [_, g, b, $], k, N || Date.now(), Date.now()]) : typeof $ == "function" && $.apply(this, arguments);
      });
    }
  }
  var l = e.copyFile;
  l && (e.copyFile = d);
  function d(m, p, h, x) {
    return typeof h == "function" && (x = h, h = 0), T(m, p, h, x);
    function T(_, g, b, $, N) {
      return l(_, g, b, function(k) {
        k && (k.code === "EMFILE" || k.code === "ENFILE") ? X([T, [_, g, b, $], k, N || Date.now(), Date.now()]) : typeof $ == "function" && $.apply(this, arguments);
      });
    }
  }
  var S = e.readdir;
  e.readdir = u;
  var a = /^v[0-5]\./;
  function u(m, p, h) {
    typeof p == "function" && (h = p, p = null);
    var x = a.test(process.version) ? function(g, b, $, N) {
      return S(g, T(
        g,
        b,
        $,
        N
      ));
    } : function(g, b, $, N) {
      return S(g, b, T(
        g,
        b,
        $,
        N
      ));
    };
    return x(m, p, h);
    function T(_, g, b, $) {
      return function(N, k) {
        N && (N.code === "EMFILE" || N.code === "ENFILE") ? X([
          x,
          [_, g, b],
          N,
          $ || Date.now(),
          Date.now()
        ]) : (k && k.sort && k.sort(), typeof b == "function" && b.call(this, N, k));
      };
    }
  }
  if (process.version.substr(0, 4) === "v0.8") {
    var f = un(e);
    E = f.ReadStream, I = f.WriteStream;
  }
  var s = e.ReadStream;
  s && (E.prototype = Object.create(s.prototype), E.prototype.open = W);
  var y = e.WriteStream;
  y && (I.prototype = Object.create(y.prototype), I.prototype.open = re), Object.defineProperty(e, "ReadStream", {
    get: function() {
      return E;
    },
    set: function(m) {
      E = m;
    },
    enumerable: !0,
    configurable: !0
  }), Object.defineProperty(e, "WriteStream", {
    get: function() {
      return I;
    },
    set: function(m) {
      I = m;
    },
    enumerable: !0,
    configurable: !0
  });
  var v = E;
  Object.defineProperty(e, "FileReadStream", {
    get: function() {
      return v;
    },
    set: function(m) {
      v = m;
    },
    enumerable: !0,
    configurable: !0
  });
  var w = I;
  Object.defineProperty(e, "FileWriteStream", {
    get: function() {
      return w;
    },
    set: function(m) {
      w = m;
    },
    enumerable: !0,
    configurable: !0
  });
  function E(m, p) {
    return this instanceof E ? (s.apply(this, arguments), this) : E.apply(Object.create(E.prototype), arguments);
  }
  function W() {
    var m = this;
    ve(m.path, m.flags, m.mode, function(p, h) {
      p ? (m.autoClose && m.destroy(), m.emit("error", p)) : (m.fd = h, m.emit("open", h), m.read());
    });
  }
  function I(m, p) {
    return this instanceof I ? (y.apply(this, arguments), this) : I.apply(Object.create(I.prototype), arguments);
  }
  function re() {
    var m = this;
    ve(m.path, m.flags, m.mode, function(p, h) {
      p ? (m.destroy(), m.emit("error", p)) : (m.fd = h, m.emit("open", h));
    });
  }
  function Ie(m, p) {
    return new e.ReadStream(m, p);
  }
  function Re(m, p) {
    return new e.WriteStream(m, p);
  }
  var Mt = e.open;
  e.open = ve;
  function ve(m, p, h, x) {
    return typeof h == "function" && (x = h, h = null), T(m, p, h, x);
    function T(_, g, b, $, N) {
      return Mt(_, g, b, function(k, Di) {
        k && (k.code === "EMFILE" || k.code === "ENFILE") ? X([T, [_, g, b, $], k, N || Date.now(), Date.now()]) : typeof $ == "function" && $.apply(this, arguments);
      });
    }
  }
  return e;
}
function X(e) {
  K("ENQUEUE", e[0].name, e[1]), P[C].push(e), _e();
}
var fe;
function We() {
  for (var e = Date.now(), t = 0; t < P[C].length; ++t)
    P[C][t].length > 2 && (P[C][t][3] = e, P[C][t][4] = e);
  _e();
}
function _e() {
  if (clearTimeout(fe), fe = void 0, P[C].length !== 0) {
    var e = P[C].shift(), t = e[0], n = e[1], i = e[2], r = e[3], o = e[4];
    if (r === void 0)
      K("RETRY", t.name, n), t.apply(null, n);
    else if (Date.now() - r >= 6e4) {
      K("TIMEOUT", t.name, n);
      var c = n.pop();
      typeof c == "function" && c.call(null, i);
    } else {
      var l = Date.now() - o, d = Math.max(o - r, 1), S = Math.min(d * 1.2, 100);
      l >= S ? (K("RETRY", t.name, n), t.apply(null, n.concat([r]))) : P[C].push(e);
    }
    fe === void 0 && (fe = setTimeout(_e, 0));
  }
}
(function(e) {
  const t = O.fromCallback, n = te, i = [
    "access",
    "appendFile",
    "chmod",
    "chown",
    "close",
    "copyFile",
    "cp",
    "fchmod",
    "fchown",
    "fdatasync",
    "fstat",
    "fsync",
    "ftruncate",
    "futimes",
    "glob",
    "lchmod",
    "lchown",
    "lutimes",
    "link",
    "lstat",
    "mkdir",
    "mkdtemp",
    "open",
    "opendir",
    "readdir",
    "readFile",
    "readlink",
    "realpath",
    "rename",
    "rm",
    "rmdir",
    "stat",
    "statfs",
    "symlink",
    "truncate",
    "unlink",
    "utimes",
    "writeFile"
  ].filter((r) => typeof n[r] == "function");
  Object.assign(e, n), i.forEach((r) => {
    e[r] = t(n[r]);
  }), e.exists = function(r, o) {
    return typeof o == "function" ? n.exists(r, o) : new Promise((c) => n.exists(r, c));
  }, e.read = function(r, o, c, l, d, S) {
    return typeof S == "function" ? n.read(r, o, c, l, d, S) : new Promise((a, u) => {
      n.read(r, o, c, l, d, (f, s, y) => {
        if (f) return u(f);
        a({ bytesRead: s, buffer: y });
      });
    });
  }, e.write = function(r, o, ...c) {
    return typeof c[c.length - 1] == "function" ? n.write(r, o, ...c) : new Promise((l, d) => {
      n.write(r, o, ...c, (S, a, u) => {
        if (S) return d(S);
        l({ bytesWritten: a, buffer: u });
      });
    });
  }, e.readv = function(r, o, ...c) {
    return typeof c[c.length - 1] == "function" ? n.readv(r, o, ...c) : new Promise((l, d) => {
      n.readv(r, o, ...c, (S, a, u) => {
        if (S) return d(S);
        l({ bytesRead: a, buffers: u });
      });
    });
  }, e.writev = function(r, o, ...c) {
    return typeof c[c.length - 1] == "function" ? n.writev(r, o, ...c) : new Promise((l, d) => {
      n.writev(r, o, ...c, (S, a, u) => {
        if (S) return d(S);
        l({ bytesWritten: a, buffers: u });
      });
    });
  }, typeof n.realpath.native == "function" ? e.realpath.native = t(n.realpath.native) : process.emitWarning(
    "fs.realpath.native is not a function. Is fs being monkey-patched?",
    "Warning",
    "fs-extra-WARN0003"
  );
})(A);
var De = {}, nt = {};
const mn = M;
nt.checkPath = function(t) {
  if (process.platform === "win32" && /[<>:"|?*]/.test(t.replace(mn.parse(t).root, ""))) {
    const i = new Error(`Path contains invalid characters: ${t}`);
    throw i.code = "EINVAL", i;
  }
};
const rt = A, { checkPath: it } = nt, ot = (e) => {
  const t = { mode: 511 };
  return typeof e == "number" ? e : { ...t, ...e }.mode;
};
De.makeDir = async (e, t) => (it(e), rt.mkdir(e, {
  mode: ot(t),
  recursive: !0
}));
De.makeDirSync = (e, t) => (it(e), rt.mkdirSync(e, {
  mode: ot(t),
  recursive: !0
}));
const dn = O.fromPromise, { makeDir: hn, makeDirSync: $e } = De, Ee = dn(hn);
var J = {
  mkdirs: Ee,
  mkdirsSync: $e,
  // alias
  mkdirp: Ee,
  mkdirpSync: $e,
  ensureDir: Ee,
  ensureDirSync: $e
};
const wn = O.fromPromise, ct = A;
function pn(e) {
  return ct.access(e).then(() => !0).catch(() => !1);
}
var z = {
  pathExists: wn(pn),
  pathExistsSync: ct.existsSync
};
const Q = A, Sn = O.fromPromise;
async function vn(e, t, n) {
  const i = await Q.open(e, "r+");
  let r = null;
  try {
    await Q.futimes(i, t, n);
  } finally {
    try {
      await Q.close(i);
    } catch (o) {
      r = o;
    }
  }
  if (r)
    throw r;
}
function $n(e, t, n) {
  const i = Q.openSync(e, "r+");
  return Q.futimesSync(i, t, n), Q.closeSync(i);
}
var at = {
  utimesMillis: Sn(vn),
  utimesMillisSync: $n
};
const Z = A, D = M, Me = O.fromPromise;
function En(e, t, n) {
  const i = n.dereference ? (r) => Z.stat(r, { bigint: !0 }) : (r) => Z.lstat(r, { bigint: !0 });
  return Promise.all([
    i(e),
    i(t).catch((r) => {
      if (r.code === "ENOENT") return null;
      throw r;
    })
  ]).then(([r, o]) => ({ srcStat: r, destStat: o }));
}
function kn(e, t, n) {
  let i;
  const r = n.dereference ? (c) => Z.statSync(c, { bigint: !0 }) : (c) => Z.lstatSync(c, { bigint: !0 }), o = r(e);
  try {
    i = r(t);
  } catch (c) {
    if (c.code === "ENOENT") return { srcStat: o, destStat: null };
    throw c;
  }
  return { srcStat: o, destStat: i };
}
async function gn(e, t, n, i) {
  const { srcStat: r, destStat: o } = await En(e, t, i);
  if (o) {
    if (ue(r, o)) {
      const c = D.basename(e), l = D.basename(t);
      if (n === "move" && c !== l && c.toLowerCase() === l.toLowerCase())
        return { srcStat: r, destStat: o, isChangingCase: !0 };
      throw new Error("Source and destination must not be the same.");
    }
    if (r.isDirectory() && !o.isDirectory())
      throw new Error(`Cannot overwrite non-directory '${t}' with directory '${e}'.`);
    if (!r.isDirectory() && o.isDirectory())
      throw new Error(`Cannot overwrite directory '${t}' with non-directory '${e}'.`);
  }
  if (r.isDirectory() && xe(e, t))
    throw new Error(we(e, t, n));
  return { srcStat: r, destStat: o };
}
function Pn(e, t, n, i) {
  const { srcStat: r, destStat: o } = kn(e, t, i);
  if (o) {
    if (ue(r, o)) {
      const c = D.basename(e), l = D.basename(t);
      if (n === "move" && c !== l && c.toLowerCase() === l.toLowerCase())
        return { srcStat: r, destStat: o, isChangingCase: !0 };
      throw new Error("Source and destination must not be the same.");
    }
    if (r.isDirectory() && !o.isDirectory())
      throw new Error(`Cannot overwrite non-directory '${t}' with directory '${e}'.`);
    if (!r.isDirectory() && o.isDirectory())
      throw new Error(`Cannot overwrite directory '${t}' with non-directory '${e}'.`);
  }
  if (r.isDirectory() && xe(e, t))
    throw new Error(we(e, t, n));
  return { srcStat: r, destStat: o };
}
async function st(e, t, n, i) {
  const r = D.resolve(D.dirname(e)), o = D.resolve(D.dirname(n));
  if (o === r || o === D.parse(o).root) return;
  let c;
  try {
    c = await Z.stat(o, { bigint: !0 });
  } catch (l) {
    if (l.code === "ENOENT") return;
    throw l;
  }
  if (ue(t, c))
    throw new Error(we(e, n, i));
  return st(e, t, o, i);
}
function ut(e, t, n, i) {
  const r = D.resolve(D.dirname(e)), o = D.resolve(D.dirname(n));
  if (o === r || o === D.parse(o).root) return;
  let c;
  try {
    c = Z.statSync(o, { bigint: !0 });
  } catch (l) {
    if (l.code === "ENOENT") return;
    throw l;
  }
  if (ue(t, c))
    throw new Error(we(e, n, i));
  return ut(e, t, o, i);
}
function ue(e, t) {
  return t.ino !== void 0 && t.dev !== void 0 && t.ino === e.ino && t.dev === e.dev;
}
function xe(e, t) {
  const n = D.resolve(e).split(D.sep).filter((r) => r), i = D.resolve(t).split(D.sep).filter((r) => r);
  return n.every((r, o) => i[o] === r);
}
function we(e, t, n) {
  return `Cannot ${n} '${e}' to a subdirectory of itself, '${t}'.`;
}
var ne = {
  // checkPaths
  checkPaths: Me(gn),
  checkPathsSync: Pn,
  // checkParent
  checkParentPaths: Me(st),
  checkParentPathsSync: ut,
  // Misc
  isSrcSubdir: xe,
  areIdentical: ue
};
async function Fn(e, t) {
  const n = [];
  for await (const i of e)
    n.push(
      t(i).then(
        () => null,
        (r) => r ?? new Error("unknown error")
      )
    );
  await Promise.all(
    n.map(
      (i) => i.then((r) => {
        if (r !== null) throw r;
      })
    )
  );
}
var bn = {
  asyncIteratorConcurrentProcess: Fn
};
const j = A, oe = M, { mkdirs: On } = J, { pathExists: _n } = z, { utimesMillis: Dn } = at, ce = ne, { asyncIteratorConcurrentProcess: xn } = bn;
async function Tn(e, t, n = {}) {
  typeof n == "function" && (n = { filter: n }), n.clobber = "clobber" in n ? !!n.clobber : !0, n.overwrite = "overwrite" in n ? !!n.overwrite : n.clobber, n.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0001"
  );
  const { srcStat: i, destStat: r } = await ce.checkPaths(e, t, "copy", n);
  if (await ce.checkParentPaths(e, i, t, "copy"), !await lt(e, t, n)) return;
  const c = oe.dirname(t);
  await _n(c) || await On(c), await ft(r, e, t, n);
}
async function lt(e, t, n) {
  return n.filter ? n.filter(e, t) : !0;
}
async function ft(e, t, n, i) {
  const o = await (i.dereference ? j.stat : j.lstat)(t);
  if (o.isDirectory()) return In(o, e, t, n, i);
  if (o.isFile() || o.isCharacterDevice() || o.isBlockDevice()) return Nn(o, e, t, n, i);
  if (o.isSymbolicLink()) return Rn(e, t, n, i);
  throw o.isSocket() ? new Error(`Cannot copy a socket file: ${t}`) : o.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${t}`) : new Error(`Unknown file: ${t}`);
}
async function Nn(e, t, n, i, r) {
  if (!t) return Ue(e, n, i, r);
  if (r.overwrite)
    return await j.unlink(i), Ue(e, n, i, r);
  if (r.errorOnExist)
    throw new Error(`'${i}' already exists`);
}
async function Ue(e, t, n, i) {
  if (await j.copyFile(t, n), i.preserveTimestamps) {
    Cn(e.mode) && await jn(n, e.mode);
    const r = await j.stat(t);
    await Dn(n, r.atime, r.mtime);
  }
  return j.chmod(n, e.mode);
}
function Cn(e) {
  return (e & 128) === 0;
}
function jn(e, t) {
  return j.chmod(e, t | 128);
}
async function In(e, t, n, i, r) {
  t || await j.mkdir(i), await xn(await j.opendir(n), async (o) => {
    const c = oe.join(n, o.name), l = oe.join(i, o.name);
    if (await lt(c, l, r)) {
      const { destStat: S } = await ce.checkPaths(c, l, "copy", r);
      await ft(S, c, l, r);
    }
  }), t || await j.chmod(i, e.mode);
}
async function Rn(e, t, n, i) {
  let r = await j.readlink(t);
  if (i.dereference && (r = oe.resolve(process.cwd(), r)), !e)
    return j.symlink(r, n);
  let o = null;
  try {
    o = await j.readlink(n);
  } catch (c) {
    if (c.code === "EINVAL" || c.code === "UNKNOWN") return j.symlink(r, n);
    throw c;
  }
  if (i.dereference && (o = oe.resolve(process.cwd(), o)), ce.isSrcSubdir(r, o))
    throw new Error(`Cannot copy '${r}' to a subdirectory of itself, '${o}'.`);
  if (ce.isSrcSubdir(o, r))
    throw new Error(`Cannot overwrite '${o}' with '${r}'.`);
  return await j.unlink(n), j.symlink(r, n);
}
var Ln = Tn;
const R = te, ae = M, An = J.mkdirsSync, Wn = at.utimesMillisSync, se = ne;
function Mn(e, t, n) {
  typeof n == "function" && (n = { filter: n }), n = n || {}, n.clobber = "clobber" in n ? !!n.clobber : !0, n.overwrite = "overwrite" in n ? !!n.overwrite : n.clobber, n.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0002"
  );
  const { srcStat: i, destStat: r } = se.checkPathsSync(e, t, "copy", n);
  if (se.checkParentPathsSync(e, i, t, "copy"), n.filter && !n.filter(e, t)) return;
  const o = ae.dirname(t);
  return R.existsSync(o) || An(o), yt(r, e, t, n);
}
function yt(e, t, n, i) {
  const o = (i.dereference ? R.statSync : R.lstatSync)(t);
  if (o.isDirectory()) return Yn(o, e, t, n, i);
  if (o.isFile() || o.isCharacterDevice() || o.isBlockDevice()) return Un(o, e, t, n, i);
  if (o.isSymbolicLink()) return zn(e, t, n, i);
  throw o.isSocket() ? new Error(`Cannot copy a socket file: ${t}`) : o.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${t}`) : new Error(`Unknown file: ${t}`);
}
function Un(e, t, n, i, r) {
  return t ? Bn(e, n, i, r) : mt(e, n, i, r);
}
function Bn(e, t, n, i) {
  if (i.overwrite)
    return R.unlinkSync(n), mt(e, t, n, i);
  if (i.errorOnExist)
    throw new Error(`'${n}' already exists`);
}
function mt(e, t, n, i) {
  return R.copyFileSync(t, n), i.preserveTimestamps && Jn(e.mode, t, n), Te(n, e.mode);
}
function Jn(e, t, n) {
  return Vn(e) && qn(n, e), Hn(t, n);
}
function Vn(e) {
  return (e & 128) === 0;
}
function qn(e, t) {
  return Te(e, t | 128);
}
function Te(e, t) {
  return R.chmodSync(e, t);
}
function Hn(e, t) {
  const n = R.statSync(e);
  return Wn(t, n.atime, n.mtime);
}
function Yn(e, t, n, i, r) {
  return t ? dt(n, i, r) : Gn(e.mode, n, i, r);
}
function Gn(e, t, n, i) {
  return R.mkdirSync(n), dt(t, n, i), Te(n, e);
}
function dt(e, t, n) {
  const i = R.opendirSync(e);
  try {
    let r;
    for (; (r = i.readSync()) !== null; )
      Kn(r.name, e, t, n);
  } finally {
    i.closeSync();
  }
}
function Kn(e, t, n, i) {
  const r = ae.join(t, e), o = ae.join(n, e);
  if (i.filter && !i.filter(r, o)) return;
  const { destStat: c } = se.checkPathsSync(r, o, "copy", i);
  return yt(c, r, o, i);
}
function zn(e, t, n, i) {
  let r = R.readlinkSync(t);
  if (i.dereference && (r = ae.resolve(process.cwd(), r)), e) {
    let o;
    try {
      o = R.readlinkSync(n);
    } catch (c) {
      if (c.code === "EINVAL" || c.code === "UNKNOWN") return R.symlinkSync(r, n);
      throw c;
    }
    if (i.dereference && (o = ae.resolve(process.cwd(), o)), se.isSrcSubdir(r, o))
      throw new Error(`Cannot copy '${r}' to a subdirectory of itself, '${o}'.`);
    if (se.isSrcSubdir(o, r))
      throw new Error(`Cannot overwrite '${o}' with '${r}'.`);
    return Xn(r, n);
  } else
    return R.symlinkSync(r, n);
}
function Xn(e, t) {
  return R.unlinkSync(t), R.symlinkSync(e, t);
}
var Qn = Mn;
const Zn = O.fromPromise;
var Ne = {
  copy: Zn(Ln),
  copySync: Qn
};
const ht = te, er = O.fromCallback;
function tr(e, t) {
  ht.rm(e, { recursive: !0, force: !0 }, t);
}
function nr(e) {
  ht.rmSync(e, { recursive: !0, force: !0 });
}
var pe = {
  remove: er(tr),
  removeSync: nr
};
const rr = O.fromPromise, wt = A, pt = M, St = J, vt = pe, Be = rr(async function(t) {
  let n;
  try {
    n = await wt.readdir(t);
  } catch {
    return St.mkdirs(t);
  }
  return Promise.all(n.map((i) => vt.remove(pt.join(t, i))));
});
function Je(e) {
  let t;
  try {
    t = wt.readdirSync(e);
  } catch {
    return St.mkdirsSync(e);
  }
  t.forEach((n) => {
    n = pt.join(e, n), vt.removeSync(n);
  });
}
var ir = {
  emptyDirSync: Je,
  emptydirSync: Je,
  emptyDir: Be,
  emptydir: Be
};
const or = O.fromPromise, $t = M, V = A, Et = J;
async function cr(e) {
  let t;
  try {
    t = await V.stat(e);
  } catch {
  }
  if (t && t.isFile()) return;
  const n = $t.dirname(e);
  let i = null;
  try {
    i = await V.stat(n);
  } catch (r) {
    if (r.code === "ENOENT") {
      await Et.mkdirs(n), await V.writeFile(e, "");
      return;
    } else
      throw r;
  }
  i.isDirectory() ? await V.writeFile(e, "") : await V.readdir(n);
}
function ar(e) {
  let t;
  try {
    t = V.statSync(e);
  } catch {
  }
  if (t && t.isFile()) return;
  const n = $t.dirname(e);
  try {
    V.statSync(n).isDirectory() || V.readdirSync(n);
  } catch (i) {
    if (i && i.code === "ENOENT") Et.mkdirsSync(n);
    else throw i;
  }
  V.writeFileSync(e, "");
}
var sr = {
  createFile: or(cr),
  createFileSync: ar
};
const ur = O.fromPromise, kt = M, Y = A, gt = J, { pathExists: lr } = z, { areIdentical: Pt } = ne;
async function fr(e, t) {
  let n;
  try {
    n = await Y.lstat(t);
  } catch {
  }
  let i;
  try {
    i = await Y.lstat(e);
  } catch (c) {
    throw c.message = c.message.replace("lstat", "ensureLink"), c;
  }
  if (n && Pt(i, n)) return;
  const r = kt.dirname(t);
  await lr(r) || await gt.mkdirs(r), await Y.link(e, t);
}
function yr(e, t) {
  let n;
  try {
    n = Y.lstatSync(t);
  } catch {
  }
  try {
    const o = Y.lstatSync(e);
    if (n && Pt(o, n)) return;
  } catch (o) {
    throw o.message = o.message.replace("lstat", "ensureLink"), o;
  }
  const i = kt.dirname(t);
  return Y.existsSync(i) || gt.mkdirsSync(i), Y.linkSync(e, t);
}
var mr = {
  createLink: ur(fr),
  createLinkSync: yr
};
const G = M, ie = A, { pathExists: dr } = z, hr = O.fromPromise;
async function wr(e, t) {
  if (G.isAbsolute(e)) {
    try {
      await ie.lstat(e);
    } catch (o) {
      throw o.message = o.message.replace("lstat", "ensureSymlink"), o;
    }
    return {
      toCwd: e,
      toDst: e
    };
  }
  const n = G.dirname(t), i = G.join(n, e);
  if (await dr(i))
    return {
      toCwd: i,
      toDst: e
    };
  try {
    await ie.lstat(e);
  } catch (o) {
    throw o.message = o.message.replace("lstat", "ensureSymlink"), o;
  }
  return {
    toCwd: e,
    toDst: G.relative(n, e)
  };
}
function pr(e, t) {
  if (G.isAbsolute(e)) {
    if (!ie.existsSync(e)) throw new Error("absolute srcpath does not exist");
    return {
      toCwd: e,
      toDst: e
    };
  }
  const n = G.dirname(t), i = G.join(n, e);
  if (ie.existsSync(i))
    return {
      toCwd: i,
      toDst: e
    };
  if (!ie.existsSync(e)) throw new Error("relative srcpath does not exist");
  return {
    toCwd: e,
    toDst: G.relative(n, e)
  };
}
var Sr = {
  symlinkPaths: hr(wr),
  symlinkPathsSync: pr
};
const Ft = A, vr = O.fromPromise;
async function $r(e, t) {
  if (t) return t;
  let n;
  try {
    n = await Ft.lstat(e);
  } catch {
    return "file";
  }
  return n && n.isDirectory() ? "dir" : "file";
}
function Er(e, t) {
  if (t) return t;
  let n;
  try {
    n = Ft.lstatSync(e);
  } catch {
    return "file";
  }
  return n && n.isDirectory() ? "dir" : "file";
}
var kr = {
  symlinkType: vr($r),
  symlinkTypeSync: Er
};
const gr = O.fromPromise, bt = M, B = A, { mkdirs: Pr, mkdirsSync: Fr } = J, { symlinkPaths: br, symlinkPathsSync: Or } = Sr, { symlinkType: _r, symlinkTypeSync: Dr } = kr, { pathExists: xr } = z, { areIdentical: Ot } = ne;
async function Tr(e, t, n) {
  let i;
  try {
    i = await B.lstat(t);
  } catch {
  }
  if (i && i.isSymbolicLink()) {
    const [l, d] = await Promise.all([
      B.stat(e),
      B.stat(t)
    ]);
    if (Ot(l, d)) return;
  }
  const r = await br(e, t);
  e = r.toDst;
  const o = await _r(r.toCwd, n), c = bt.dirname(t);
  return await xr(c) || await Pr(c), B.symlink(e, t, o);
}
function Nr(e, t, n) {
  let i;
  try {
    i = B.lstatSync(t);
  } catch {
  }
  if (i && i.isSymbolicLink()) {
    const l = B.statSync(e), d = B.statSync(t);
    if (Ot(l, d)) return;
  }
  const r = Or(e, t);
  e = r.toDst, n = Dr(r.toCwd, n);
  const o = bt.dirname(t);
  return B.existsSync(o) || Fr(o), B.symlinkSync(e, t, n);
}
var Cr = {
  createSymlink: gr(Tr),
  createSymlinkSync: Nr
};
const { createFile: Ve, createFileSync: qe } = sr, { createLink: He, createLinkSync: Ye } = mr, { createSymlink: Ge, createSymlinkSync: Ke } = Cr;
var jr = {
  // file
  createFile: Ve,
  createFileSync: qe,
  ensureFile: Ve,
  ensureFileSync: qe,
  // link
  createLink: He,
  createLinkSync: Ye,
  ensureLink: He,
  ensureLinkSync: Ye,
  // symlink
  createSymlink: Ge,
  createSymlinkSync: Ke,
  ensureSymlink: Ge,
  ensureSymlinkSync: Ke
};
function Ir(e, { EOL: t = `
`, finalEOL: n = !0, replacer: i = null, spaces: r } = {}) {
  const o = n ? t : "";
  return JSON.stringify(e, i, r).replace(/\n/g, t) + o;
}
function Rr(e) {
  return Buffer.isBuffer(e) && (e = e.toString("utf8")), e.replace(/^\uFEFF/, "");
}
var Ce = { stringify: Ir, stripBom: Rr };
let ee;
try {
  ee = te;
} catch {
  ee = et;
}
const Se = O, { stringify: _t, stripBom: Dt } = Ce;
async function Lr(e, t = {}) {
  typeof t == "string" && (t = { encoding: t });
  const n = t.fs || ee, i = "throws" in t ? t.throws : !0;
  let r = await Se.fromCallback(n.readFile)(e, t);
  r = Dt(r);
  let o;
  try {
    o = JSON.parse(r, t ? t.reviver : null);
  } catch (c) {
    if (i)
      throw c.message = `${e}: ${c.message}`, c;
    return null;
  }
  return o;
}
const Ar = Se.fromPromise(Lr);
function Wr(e, t = {}) {
  typeof t == "string" && (t = { encoding: t });
  const n = t.fs || ee, i = "throws" in t ? t.throws : !0;
  try {
    let r = n.readFileSync(e, t);
    return r = Dt(r), JSON.parse(r, t.reviver);
  } catch (r) {
    if (i)
      throw r.message = `${e}: ${r.message}`, r;
    return null;
  }
}
async function Mr(e, t, n = {}) {
  const i = n.fs || ee, r = _t(t, n);
  await Se.fromCallback(i.writeFile)(e, r, n);
}
const Ur = Se.fromPromise(Mr);
function Br(e, t, n = {}) {
  const i = n.fs || ee, r = _t(t, n);
  return i.writeFileSync(e, r, n);
}
var Jr = {
  readFile: Ar,
  readFileSync: Wr,
  writeFile: Ur,
  writeFileSync: Br
};
const ye = Jr;
var Vr = {
  // jsonfile exports
  readJson: ye.readFile,
  readJsonSync: ye.readFileSync,
  writeJson: ye.writeFile,
  writeJsonSync: ye.writeFileSync
};
const qr = O.fromPromise, Pe = A, xt = M, Tt = J, Hr = z.pathExists;
async function Yr(e, t, n = "utf-8") {
  const i = xt.dirname(e);
  return await Hr(i) || await Tt.mkdirs(i), Pe.writeFile(e, t, n);
}
function Gr(e, ...t) {
  const n = xt.dirname(e);
  Pe.existsSync(n) || Tt.mkdirsSync(n), Pe.writeFileSync(e, ...t);
}
var je = {
  outputFile: qr(Yr),
  outputFileSync: Gr
};
const { stringify: Kr } = Ce, { outputFile: zr } = je;
async function Xr(e, t, n = {}) {
  const i = Kr(t, n);
  await zr(e, i, n);
}
var Qr = Xr;
const { stringify: Zr } = Ce, { outputFileSync: ei } = je;
function ti(e, t, n) {
  const i = Zr(t, n);
  ei(e, i, n);
}
var ni = ti;
const ri = O.fromPromise, L = Vr;
L.outputJson = ri(Qr);
L.outputJsonSync = ni;
L.outputJSON = L.outputJson;
L.outputJSONSync = L.outputJsonSync;
L.writeJSON = L.writeJson;
L.writeJSONSync = L.writeJsonSync;
L.readJSON = L.readJson;
L.readJSONSync = L.readJsonSync;
var ii = L;
const oi = A, ze = M, { copy: ci } = Ne, { remove: Nt } = pe, { mkdirp: ai } = J, { pathExists: si } = z, Xe = ne;
async function ui(e, t, n = {}) {
  const i = n.overwrite || n.clobber || !1, { srcStat: r, isChangingCase: o = !1 } = await Xe.checkPaths(e, t, "move", n);
  await Xe.checkParentPaths(e, r, t, "move");
  const c = ze.dirname(t);
  return ze.parse(c).root !== c && await ai(c), li(e, t, i, o);
}
async function li(e, t, n, i) {
  if (!i) {
    if (n)
      await Nt(t);
    else if (await si(t))
      throw new Error("dest already exists.");
  }
  try {
    await oi.rename(e, t);
  } catch (r) {
    if (r.code !== "EXDEV")
      throw r;
    await fi(e, t, n);
  }
}
async function fi(e, t, n) {
  return await ci(e, t, {
    overwrite: n,
    errorOnExist: !0,
    preserveTimestamps: !0
  }), Nt(e);
}
var yi = ui;
const Ct = te, Fe = M, mi = Ne.copySync, jt = pe.removeSync, di = J.mkdirpSync, Qe = ne;
function hi(e, t, n) {
  n = n || {};
  const i = n.overwrite || n.clobber || !1, { srcStat: r, isChangingCase: o = !1 } = Qe.checkPathsSync(e, t, "move", n);
  return Qe.checkParentPathsSync(e, r, t, "move"), wi(t) || di(Fe.dirname(t)), pi(e, t, i, o);
}
function wi(e) {
  const t = Fe.dirname(e);
  return Fe.parse(t).root === t;
}
function pi(e, t, n, i) {
  if (i) return ke(e, t, n);
  if (n)
    return jt(t), ke(e, t, n);
  if (Ct.existsSync(t)) throw new Error("dest already exists.");
  return ke(e, t, n);
}
function ke(e, t, n) {
  try {
    Ct.renameSync(e, t);
  } catch (i) {
    if (i.code !== "EXDEV") throw i;
    return Si(e, t, n);
  }
}
function Si(e, t, n) {
  return mi(e, t, {
    overwrite: n,
    errorOnExist: !0,
    preserveTimestamps: !0
  }), jt(e);
}
var vi = hi;
const $i = O.fromPromise;
var Ei = {
  move: $i(yi),
  moveSync: vi
}, U = {
  // Export promiseified graceful-fs:
  ...A,
  // Export extra methods:
  ...Ne,
  ...ir,
  ...jr,
  ...ii,
  ...J,
  ...Ei,
  ...je,
  ...z,
  ...pe
};
const ki = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff"], gi = [".jpg", ".jpeg", ".png", ".webp"];
async function It(e, t, n, i = {}) {
  try {
    if (!U.existsSync(e))
      throw new Error(`文件不存在: ${e}`);
    const r = F.extname(e).toLowerCase();
    if (console.log(r), !ki.includes(r))
      throw new Error(`不支持的输入格式: ${r}`);
    const o = F.extname(t).toLowerCase();
    if (!gi.includes(o))
      throw new Error(`不支持的输出格式: ${o}`);
    let c = Gt(e);
    switch ((n === ".jpg" || n === ".jpeg") && (c = c.flatten({
      background: i.backgroundColor ?? { r: 255, g: 255, b: 255 }
    })), n) {
      case ".jpg":
      case ".jpeg":
        c = c.jpeg({ quality: i.quality ?? 90, mozjpeg: !0 });
        break;
      case ".png":
        c = c.png({ quality: i.quality ?? 90 });
        break;
      case ".webp":
        c = c.webp({ quality: i.quality ?? 90 });
        break;
    }
    await c.toFile(t);
    const l = U.statSync(e).size / 1024, d = U.statSync(t).size / 1024;
    return { success: !0, message: [`转换成功 ${t} 原始大小: ${l.toFixed(2)} KB -> 转换后大小: ${d.toFixed(2)} KB`] };
  } catch (r) {
    return console.error(`转换失败 ${F.basename(e)}: ${r instanceof Error ? r.message : "未知错误"}`), { success: !1, error: r instanceof Error ? r.message : "未知错误" };
  }
}
const Pi = /* @__PURE__ */ new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff"]);
function Rt(e) {
  return e.startsWith(".") ? e : `.${e}`;
}
async function Fi(e, t, n) {
  const i = Rt(t), r = F.dirname(e), o = F.extname(e), c = F.basename(e, o), l = F.join(r, `${c}-压缩${i}`);
  return await It(e, l, i, {
    backgroundColor: { r: 255, g: 255, b: 255 },
    quality: n
  });
}
async function bi(e, t, n) {
  const i = Rt(t), r = `${e}-压缩`;
  await U.pathExists(r) && await U.remove(r), await U.ensureDir(r);
  const o = [];
  async function c(l, d) {
    const S = await U.readdir(l);
    for (const a of S) {
      const u = F.join(l, a), f = await U.stat(u), s = F.join(d, a);
      if (f.isDirectory()) {
        await U.ensureDir(s), await c(u, s);
        continue;
      }
      const y = F.extname(u).toLowerCase();
      if (!Pi.has(y)) {
        await U.copy(u, s);
        continue;
      }
      const v = F.basename(u, y), w = F.join(d, `${v}${i}`), E = await It(u, w, i, {
        backgroundColor: { r: 255, g: 255, b: 255 },
        quality: n
      });
      o.push(E);
    }
  }
  return await c(e, r), { outputDir: r, results: o };
}
async function Oi(e, t, n) {
  const i = [];
  for (const o of e)
    i.push(bi(o, t, n));
  return await Promise.all(i);
}
function _i() {
  Bt.handle("open:dialog", async (e, t, n, i) => {
    const r = await Jt.showOpenDialog({
      properties: i === "file" ? ["openFile"] : ["openDirectory"]
    });
    return r.canceled ? !1 : i === "file" ? await Fi(r.filePaths[0], t, n) : await Oi(r.filePaths, t, n);
  });
}
const Lt = F.dirname(Ut(import.meta.url));
process.env.APP_ROOT = F.join(Lt, "..");
const be = process.env.VITE_DEV_SERVER_URL, Mi = F.join(process.env.APP_ROOT, "dist-electron"), At = F.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = be ? F.join(process.env.APP_ROOT, "public") : At;
let H;
function Wt() {
  H = new Ze({
    icon: F.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: F.join(Lt, "preload.mjs")
    }
  }), H.webContents.on("did-finish-load", () => {
    H == null || H.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), be ? H.loadURL(be) : H.loadFile(F.join(At, "index.html"));
}
de.on("window-all-closed", () => {
  process.platform !== "darwin" && (de.quit(), H = null);
});
de.on("activate", () => {
  Ze.getAllWindows().length === 0 && Wt();
});
de.whenReady().then(() => {
  Xt(), Wt(), _i();
});
export {
  Mi as MAIN_DIST,
  At as RENDERER_DIST,
  be as VITE_DEV_SERVER_URL
};
