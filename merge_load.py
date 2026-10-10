import pathlib, re, pickle
from sqlparse import split_sql_statements, parse_insert_stmt, split_row_values
FERDY='ferdy-branchh.sql'; FRANZ='franzel-branch.sql'; CORD='cordon-hotel_hr.sql'
def load_table_rows(path):
    txt=pathlib.Path(path).read_text(encoding='utf-8', errors='ignore')
    stmts=split_sql_statements(txt)
    tables={}  # tbl -> {cols, inners[], vals[]}
    for s in stmts:
        p=parse_insert_stmt(s)
        if not p: continue
        tbl,cols,inners=p
        e=tables.setdefault(tbl,{'cols':cols,'inners':[],'vals':[]})
        for inn in inners:
            e['inners'].append(inn)
            try: e['vals'].append(split_row_values(inn))
            except Exception: e['vals'].append(None)
    return tables
print('Loading ferdy...')
ferdy=load_table_rows(FERDY)
print('Loading franzel...')
franz=load_table_rows(FRANZ)
print('Loading cordon...')
cord=load_table_rows(CORD)
print('ferdy rows:',sum(len(v['inners']) for v in ferdy.values()))
print('franzel rows:',sum(len(v['inners']) for v in franz.values()))
print('cordon rows:',sum(len(v['inners']) for v in cord.values()))
# sanity: ferdy applicant_assessments should be 12+ rows incl. row id 2 with knife text
aa=ferdy.get('applicant_assessments',{'inners':[]})
print('ferdy applicant_assessments rows:',len(aa['inners']))
kn=[i for i in aa['inners'] if 'solid knife skills' in i]
print('rows containing knife text:',len(kn))
pickle.dump({'ferdy':ferdy,'franz':franz,'cord':cord}, open('merge_load.pkl','wb'))
print('saved merge_load.pkl')
