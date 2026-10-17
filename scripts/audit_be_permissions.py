import os
import re

VALID_PERMISSIONS = {
    'APPROVE_REFUND', 'CHECK_IN_MEMBER', 'CREATE_PAYMENT', 'CREATE_USER', 'DEACTIVATE_USER',
    'MANAGE_CLASS', 'MANAGE_PACKAGE', 'MANAGE_ROLE', 'MANAGE_ROOM', 'MANAGE_SUBJECT',
    'MANAGE_SUBSCRIPTION', 'MANAGE_TICKET', 'MARK_ATTENDANCE', 'REGISTER_CLASS', 'SEARCH_MEMBER',
    'SUBSCRIBE_PACKAGE', 'UPDATE_OWN_PROFILE', 'UPDATE_USER', 'VIEW_ATTENDANCE', 'VIEW_CLASS',
    'VIEW_OWN_PROFILE', 'VIEW_OWN_SCHEDULE', 'VIEW_PACKAGE', 'VIEW_PAYMENT', 'VIEW_ROOM',
    'VIEW_SUBJECT', 'VIEW_USER'
}
VALID_ROLES = {'COACH', 'CENTER_MANAGER', 'RECEPTIONIST', 'MEMBER'}

be_dir = r'D:\FPT\SWP391\Sport-Center-BE\SWP391-Sport_Center-BE\src\main\java\com\fptu\swp391\sportscentermanager\controller'

print("=== CHECKING ALL CONTROLLER PREAUTHORIZE ===")
for root, dirs, files in os.walk(be_dir):
    for f in sorted(files):
        if f.endswith('.java'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()
            for line_no, line in enumerate(content.splitlines(), 1):
                if '@PreAuthorize' in line:
                    authorities = re.findall(r"hasAuthority\(['\"](\w+)['\"]", line)
                    roles = re.findall(r"hasRole\(['\"](\w+)['\"]", line)
                    
                    for auth in authorities:
                        if auth not in VALID_PERMISSIONS:
                            print(f"[403 RISK - PHANTOM PERMISSION] {f}:{line_no} -> hasAuthority('{auth}') (Khong ton tai trong DB!)")
                    for r in roles:
                        if r not in VALID_ROLES:
                            print(f"[403 RISK - INVALID ROLE] {f}:{line_no} -> hasRole('{r}') (Khong co role nay trong DB!)")
