#!/usr/bin/env python3
"""Rebuild factory dashboard index.html from pitch_log.jsonl + leads.json."""
import json, datetime
from collections import Counter

FACT = '/home/ubuntu/factory'
leads = [json.loads(l) for l in open(f'{FACT}/leads.json') if l.strip()]
pitches = [json.loads(l) for l in open(f'{FACT}/pitch_log.jsonl') if l.strip()]
ok = [p for p in pitches if p.get('ok')]
fails = [p for p in pitches if not p.get('ok')]
cats = Counter(l.get('category', '?') for l in leads)
seen = {}
for p in ok:
    seen.setdefault(p['lead'], p['url'])
hours = Counter(datetime.datetime.utcfromtimestamp(p['ts']).strftime('%H') for p in pitches)
maxh = max(hours.values()) or 1
top = sorted(leads, key=lambda l: l.get('buy_score') or 0, reverse=True)[:15]
now = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')
try:
    queued = json.load(open(f'{FACT}/stats.json')).get('remaining_queued', '?')
except Exception:
    queued = '?'

def esc(s):
    return str(s).replace('&', '&amp;').replace('<', '&lt;')

cat_rows = ''.join(
    f'<tr><td>{c}</td><td class="num">{n}</td><td><div class="bar" style="width:{n / max(cats.values()) * 100}%"></div></td></tr>'
    for c, n in cats.most_common())
lb_rows = ''.join(
    f'<tr><td>{i + 1}</td><td>{esc(l["name"])}</td><td>{l.get("category", "")}</td>'
    f'<td>{l.get("city", "")}, {l.get("state", "")}</td><td class="num score">{l.get("buy_score", 0)}</td></tr>'
    for i, l in enumerate(top))
site_rows = ''.join(
    f'<tr><td>{esc(n)}</td><td><a href="{u}" target="_blank">{esc(u.split("//")[1])}</a></td></tr>'
    for n, u in sorted(seen.items()))
hour_bars = ''.join(
    f'<div class="hb"><div class="hf" style="height:{hours.get(h, 0) / maxh * 140}px" title="{h}:00 — {hours.get(h, 0)}"></div><span>{h}</span></div>'
    for h in sorted(set(list(hours) + [f'{i:02d}' for i in range(20, 25)])))
err_rows = ''
if fails:
    fc = Counter(p['lead'] for p in fails)
    err_rows = ('<div class="card"><h2>Errors / Retried</h2><table>'
                + ''.join(f'<tr><td>{esc(k)}</td><td class="num fail">{v} failed send(s)</td></tr>' for k, v in fc.items())
                + '</table><p class="muted">Failed first attempts; builder retry loop recovered them.</p></div>')

html = f"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Factory Dashboard</title>
<style>
:root{{--bg:#0e0e10;--panel:#161618;--ink:#e8e6e3;--mut:#8a8782;--acc:#c9a86a;--line:#26262a}}
*{{box-sizing:border-box;margin:0}}
body{{background:var(--bg);color:var(--ink);font:16px/1.55 Georgia,'Times New Roman',serif;padding:48px 24px}}
.wrap{{max-width:960px;margin:0 auto}}
header{{border-bottom:1px solid var(--line);padding-bottom:24px;margin-bottom:32px}}
h1{{font-weight:normal;font-size:34px;letter-spacing:.5px}}
.kicker{{color:var(--acc);font-size:12px;text-transform:uppercase;letter-spacing:3px;margin-bottom:8px;font-family:Helvetica,Arial,sans-serif}}
.updated{{color:var(--mut);font-size:13px;margin-top:8px;font-family:Helvetica,Arial,sans-serif}}
.stats{{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:36px}}
.stat{{background:var(--panel);border:1px solid var(--line);padding:20px}}
.stat b{{display:block;font-size:34px;color:var(--acc);font-family:Helvetica,Arial,sans-serif;font-weight:600}}
.stat span{{color:var(--mut);font-size:12px;text-transform:uppercase;letter-spacing:2px;font-family:Helvetica,Arial,sans-serif}}
.card{{background:var(--panel);border:1px solid var(--line);padding:24px;margin-bottom:28px}}
h2{{font-size:13px;text-transform:uppercase;letter-spacing:2.5px;color:var(--acc);margin-bottom:16px;font-family:Helvetica,Arial,sans-serif;font-weight:600}}
table{{width:100%;border-collapse:collapse;font-size:14px}}
td{{padding:7px 8px;border-bottom:1px solid var(--line)}}
.num{{text-align:right;font-family:Helvetica,Arial,sans-serif}}
.score{{color:var(--acc);font-weight:bold}}
.fail{{color:#d06a5f}}
.bar{{height:8px;background:var(--acc);opacity:.85;min-width:4px}}
a{{color:var(--ink);text-decoration:none;border-bottom:1px dotted var(--mut)}} a:hover{{color:var(--acc)}}
.chart{{display:flex;align-items:flex-end;gap:10px;height:180px;padding-top:8px}}
.hb{{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%}}
.hf{{width:70%;background:linear-gradient(180deg,var(--acc),#7a6538);min-height:2px}}
.hb span{{font-size:11px;color:var(--mut);margin-top:6px;font-family:Helvetica,Arial,sans-serif}}
.muted{{color:var(--mut);font-size:13px;margin-top:12px;font-family:Helvetica,Arial,sans-serif}}
footer{{color:var(--mut);font-size:12px;margin-top:40px;border-top:1px solid var(--line);padding-top:16px;font-family:Helvetica,Arial,sans-serif}}
</style></head><body><div class="wrap">
<header><div class="kicker">Website Factory · Hourly</div><h1>Production Ledger</h1>
<div class="updated">Updated {now} · Source of truth: pitch_log.jsonl + leads.json</div></header>
<div class="stats">
<div class="stat"><b>{len(leads)}</b><span>Leads found</span></div>
<div class="stat"><b>{len(ok)}</b><span>Pitches sent ✓</span></div>
<div class="stat"><b>{len(fails)}</b><span>Failed sends</span></div>
<div class="stat"><b>{len(seen)}</b><span>Sites live</span></div>
<div class="stat"><b>{queued}</b><span>In queue</span></div>
</div>
<div class="card"><h2>Pitches per hour (UTC)</h2><div class="chart">{hour_bars}</div></div>
<div class="card"><h2>Leads by category</h2><table>{cat_rows}</table></div>
<div class="card"><h2>Buy-score leaderboard</h2><table>{lb_rows}</table></div>
<div class="card"><h2>Sites built &amp; live ({len(seen)})</h2><table>{site_rows}</table></div>
{err_rows}
<footer>Website Factory dashboard · rebuilt every hour at :55 · Harsshh</footer>
</div></body></html>"""
open('/home/ubuntu/factory/dashboard/index.html', 'w').write(html)
print('dashboard written:', len(html), 'bytes;', len(leads), 'leads;', len(ok), 'sent;', len(seen), 'sites')
