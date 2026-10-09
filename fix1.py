import re
def strip_leading_comments(stmt):
    s=stmt
    while True:
        s2=re.sub(r'^\s*(--[^\n]*\n|#[^\n]*\n|/\*[^!][\s\S]*?\*/)\s*', '', s, count=1)
        if s2==s: return s
        s=s2
