#!/usr/bin/env python3
"""Regenerate dashboard/index.html as a self-contained control panel.

Reads factory data files and embeds them as a JSON blob in the page.
Run hourly:  python3 /home/ubuntu/factory/dashboard/build_dashboard.py
"""
import json
import os
import re
from collections import Counter
from datetime import datetime, timezone

FACTORY = "/home/ubuntu/factory"
OUT = os.path.join(FACTORY, "dashboard", "index.html")

def load_jsonl(path):
    out = []
    if not os.path.exists(path):
        return out
    for line in open(path):
        line = line.strip()
        if line:
            try:
                out.append(json.loads(line))
            except json.JSONDecodeError:
                pass
    return out

# ---------- load data ----------
stats = {}
try:
    stats = json.load(open(os.path.join(FACTORY, "stats.json")))
except Exception:
    pass

leads = []
with open(os.path.join(FACTORY, "leads.json")) as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        try:
            leads.append(json.loads(line))
        except json.JSONDecodeError:
            pass

pitches = load_jsonl(os.path.join(FACTORY, "pitch_log.jsonl"))

audit = []
try:
    audit = json.load(open(os.path.join(FACTORY, "audit.json")))
except Exception:
    pass

lessons_raw = ""
lp = os.path.join(FACTORY, "lessons.md")
if os.path.exists(lp):
    lessons_raw = open(lp).read()

generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

# ---------- derive per-lead status ----------
pitches_by_lead = {}
for p in pitches:
    pitches_by_lead.setdefault(p.get("lead", ""), []).append(p)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

for l in leads:
    email_ok = bool(l.get("email") and EMAIL_RE.match(l["email"]))
    lp_ = pitches_by_lead.get(l.get("name"), [])
    l["_email_found"] = bool(email_ok)
    l["_pitched"] = len(lp_) > 0
    l["_awaiting"] = any(p.get("ok") for p in lp_)
    l["_send_failed"] = any(not p.get("ok") for p in lp_)
    # normalize malformed emails out of display
    if l.get("email") and not EMAIL_RE.match(l["email"]):
        l["_bad_email"] = l["email"]
        l["email"] = ""

# ---------- sites grid ----------
slug_to_lead = {}
def slugify(name):
    return re.sub(r"-{2,}", "-", re.sub(r"[^a-z0-9]+", "-", name.lower())).strip("-")

lead_by_slug = {slugify(l["name"]): l for l in leads}
pitch_by_url = {}
for p in pitches:
    u = p.get("url")
    if u:
        cur = pitch_by_url.get(u)
        ts = p.get("ts", 0)
        if cur is None or ts >= cur.get("ts", 0):
            pitch_by_url[u] = p

sites = []
for a in audit:
    url = a.get("url", "")
    proj = a.get("project", "")
    lead = lead_by_slug.get(proj)
    http = a.get("http")
    verdict = "FAIL" if http != 200 else ("NEEDS REBUILD" if a.get("verdict") == "rebuild" else "PASS")
    pp = pitch_by_url.get(url)
    sites.append({
        "project": proj,
        "url": url,
        "http": http,
        "category": a.get("category", ""),
        "size_bytes": a.get("size_bytes"),
        "verdict": verdict,
        "reasons": [r for r in a.get("reasons", []) if r.startswith("why:") or r.startswith("text_chars") or r.startswith("subpages")] or a.get("reasons", []),
        "pages_found": a.get("pages_found", []),
        "business": lead.get("name", proj.replace("-", " ").title()) if lead else proj.replace("-", " ").title(),
        "city": lead.get("city", "") if lead else "",
        "state": lead.get("state", "") if lead else "",
        "built_at": datetime.fromtimestamp(pp["ts"], tz=timezone.utc).strftime("%Y-%m-%d %H:%M") if pp else "",
        "pitched": bool(pp),
        "pitch_ok": bool(pp and pp.get("ok")),
        "pitched_to": pp.get("to", "") if pp else "",
    })
sites.sort(key=lambda s: s["business"].lower())

# ---------- pitches timeline (chronological) ----------
timeline = sorted(pitches, key=lambda p: p.get("ts", 0))
timeline = [{
    "lead": p.get("lead", ""),
    "to": p.get("to", ""),
    "url": p.get("url", ""),
    "agent": p.get("agent", ""),
    "ts": p.get("ts"),
    "when": datetime.fromtimestamp(p["ts"], tz=timezone.utc).strftime("%Y-%m-%d %H:%M") if p.get("ts") else "",
    "ok": bool(p.get("ok")),
} for p in timeline]

# ---------- overview numbers ----------
cats = Counter(l.get("category", "?") for l in leads)
sites_built = len(sites)
pitches_sent = len(pitches)
pending_reply = sum(1 for l in leads if l["_awaiting"])
dead_sites = [s for s in sites if s["http"] != 200]
rebuild_queue = sum(1 for s in sites if s["verdict"] == "NEEDS REBUILD" or s["verdict"] == "FAIL")
failed_sends = [p for p in pitches if not p.get("ok")]

DATA = {
    "generated_at": generated_at,
    "overview": {
        "total_leads": len(leads),
        "per_category": dict(cats.most_common()),
        "sites_built": sites_built,
        "pitches_sent": pitches_sent,
        "pitches_delivered": sum(1 for p in pitches if p.get("ok")),
        "pitches_failed": len(failed_sends),
        "pending_reply": pending_reply,
        "dead_sites": len(dead_sites),
        "rebuild_queue": rebuild_queue,
    },
    "leads": leads,
    "sites": sites,
    "pitches": timeline,
    "dead_sites": [{"project": s["project"], "url": s["url"], "http": s["http"]} for s in dead_sites],
    "failed_sends": failed_sends,
    "lessons_md": lessons_raw,
}

BLOB = json.dumps(DATA, ensure_ascii=False).replace("</", "<\\/")

TEMPLATE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "template.html")
html = open(TEMPLATE_PATH).read()
html = html.replace("__GENERATED_AT__", generated_at).replace("__DATA_BLOB__", BLOB)
with open(OUT, "w") as f:
    f.write(html)

print(f"Wrote {OUT} ({os.path.getsize(OUT)} bytes), generated {generated_at}")
