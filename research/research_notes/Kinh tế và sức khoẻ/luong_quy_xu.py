import json,sys,statistics,math,csv,re
sys.stdout.reconfigure(encoding='utf-8')
prof={p['role_code']:p for p in json.load(open('occupation-data/generated/occupation_profiles.json',encoding='utf-8'))['profiles']}
pb=json.load(open('occupation-data/generated/point_budgets.json',encoding='utf-8'))['roles']
REF=13_000_000
def central(m):
    for k in ('median','average'):
        if m.get(k): return m[k]
    if m.get('low') and m.get('high'): return (m['low']+m['high'])/2
def yrs(s):
    n=[float(x) for x in re.findall(r'\d+',s or '')]; return sum(n)/len(n) if n else 0
out=[]
for r in pb:
    p=prof.get(r['role_code']); pay=(p or {}).get('pay') or {}
    m=pay.get('monthly_vnd') or {}; c=central(m)
    n=len(r['levels'])
    by=pay.get('by_years')
    for i,l in enumerate(r['levels']):
        if not c: s=None; how='chua_co_luong'
        elif by:
            y=yrs(l.get('years_experience'))
            pts=[(yrs(b['years']),b['median']) for b in by]
            s=min(pts,key=lambda t:abs(t[0]-y))[1] if y>=2 else c*0.75 if y>0 else c*0.5
            how='itviec_theo_nam'
        else:
            lo=m.get('low') or c*0.8; hi=m.get('high') or c*1.3
            s=lo+(hi-lo)*i/max(n-1,1); how='noi_suy_thap_cao'
        coin=None if s is None else round(100*min(max(math.sqrt(s/REF),0.6),2.5))
        out.append([r['role_code'],r['name_vn'],i+1,n,l['band_equivalent'],l['title_vn'],None if s is None else round(s/1e5)/10,how,coin,pay.get('basis')])
path='research/research_notes/Kinh tế và sức khoẻ/luong_quy_xu.csv'
with open(path,'w',encoding='utf-8',newline='') as f:
    w=csv.writer(f); w.writerow(['role_code','ten_nghe','cap','so_cap','band_equivalent','ten_cap','luong_cap_trieu','cach_uoc','xu_moi_man','nguon_luong']); w.writerows(out)
v=[o[8] for o in out if o[8]]; q=statistics.quantiles(v,n=20)
print(len(out),'levels', len(v),'with coin','min',min(v),'P5',q[0],'P25',statistics.quantiles(v,n=4)[0],'P50',statistics.median(v),'P75',statistics.quantiles(v,n=4)[2],'P95',q[-1],'max',max(v))
print('at floor',sum(1 for x in v if x==60),'at cap',sum(1 for x in v if x==250))
# first level coin dist
f=[o[8] for o in out if o[2]==1 and o[8]]; print('L1 coin P5/P50/P95',statistics.quantiles(f,n=20)[0],statistics.median(f),statistics.quantiles(f,n=20)[-1])
