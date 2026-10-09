import pathlib, re
from sqlparse import split_sql_statements
txt=pathlib.Path('ferdy-branchh.sql').read_text(encoding='utf-8', errors='ignore')
stmts=split_sql_statements(txt)
print('total:',len(stmts))
for idx,s in enumerate(stmts):
    c=len(re.findall(r'INSERT\s+INTO',s,re.I))
    if c>1:
        print('STMT',idx,'has',c,'INSERTs len',len(s))
        print(s[:400])
        print('......')
        print(s[-400:])
        print('='*60)
        if idx>2: break
# find stmt containing applicant_assessments
for idx,s in enumerate(stmts):
    if 'applicant_assessments' in s and 'INSERT' in s.upper():
        print('AA in stmt',idx,'len',len(s))
        print(s[:500])
        break
