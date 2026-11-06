"""In bảng xưng hô trong màn: lá × vai × lựa chọn. python -I xh_table.py > file"""
import os, sys
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import engine as E
cast = E.load_cast(os.path.join(HERE, '..', 'cast_a.yaml'), os.path.join(HERE, '..', 'cast_b.yaml'))
for cid, p in cast.items():
    for r in p['nguoi']['vao_vai']['vai_hop_le']:
        print('%-22s %3d %-14s anh:%-14s chị:%s' % (cid, p['danh_tinh']['tuoi'], r, '/'.join(E.xung_ho(p, r, 'anh')), '/'.join(E.xung_ho(p, r, 'chi'))))
