import pathlib
from sqlparse import split_sql_statements, parse_insert_stmt
txt=pathlib.Path('ferdy-branchh.sql').read_text(encoding='utf-8', errors='ignore')
stmts=split_sql_statements(txt)
print('total statements:',len(stmts))
ins=[s for s in stmts if s.lstrip().upper().startswith('INSERT')]
print('insert statements:',len(ins))
# show first insert stmt head/tail
print('--- first INSERT head ---')
print(ins[0][:600])
print('--- first INSERT tail ---')
print(ins[0][-400:])
p=parse_insert_stmt(ins[0])
print('parsed:', p[0] if p else None, len(p[2]) if p else 0)
# check applicant_assessments stmt
aa=[s for s in ins if '`applicant_assessments`' in s]
print('aa stmts:',len(aa))
if aa:
    print(aa[0][:300])
    print('...')
    print(aa[0][-300:])
    p2=parse_insert_stmt(aa[0])
    print('aa rows:',len(p2[2]) if p2 else 'PARSE FAIL')
