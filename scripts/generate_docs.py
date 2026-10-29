import os
import zipfile

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.abspath(os.path.join(SCRIPTS_DIR, "..", "docs"))
DOC_PATH = os.path.join(DOCS_DIR, "CPRS_System_Design_and_Documentation.doc")
DOCX_PATH = os.path.join(DOCS_DIR, "CPRS_System_Design_and_Documentation.docx")
HTML_PATH = os.path.join(DOCS_DIR, "CPRS_System_Design_and_Guide.html")

def generate_doc_and_html():
    html_content = """<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>CPRS System Design and Documentation</title>
<!--[if gte mso 9]>
<xml>
 <w:WordDocument>
  <w:View>Print</w:View>
  <w:Zoom>100</w:Zoom>
  <w:DoNotOptimizeForBrowser/>
 </w:WordDocument>
</xml>
<![endif]-->
<style>
@page Section1 {
    size: 8.5in 11.0in;
    margin: 1.0in 1.0in 1.0in 1.0in;
}
div.Section1 { page: Section1; max-width: 960px; margin: 0 auto; }
body {
    font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #1a1a1a;
}
h1 {
    font-size: 22pt;
    color: #1e3a8a;
    border-bottom: 2pt solid #1e3a8a;
    padding-bottom: 6pt;
    margin-top: 18pt;
    margin-bottom: 12pt;
}
h2 {
    font-size: 15pt;
    color: #1e40af;
    border-bottom: 1pt solid #cbd5e1;
    padding-bottom: 4pt;
    margin-top: 16pt;
    margin-bottom: 8pt;
}
h3 {
    font-size: 12pt;
    color: #0f172a;
    margin-top: 12pt;
    margin-bottom: 6pt;
}
p, li {
    font-size: 11pt;
    color: #334155;
}
table {
    border-collapse: collapse;
    width: 100%;
    margin-top: 8pt;
    margin-bottom: 14pt;
}
th, td {
    border: 1pt solid #cbd5e1;
    padding: 6pt 8pt;
    text-align: left;
    font-size: 10pt;
    vertical-align: top;
}
th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: bold;
}
.callout {
    background-color: #eff6ff;
    border-left: 4pt solid #2563eb;
    padding: 10pt 14pt;
    margin: 10pt 0;
}
code {
    font-family: 'Consolas', 'Courier New', monospace;
    background-color: #f1f5f9;
    padding: 1pt 4pt;
    font-size: 9.5pt;
    color: #0f172a;
}
pre {
    font-family: 'Consolas', 'Courier New', monospace;
    background-color: #0f172a;
    color: #f8fafc;
    padding: 8pt 10pt;
    font-size: 9.5pt;
    border-radius: 4pt;
}
</style>
</head>
<body>
<div class="Section1">

<h1>Community Problem Reporting System (CPRS)</h1>
<p><strong>System Design, Stakeholder Architecture, API Reference &amp; Developer Guide</strong><br>
<em>Version: 2.0.0 | Updated: October 2026 | Technology: MERN Stack (MongoDB, Express.js, React 18, Node.js, Chart.js)</em></p>

<div class="callout">
<strong>Executive Summary:</strong> The Community Problem Reporting System (CPRS) is a transparent, trackable civic management platform that allows citizens to report neighborhood problems (road damage, waste accumulation, water leakage, streetlights, drainage, security) directly to municipal authorities, with dedicated Admin and Authority sidebar portals, Chart.js analytics, CSV export, and automatic email-pattern department filtering.
</div>

<h2>1. Role Portals &amp; Responsibilities</h2>
<table>
  <thead>
    <tr>
      <th>User Role</th>
      <th>Portal &amp; Layout</th>
      <th>Key Responsibilities</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Citizen</strong></td>
      <td>Public &amp; Citizen Portal (<code>Layout.jsx</code>)</td>
      <td>Submits complaints with up to 3 photos, receives a tracking ID (<code>CPRS-YYYYMMDD-XXXXXX</code>), edits/deletes own complaints (with confirmation modal), and tracks live timelines &amp; notifications.</td>
    </tr>
    <tr>
      <td><strong>Admin</strong></td>
      <td>Admin Portal (<code>AdminLayout.jsx</code> — <code>/admin/*</code>)</td>
      <td>Operates inside a collapsible sidebar dashboard with Chart.js Analytics &amp; CSV Export, Admin/Citizen/Authority/Category management, and full complaint triage (Verify, Reject, Assign, Edit, Delete).</td>
    </tr>
    <tr>
      <td><strong>Authority</strong></td>
      <td>Authority Portal (<code>AuthorityLayout.jsx</code> — <code>/assigned/*</code>)</td>
      <td>Follows the same collapsible sidebar layout as Admin. Automatically detects the department category from the email token (after <code>.</code> and before <code>@</code>), locks the category filter, updates statuses, and views department Chart.js analytics.</td>
    </tr>
  </tbody>
</table>

<h2>2. Seeded Accounts &amp; Authority Email Pattern</h2>
<p>Every authority user follows the pattern <code>authority.&lt;token&gt;@cprs.local</code>. The system extracts the token between <code>.</code> and <code>@</code> to automatically filter complaints and lock the category filter dropdown:</p>
<table>
  <thead>
    <tr>
      <th>Role</th>
      <th>Department / Name</th>
      <th>Email</th>
      <th>Auto-Filtered Category</th>
      <th>Password</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Admin</td><td>System Admin</td><td><code>admin@cprs.local</code></td><td>All Categories</td><td><code>Admin123!</code></td></tr>
    <tr><td>Authority</td><td>Roads &amp; Highway Maintenance</td><td><code>authority.roads@cprs.local</code></td><td>Road Damage (<code>roads</code>)</td><td><code>Authority123!</code></td></tr>
    <tr><td>Authority</td><td>Waste Management &amp; Sanitation</td><td><code>authority.waste@cprs.local</code></td><td>Waste Management (<code>waste</code>)</td><td><code>Authority123!</code></td></tr>
    <tr><td>Authority</td><td>Water Supply &amp; WASA</td><td><code>authority.water@cprs.local</code></td><td>Water Leakage (<code>water</code>)</td><td><code>Authority123!</code></td></tr>
    <tr><td>Authority</td><td>Streetlight &amp; Electrical</td><td><code>authority.lights@cprs.local</code></td><td>Streetlight (<code>lights</code>)</td><td><code>Authority123!</code></td></tr>
    <tr><td>Authority</td><td>Drainage &amp; Stormwater</td><td><code>authority.drainage@cprs.local</code></td><td>Drainage (<code>drainage</code>)</td><td><code>Authority123!</code></td></tr>
    <tr><td>Authority</td><td>Public Parks &amp; Security</td><td><code>authority.security@cprs.local</code></td><td>Security (<code>security</code>)</td><td><code>Authority123!</code></td></tr>
    <tr><td>Authority</td><td>General Municipal Works</td><td><code>authority.general@cprs.local</code></td><td>Other (<code>general</code>)</td><td><code>Authority123!</code></td></tr>
    <tr><td>Citizen</td><td>Rahim Uddin</td><td><code>citizen1@cprs.local</code></td><td>Own Complaints</td><td><code>Citizen123!</code></td></tr>
    <tr><td>Citizen</td><td>Karima Begum</td><td><code>citizen2@cprs.local</code></td><td>Own Complaints</td><td><code>Citizen123!</code></td></tr>
  </tbody>
</table>

<h2>3. Complete REST API Endpoints</h2>
<table>
  <thead>
    <tr>
      <th>Route Group</th>
      <th>Endpoints</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Auth (<code>/api/auth</code>)</strong></td>
      <td><code>POST /register</code>, <code>POST /login</code>, <code>POST /forgot-password</code>, <code>POST /reset-password</code>, <code>GET|POST /seed</code></td>
      <td>Citizen registration, JWT authentication, password recovery, and idempotent default account seeding.</td>
    </tr>
    <tr>
      <td><strong>Users (<code>/api/users</code>)</strong></td>
      <td><code>GET|PUT /me</code>, <code>GET /</code>, <code>GET /:id</code>, <code>POST /</code>, <code>PUT /:id</code>, <code>PUT /:id/status</code>, <code>DELETE /:id</code></td>
      <td>Profile management and Admin CRUD + account status activation/blocking.</td>
    </tr>
    <tr>
      <td><strong>Categories (<code>/api/categories</code>)</strong></td>
      <td><code>GET /</code>, <code>POST /</code>, <code>PUT /:id</code>, <code>DELETE /:id</code></td>
      <td>Dynamic problem category listing and Admin category management.</td>
    </tr>
    <tr>
      <td><strong>Complaints (<code>/api/complaints</code>)</strong></td>
      <td><code>POST /</code>, <code>GET /mine</code>, <code>GET /assigned</code>, <code>GET /</code>, <code>GET|PUT|DELETE /:id</code>, <code>PUT /:id/verify</code>, <code>PUT /:id/assign</code>, <code>PUT /:id/status</code></td>
      <td>Full complaint submission, role-scoped listing, verification, authority assignment, status updates, editing, and deletion.</td>
    </tr>
    <tr>
      <td><strong>Notifications (<code>/api/notifications</code>)</strong></td>
      <td><code>GET /</code>, <code>PUT /:id/read</code>, <code>PUT /read-all</code></td>
      <td>In-app citizen alerts for complaint lifecycle transitions.</td>
    </tr>
    <tr>
      <td><strong>Analytics (<code>/api/analytics</code>)</strong></td>
      <td><code>GET /summary</code>, <code>GET /export</code></td>
      <td>KPI totals, status/category breakdowns, 14-day daily intake trend, and CSV report export.</td>
    </tr>
  </tbody>
</table>

<h2>4. Centralized Monorepo Commands</h2>
<pre>
npm run install:all    # Install all server and client dependencies
npm run seed           # Seed MongoDB with 10 test accounts and 7 sample complaints
npm run dev            # Start Express API (:5000) and Vite React Client (:5173)
npm run build          # Build production client bundle (client/dist/)
</pre>

</div>
</body>
</html>
"""
    with open(DOC_PATH, "w", encoding="utf-8") as f:
        f.write(html_content)
    with open(HTML_PATH, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Updated: {DOC_PATH}")
    print(f"Updated: {HTML_PATH}")

def generate_docx():
    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>"""

    rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

    doc_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>"""

    styles = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        <w:sz w:val="22"/>
        <w:color w:val="1E293B"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:pPr><w:spacing w:before="360" w:after="160"/></w:pPr>
    <w:rPr><w:b/><w:color w:val="1E3A8A"/><w:sz w:val="36"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>
    <w:rPr><w:b/><w:color w:val="1E40AF"/><w:sz w:val="28"/></w:rPr>
  </w:style>
</w:styles>"""

    sections = [
        ("Community Problem Reporting System (CPRS)", "Heading1", True),
        ("System Design, Stakeholder Architecture, REST API Reference & Developer Guide", None, True),
        ("Version: 2.0.0 | Technology: MERN Stack (MongoDB, Express.js, React 18, Node.js, Chart.js)", None, False),
        ("1. Role Portals & Layout Architecture", "Heading2", False),
        ("• Citizen Portal (Layout.jsx): Submit complaints with up to 3 photos, view/edit/delete own complaints with confirmation modals, and track live timelines & notifications.", None, False),
        ("• Admin Portal (AdminLayout.jsx - /admin/*): Dedicated collapsible sidebar portal with Dashboard, Chart.js Analytics & CSV Export, Admins, Citizens, Authorities & Categories, and Complaints management.", None, False),
        ("• Authority Portal (AuthorityLayout.jsx - /assigned/*): Dedicated collapsible sidebar portal with Dashboard, Department Complaints, and Department Analytics & CSV Export.", None, False),
        ("2. Authority Email Pattern & Automatic Category Filtering", "Heading2", False),
        ("Every authority user follows the email pattern authority.<token>@cprs.local. CPRS extracts the token after '.' and before '@' to resolve the department category, automatically filters complaints and analytics, and disables the category filter dropdown:", None, False),
        ("• authority.roads@cprs.local -> Road Damage (Password: Authority123!)", None, False),
        ("• authority.waste@cprs.local -> Waste Management (Password: Authority123!)", None, False),
        ("• authority.water@cprs.local -> Water Leakage (Password: Authority123!)", None, False),
        ("• authority.lights@cprs.local -> Streetlight (Password: Authority123!)", None, False),
        ("• authority.drainage@cprs.local -> Drainage (Password: Authority123!)", None, False),
        ("• authority.security@cprs.local -> Security (Password: Authority123!)", None, False),
        ("• authority.general@cprs.local -> Other (Password: Authority123!)", None, False),
        ("3. Complete REST API Route Groups", "Heading2", False),
        ("• /api/auth: POST /register, POST /login, POST /forgot-password, POST /reset-password, GET|POST /seed", None, False),
        ("• /api/users: GET|PUT /me, GET /, GET /:id, POST /, PUT /:id, PUT /:id/status, DELETE /:id", None, False),
        ("• /api/categories: GET /, POST /, PUT /:id, DELETE /:id", None, False),
        ("• /api/complaints: POST /, GET /mine, GET /assigned, GET /, GET|PUT|DELETE /:id, PUT /:id/verify, PUT /:id/assign, PUT /:id/status", None, False),
        ("• /api/notifications: GET /, PUT /:id/read, PUT /read-all", None, False),
        ("• /api/analytics: GET /summary, GET /export (CSV)", None, False),
        ("4. Monorepo Commands", "Heading2", False),
        ("• npm run install:all — Install server and client dependencies", None, False),
        ("• npm run seed — Seed MongoDB with 10 default accounts and 7 sample complaints", None, False),
        ("• npm run dev — Run Express API (:5000) and Vite React SPA (:5173) concurrently", None, False),
        ("• npm run build — Build production client bundle", None, False),
    ]

    p_xml = []
    for text, style, bold in sections:
        p_style = f'<w:pStyle w:val="{style}"/>' if style else ''
        b_tag = '<w:b/>' if bold else ''
        escaped = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        p_xml.append(f"""    <w:p>
      <w:pPr>{p_style}</w:pPr>
      <w:r>
        <w:rPr>{b_tag}</w:rPr>
        <w:t>{escaped}</w:t>
      </w:r>
    </w:p>""")

    doc_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
{chr(10).join(p_xml)}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>"""

    with zipfile.ZipFile(DOCX_PATH, "w", zipfile.ZIP_DEFLATED) as docx:
        docx.writestr("[Content_Types].xml", content_types)
        docx.writestr("_rels/.rels", rels)
        docx.writestr("word/_rels/document.xml.rels", doc_rels)
        docx.writestr("word/styles.xml", styles)
        docx.writestr("word/document.xml", doc_xml)
    print(f"Updated: {DOCX_PATH}")

if __name__ == "__main__":
    generate_doc_and_html()
    generate_docx()
