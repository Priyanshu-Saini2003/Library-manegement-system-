from datetime import date
from pathlib import Path

from reportlab.graphics.shapes import Drawing, Line, Polygon, Rect, String
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "Library_Management_System_Project_Report.pdf"

STUDENT_NAME = "Priyanshu Saini"
ROLL_NUMBER = "O24MCA110350"
ENROLLMENT_NUMBER = "XYZ"
COURSE = "MCA"
SEMESTER = "4th"
UNIVERSITY = "Chandigarh University"
GUIDE_NAME = "Kashish Gupta"
GUIDE_DESIGNATION = "[Guide Designation]"
SUBMISSION_YEAR = "2025-2026"
PROJECT_TITLE = "Library Management System with AI Recommendation"
PROJECT_TYPE = "Individual"
DEPARTMENT_NAME = "[Department Name]"
INSTITUTE_NAME = "[College / Institute Name]"


class ReportDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph):
            style_name = flowable.style.name
            if style_name == "Heading1":
                self.notify("TOCEntry", (0, flowable.getPlainText(), self.page))
            elif style_name == "Heading2":
                self.notify("TOCEntry", (1, flowable.getPlainText(), self.page))


def make_styles():
    base = getSampleStyleSheet()
    styles = {}
    styles["Title"] = ParagraphStyle(
        "Title",
        parent=base["Title"],
        fontName="Times-Bold",
        fontSize=20,
        leading=24,
        alignment=TA_CENTER,
        spaceAfter=16,
    )
    styles["Subtitle"] = ParagraphStyle(
        "Subtitle",
        parent=base["Normal"],
        fontName="Times-Roman",
        fontSize=13,
        leading=18,
        alignment=TA_CENTER,
        spaceAfter=12,
    )
    styles["Heading1"] = ParagraphStyle(
        "Heading1",
        parent=base["Heading1"],
        fontName="Times-Bold",
        fontSize=16,
        leading=20,
        spaceBefore=10,
        spaceAfter=8,
        keepWithNext=True,
    )
    styles["Heading2"] = ParagraphStyle(
        "Heading2",
        parent=base["Heading2"],
        fontName="Times-Bold",
        fontSize=14,
        leading=18,
        spaceBefore=8,
        spaceAfter=6,
        keepWithNext=True,
    )
    styles["Heading3"] = ParagraphStyle(
        "Heading3",
        parent=base["Heading3"],
        fontName="Times-Bold",
        fontSize=12,
        leading=18,
        spaceBefore=6,
        spaceAfter=4,
        keepWithNext=True,
    )
    styles["Body"] = ParagraphStyle(
        "Body",
        parent=base["Normal"],
        fontName="Times-Roman",
        fontSize=12,
        leading=18,
        alignment=TA_JUSTIFY,
        spaceAfter=8,
    )
    styles["BodyCenter"] = ParagraphStyle(
        "BodyCenter",
        parent=styles["Body"],
        alignment=TA_CENTER,
    )
    styles["BodyRight"] = ParagraphStyle(
        "BodyRight",
        parent=styles["Body"],
        alignment=TA_RIGHT,
    )
    styles["Bullet"] = ParagraphStyle(
        "Bullet",
        parent=styles["Body"],
        leftIndent=18,
        firstLineIndent=-10,
        bulletIndent=0,
        spaceAfter=4,
    )
    styles["Small"] = ParagraphStyle(
        "Small",
        parent=styles["Body"],
        fontSize=10,
        leading=14,
        spaceAfter=4,
    )
    styles["Caption"] = ParagraphStyle(
        "Caption",
        parent=styles["Small"],
        fontName="Times-Italic",
        alignment=TA_CENTER,
        spaceBefore=4,
        spaceAfter=10,
    )
    styles["Code"] = ParagraphStyle(
        "Code",
        parent=base["Code"],
        fontName="Courier",
        fontSize=9,
        leading=12,
        leftIndent=12,
        rightIndent=12,
        spaceBefore=4,
        spaceAfter=8,
    )
    styles["TableCell"] = ParagraphStyle(
        "TableCell",
        parent=styles["Small"],
        alignment=TA_LEFT,
        leading=13,
    )
    styles["TableHead"] = ParagraphStyle(
        "TableHead",
        parent=styles["Small"],
        fontName="Times-Bold",
        alignment=TA_CENTER,
        leading=13,
    )
    return styles


S = make_styles()


def p(text, style="Body"):
    return Paragraph(text, S[style])


def bullet(text):
    return Paragraph(text, S["Bullet"], bulletText="•")


def bullets(items):
    return [bullet(item) for item in items]


def code(text):
    safe = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return Paragraph(safe.replace("\n", "<br/>"), S["Code"])


def table(data, col_widths=None, header=True):
    converted = []
    for row_index, row in enumerate(data):
        converted_row = []
        for item in row:
            if isinstance(item, str):
                converted_row.append(p(item, "TableHead" if header and row_index == 0 else "TableCell"))
            else:
                converted_row.append(item)
        converted.append(converted_row)
    t = Table(converted, colWidths=col_widths, repeatRows=1 if header else 0)
    style = [
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#6b7280")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    if header:
        style.extend(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e5e7eb")),
                ("FONTNAME", (0, 0), (-1, 0), "Times-Bold"),
            ]
        )
    t.setStyle(TableStyle(style))
    return t


def arrow(d, x1, y1, x2, y2):
    d.add(Line(x1, y1, x2, y2, strokeColor=colors.HexColor("#1f2937"), strokeWidth=1.2))
    if x2 >= x1:
        d.add(Polygon([x2, y2, x2 - 7, y2 + 4, x2 - 7, y2 - 4], fillColor=colors.HexColor("#1f2937")))
    else:
        d.add(Polygon([x2, y2, x2 + 7, y2 + 4, x2 + 7, y2 - 4], fillColor=colors.HexColor("#1f2937")))


def box(d, x, y, w, h, text, fill="#f8fafc"):
    d.add(Rect(x, y, w, h, strokeColor=colors.HexColor("#334155"), fillColor=colors.HexColor(fill), strokeWidth=1))
    d.add(String(x + w / 2, y + h / 2 - 4, text, textAnchor="middle", fontName="Times-Bold", fontSize=10, fillColor=colors.black))


def architecture_figure():
    d = Drawing(430, 150)
    box(d, 15, 90, 90, 38, "Browser UI", "#dbeafe")
    box(d, 125, 90, 90, 38, "React + TS", "#eff6ff")
    box(d, 235, 90, 90, 38, "REST API", "#ecfdf5")
    box(d, 345, 90, 70, 38, "MySQL", "#fef3c7")
    arrow(d, 105, 109, 125, 109)
    arrow(d, 215, 109, 235, 109)
    arrow(d, 325, 109, 345, 109)
    box(d, 125, 28, 90, 38, "JWT Token", "#f1f5f9")
    box(d, 235, 28, 90, 38, "JPA Layer", "#f1f5f9")
    arrow(d, 170, 90, 170, 66)
    arrow(d, 280, 66, 280, 90)
    d.add(String(215, 5, "Figure 3.1: High-level system architecture", textAnchor="middle", fontName="Times-Italic", fontSize=10))
    return d


def dfd_figure():
    d = Drawing(430, 170)
    box(d, 10, 95, 90, 40, "Student", "#dbeafe")
    box(d, 165, 100, 100, 50, "Library System", "#ecfdf5")
    box(d, 330, 95, 90, 40, "Librarian", "#dbeafe")
    box(d, 165, 20, 100, 40, "MySQL DB", "#fef3c7")
    arrow(d, 100, 115, 165, 125)
    arrow(d, 330, 115, 265, 125)
    arrow(d, 215, 100, 215, 60)
    arrow(d, 215, 60, 215, 100)
    d.add(String(215, 5, "Figure 3.2: DFD Level 0 for Library Management System", textAnchor="middle", fontName="Times-Italic", fontSize=10))
    return d


def er_figure():
    d = Drawing(430, 190)
    box(d, 25, 120, 100, 45, "profiles", "#dbeafe")
    box(d, 165, 120, 100, 45, "book_issues", "#ecfdf5")
    box(d, 305, 120, 100, 45, "books", "#fef3c7")
    box(d, 25, 35, 100, 45, "notifications", "#f8fafc")
    arrow(d, 125, 143, 165, 143)
    arrow(d, 265, 143, 305, 143)
    arrow(d, 75, 120, 75, 80)
    d.add(String(145, 152, "1 to many", fontName="Times-Roman", fontSize=9))
    d.add(String(285, 152, "many to 1", fontName="Times-Roman", fontSize=9))
    d.add(String(85, 97, "1 to many", fontName="Times-Roman", fontSize=9))
    d.add(String(215, 5, "Figure 4.1: Entity relationship overview", textAnchor="middle", fontName="Times-Italic", fontSize=10))
    return d


def use_case_figure():
    d = Drawing(430, 185)
    box(d, 15, 110, 70, 36, "Student", "#dbeafe")
    box(d, 345, 110, 70, 36, "Librarian", "#dbeafe")
    use_cases = [
        (140, 135, "Login"),
        (140, 95, "Search Books"),
        (140, 55, "Request Book"),
        (250, 135, "Manage Books"),
        (250, 95, "Issue/Return"),
        (250, 55, "View Reports"),
    ]
    for x, y, txt in use_cases:
        box(d, x, y, 90, 28, txt, "#f8fafc")
    for y in [149, 109, 69]:
        arrow(d, 85, 128, 140, y)
    for y in [149, 109, 69]:
        arrow(d, 345, 128, 340, y)
    d.add(String(215, 5, "Figure 4.2: Use case overview", textAnchor="middle", fontName="Times-Italic", fontSize=10))
    return d


def add_signature_block(story):
    story.extend(
        [
            Spacer(1, 40),
            p("Place: ____________________", "Body"),
            p(f"Date: {date.today().strftime('%d %B %Y')}", "Body"),
            Spacer(1, 36),
            p("Signature of Student: ____________________", "BodyRight"),
        ]
    )


def page_number(canvas, doc):
    canvas.saveState()
    canvas.setFont("Times-Roman", 10)
    canvas.drawRightString(A4[0] - 0.75 * inch, 0.45 * inch, f"Page {doc.page}")
    canvas.restoreState()


def cover_page(story):
    story.extend(
        [
            Spacer(1, 36),
            p("PROJECT REPORT", "Title"),
            p("ON", "Subtitle"),
            p(PROJECT_TITLE.upper(), "Title"),
            Spacer(1, 18),
            p("Submitted in partial fulfillment of the requirements for the degree/program", "BodyCenter"),
            p(COURSE, "BodyCenter"),
            Spacer(1, 24),
            p("Submitted By", "Heading2"),
            p(STUDENT_NAME, "BodyCenter"),
            p(f"Roll Number: {ROLL_NUMBER}", "BodyCenter"),
            p(f"Enrollment Number: {ENROLLMENT_NUMBER}", "BodyCenter"),
            p(f"Semester: {SEMESTER}", "BodyCenter"),
            p(f"Project Type: {PROJECT_TYPE}", "BodyCenter"),
            Spacer(1, 18),
            p("Under the Guidance of", "Heading2"),
            p(GUIDE_NAME, "BodyCenter"),
            p(GUIDE_DESIGNATION, "BodyCenter"),
            Spacer(1, 24),
            p(DEPARTMENT_NAME, "BodyCenter"),
            p(INSTITUTE_NAME, "BodyCenter"),
            p(UNIVERSITY, "BodyCenter"),
            Spacer(1, 24),
            p(f"Academic Year: {SUBMISSION_YEAR}", "BodyCenter"),
            PageBreak(),
        ]
    )


def preliminary_pages(story):
    story.append(p("Bonafide Certificate", "Heading1"))
    story.append(
        p(
            f"This is to certify that the project report entitled <b>{PROJECT_TITLE}</b> "
            f"submitted by <b>{STUDENT_NAME}</b>, bearing Roll Number <b>{ROLL_NUMBER}</b> "
            f"and Enrollment Number <b>{ENROLLMENT_NUMBER}</b>, "
            "is a bonafide record of the project work carried out under my supervision and guidance. "
            "This project is submitted in partial fulfillment of the requirements of the "
            f"<b>{COURSE}</b> program during the academic year <b>{SUBMISSION_YEAR}</b>.",
        )
    )
    story.extend(
        [
            Spacer(1, 36),
            p("Project Guide: ____________________", "Body"),
            p("Head of Department: ____________________", "Body"),
            p("Institution Seal: ____________________", "Body"),
            PageBreak(),
            p("Declaration by Student", "Heading1"),
            p(
                f"I hereby declare that the project report entitled <b>{PROJECT_TITLE}</b> "
                f"is an original work carried out by me under the guidance of <b>{GUIDE_NAME}</b>. "
                "The project has not been submitted to any other university or institution for the "
                "award of any degree or diploma. All sources of information used in this report have "
                "been acknowledged in the references section.",
            ),
        ]
    )
    add_signature_block(story)
    story.extend(
        [
            PageBreak(),
            p("Acknowledgement", "Heading1"),
            p(
                "I would like to express my sincere gratitude to my project guide, faculty members, "
                "department, and institution for providing support and guidance throughout the "
                "development of this project. I am also thankful to my classmates, friends, and family "
                "for their encouragement during the analysis, design, implementation, and testing of "
                "the Library Management System.",
            ),
            p(
                "This project helped me understand full-stack application development, REST API "
                "integration, database design, authentication, and systematic testing in a practical "
                "software development environment.",
            ),
            PageBreak(),
            p("Abstract", "Heading1"),
            p(
                f"The <b>{PROJECT_TITLE}</b> is a full-stack web application developed to "
                "digitize and simplify the daily operations of an educational library. The objective "
                "of the project is to provide students with a convenient platform for searching books, "
                "checking availability, requesting books, and tracking issued books, while enabling "
                "librarians to manage books, students, issue-return operations, reports, and "
                "notifications. The frontend is implemented using React, TypeScript, Vite, and "
                "Tailwind CSS. The backend is implemented using Java Spring Boot, Spring Security, "
                "JWT authentication, Spring Data JPA, MySQL, and Swagger/OpenAPI. The development "
                "approach follows an iterative software development methodology where requirements, "
                "design, implementation, testing, and refinement are performed module by module. "
                "The final system provides role-based access, secure authentication, structured API "
                "communication, persistent database storage, and report generation support. The "
                "project demonstrates practical knowledge of frontend-backend integration, database "
                "schema design, RESTful services, and testing.",
            ),
            PageBreak(),
        ]
    )


def toc_pages(story):
    story.append(p("Table of Contents", "Heading1"))
    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle("TOCHeading1", fontName="Times-Roman", fontSize=12, leading=18, leftIndent=0, firstLineIndent=0),
        ParagraphStyle("TOCHeading2", fontName="Times-Roman", fontSize=11, leading=16, leftIndent=20, firstLineIndent=0),
    ]
    story.append(toc)
    story.append(PageBreak())
    story.append(p("List of Figures", "Heading1"))
    story.append(
        table(
            [
                ["Figure No.", "Title"],
                ["Figure 3.1", "High-level system architecture"],
                ["Figure 3.2", "DFD Level 0 for Library Management System"],
                ["Figure 4.1", "Entity relationship overview"],
                ["Figure 4.2", "Use case overview"],
                ["Figure 4.3", "Sequence flow for book issue operation"],
                ["Figure 4.4", "Activity flow for login and dashboard access"],
            ],
            [90, 340],
        )
    )
    story.append(PageBreak())
    story.append(p("List of Tables", "Heading1"))
    story.append(
        table(
            [
                ["Table No.", "Title"],
                ["Table 2.1", "Comparative analysis of existing and proposed systems"],
                ["Table 3.1", "Functional requirements"],
                ["Table 3.2", "Non-functional requirements"],
                ["Table 4.1", "Database table structures"],
                ["Table 4.2", "API design summary"],
                ["Table 6.1", "Test case summary"],
            ],
            [90, 340],
        )
    )
    story.append(PageBreak())
    story.append(p("List of Abbreviations", "Heading1"))
    story.append(
        table(
            [
                ["Abbreviation", "Meaning"],
                ["API", "Application Programming Interface"],
                ["CRUD", "Create, Read, Update, Delete"],
                ["DBMS", "Database Management System"],
                ["DFD", "Data Flow Diagram"],
                ["ER", "Entity Relationship"],
                ["JPA", "Java Persistence API"],
                ["JWT", "JSON Web Token"],
                ["REST", "Representational State Transfer"],
                ["SQL", "Structured Query Language"],
                ["UML", "Unified Modeling Language"],
                ["UI", "User Interface"],
                ["UX", "User Experience"],
            ],
            [110, 320],
        )
    )
    story.append(PageBreak())


def chapter_1(story):
    story.append(p("Chapter 1: Introduction", "Heading1"))
    story.append(p("1.1 Background of the Project", "Heading2"))
    story.append(
        p(
            "Libraries are an important part of educational institutions because they provide access "
            "to books, reference materials, and learning resources. In many institutions, library "
            "activities such as maintaining book records, checking availability, issuing books, "
            "returning books, and preparing reports are still handled manually or through limited "
            "spreadsheet-based systems. Such approaches can lead to delays, data duplication, "
            "difficulty in tracking issued books, and lack of real-time visibility."
        )
    )
    story.append(
        p(
            "The Library Management System addresses these challenges by providing a web-based "
            "platform where students and librarians can perform their respective tasks digitally. "
            "Students can search the book catalog and view their issue history, while librarians can "
            "manage inventory, issue and return books, and view operational reports."
        )
    )
    story.append(p("1.2 Problem Statement", "Heading2"))
    story.append(
        p(
            "The existing manual library process requires significant effort to maintain records and "
            "often results in slow book search, inaccurate availability information, and difficulty in "
            "tracking issued books. Librarians need a reliable system to manage books and students, "
            "while students need a simple interface for finding and requesting books. Therefore, a "
            "centralized digital solution is required to manage library operations efficiently."
        )
    )
    story.append(p("1.3 Objectives of the System", "Heading2"))
    story.extend(
        bullets(
            [
                "To provide secure role-based login for students and librarians.",
                "To maintain a digital catalog of books with availability status.",
                "To allow students to search, filter, and request books.",
                "To allow librarians to add, update, delete, issue, and return books.",
                "To store all user, book, issue, and notification data in MySQL.",
                "To provide reports for book inventory, issue status, and student activity.",
                "To document backend APIs using Swagger/OpenAPI.",
            ]
        )
    )
    story.append(p("1.4 Scope of the Project", "Heading2"))
    story.append(
        p(
            "The scope of the project includes student registration and login, librarian login, book "
            "catalog management, issue-return management, notifications, reports, and recommendation "
            "support. The system is intended for local deployment in an educational library environment "
            "and can be extended for cloud deployment, mobile applications, fine management, and barcode "
            "based issue processing in the future."
        )
    )
    story.append(p("1.5 Existing System Overview", "Heading2"))
    story.append(
        p(
            "In a manual system, book records are maintained in registers or spreadsheets. Students "
            "must physically ask the librarian about availability, and the librarian must manually "
            "check records. Reports are difficult to prepare because data is distributed and not always "
            "updated in real time. This makes the process time-consuming and error-prone."
        )
    )
    story.append(p("1.6 Proposed System Overview", "Heading2"))
    story.append(
        p(
            "The proposed system provides a React-based frontend connected to a Java Spring Boot "
            "backend. The backend exposes REST APIs and stores data in MySQL using JPA. JWT is used "
            "for authentication and authorization. The system provides separate dashboards for "
            "students and librarians, improving usability and data accuracy."
        )
    )
    story.append(p("1.7 Technologies Used", "Heading2"))
    story.extend(
        bullets(
            [
                "React and TypeScript are used to build the frontend interface.",
                "Vite is used for fast frontend development and build processing.",
                "Tailwind CSS is used for responsive styling.",
                "Java Spring Boot is used for backend API development.",
                "Spring Security and JWT are used for authentication.",
                "Spring Data JPA is used for database operations.",
                "MySQL is used as the relational database.",
                "Swagger/OpenAPI is used for API documentation and testing.",
            ]
        )
    )
    story.append(PageBreak())


def chapter_2(story):
    story.append(p("Chapter 2: Literature Review / System Study", "Heading1"))
    story.append(p("2.1 Review of Similar Systems", "Heading2"))
    story.append(
        p(
            "Library automation systems are commonly used in universities and colleges to handle "
            "book cataloging, circulation, user registration, and reporting. Traditional library "
            "software often focuses on desktop-based use, while modern systems increasingly use web "
            "interfaces, REST APIs, and centralized databases. The present project follows this modern "
            "approach by separating the frontend and backend and using API-based communication."
        )
    )
    story.append(p("2.2 Comparative Analysis", "Heading2"))
    story.append(
        table(
            [
                ["Feature", "Manual System", "Proposed System"],
                ["Book Search", "Requires manual checking", "Instant search and filtering"],
                ["Availability", "May be outdated", "Updated through database records"],
                ["Issue Records", "Stored in registers", "Stored in MySQL"],
                ["Reports", "Prepared manually", "Generated from backend APIs"],
                ["Security", "No digital authentication", "JWT-based authentication"],
                ["Scalability", "Limited", "Can be extended with more modules"],
            ],
            [120, 155, 155],
        )
    )
    story.append(p("2.3 Development Methodology", "Heading2"))
    story.append(
        p(
            "The project follows an iterative development methodology. The system was divided into "
            "modules such as authentication, book catalog, issue-return, reports, notifications, and "
            "recommendations. Each module was analyzed, implemented, tested, and then integrated with "
            "the rest of the application. This approach helped in identifying bugs early and improving "
            "the project step by step."
        )
    )
    story.append(p("2.4 Relevant Frameworks and Libraries", "Heading2"))
    story.extend(
        bullets(
            [
                "React supports component-based UI development and state-driven rendering.",
                "TypeScript improves code reliability through static typing.",
                "Spring Boot simplifies backend development and provides production-ready defaults.",
                "Spring Data JPA reduces boilerplate database access code.",
                "Spring Security provides authentication and authorization support.",
                "Swagger provides browser-based API documentation and testing.",
                "MySQL provides relational data storage with structured table relationships.",
            ]
        )
    )
    story.append(p("2.5 Research Gap", "Heading2"))
    story.append(
        p(
            "Many simple library systems either use only frontend mock data or provide limited backend "
            "integration. Some systems do not provide role-based authentication, API documentation, "
            "or structured reports. The proposed system attempts to close this gap by providing a "
            "full-stack implementation with React frontend, Spring Boot APIs, JWT security, Swagger "
            "documentation, and MySQL persistence."
        )
    )
    story.append(PageBreak())


def chapter_3(story):
    story.append(p("Chapter 3: System Analysis", "Heading1"))
    story.append(p("3.1 Functional Requirements", "Heading2"))
    story.append(
        table(
            [
                ["Req. ID", "Requirement"],
                ["FR-01", "The system shall allow students and librarians to log in securely."],
                ["FR-02", "The system shall allow new users to register."],
                ["FR-03", "The system shall display a searchable book catalog."],
                ["FR-04", "The system shall allow librarians to add, update, and delete books."],
                ["FR-05", "The system shall allow books to be issued and returned."],
                ["FR-06", "The system shall maintain student issue history."],
                ["FR-07", "The system shall show reports and summary statistics."],
                ["FR-08", "The system shall show notifications to users."],
                ["FR-09", "The system shall provide recommendation data for students."],
            ],
            [70, 360],
        )
    )
    story.append(p("3.2 Non-Functional Requirements", "Heading2"))
    story.append(
        table(
            [
                ["Category", "Requirement"],
                ["Security", "Protected APIs must require JWT authentication."],
                ["Usability", "The user interface should be simple and responsive."],
                ["Performance", "Common pages should load data quickly from backend APIs."],
                ["Reliability", "Database operations should maintain correct availability counts."],
                ["Maintainability", "The codebase should be separated into frontend and backend modules."],
                ["Portability", "The project should run locally using Node.js, Java, Maven, and MySQL."],
            ],
            [110, 320],
        )
    )
    story.append(p("3.3 User Requirements", "Heading2"))
    story.extend(
        bullets(
            [
                "Students require a dashboard to view books, recommendations, and their issued items.",
                "Librarians require management screens for books, students, issues, returns, and reports.",
                "Both user roles require secure login and meaningful error messages.",
                "The institution requires persistent storage of library records.",
            ]
        )
    )
    story.append(p("3.4 Feasibility Study", "Heading2"))
    story.append(p("<b>Technical feasibility:</b> The required tools are open-source or commonly available: React, Java, Spring Boot, MySQL, npm, and Maven. The system can be developed and executed on a normal development machine.", "Body"))
    story.append(p("<b>Economic feasibility:</b> The project can be implemented with free development tools and does not require expensive infrastructure for local deployment.", "Body"))
    story.append(p("<b>Operational feasibility:</b> The system provides clear role-based screens, so students and librarians can use it with basic computer knowledge.", "Body"))
    story.append(p("3.5 System Architecture", "Heading2"))
    story.append(architecture_figure())
    story.append(p("The architecture separates the user interface, REST API layer, business logic, persistence layer, and database. This separation improves maintainability and allows future extension.", "Caption"))
    story.append(p("3.6 Data Flow Diagram", "Heading2"))
    story.append(dfd_figure())
    story.append(p("The Level 0 DFD shows students and librarians interacting with the central library system, while the backend reads and writes data to MySQL.", "Caption"))
    story.append(PageBreak())


def chapter_4(story):
    story.append(p("Chapter 4: System Design", "Heading1"))
    story.append(p("4.1 Use Case Diagram", "Heading2"))
    story.append(use_case_figure())
    story.append(p("The use case overview shows the main actions performed by students and librarians. Students mainly search and request books, while librarians manage books, issue/return operations, and reports.", "Caption"))
    story.append(p("4.2 Entity Relationship Design", "Heading2"))
    story.append(er_figure())
    story.append(p("The ER overview shows the relationship between users, books, book issue records, and notifications. A user can have multiple issue records and notifications. A book can appear in multiple issue records.", "Caption"))
    story.append(p("4.3 Database Schema", "Heading2"))
    story.append(
        table(
            [
                ["Table", "Important Fields", "Purpose"],
                ["profiles", "id, full_name, email, password_hash, role, student_id", "Stores user and role information"],
                ["books", "id, title, author, isbn, category, total_copies, available_copies", "Stores library book inventory"],
                ["book_issues", "id, book_id, student_id, issued_by, issue_date, due_date, return_date, status", "Stores issue and return transactions"],
                ["notifications", "id, profile_id, message, type, is_read, created_at", "Stores user notifications"],
            ],
            [80, 210, 140],
        )
    )
    story.append(p("4.4 API Design", "Heading2"))
    story.append(
        table(
            [
                ["Module", "Endpoint", "Method", "Purpose"],
                ["Auth", "/api/auth/register", "POST", "Register user"],
                ["Auth", "/api/auth/login", "POST", "Login and receive JWT token"],
                ["Auth", "/api/auth/me", "GET", "Fetch current user profile"],
                ["Books", "/api/books", "GET", "Fetch all books"],
                ["Books", "/api/books", "POST", "Add a new book"],
                ["Books", "/api/books/{id}", "PUT", "Update book details"],
                ["Books", "/api/books/{id}", "DELETE", "Delete book"],
                ["Issues", "/api/issues", "POST", "Issue/request a book"],
                ["Issues", "/api/issues/{id}/return", "PUT", "Mark book as returned"],
                ["Reports", "/api/reports/summary", "GET", "Fetch summary report"],
                ["Recommendations", "/api/recommendations", "GET", "Fetch recommended books"],
            ],
            [75, 140, 55, 160],
        )
    )
    story.append(p("4.5 Sequence Flow for Book Issue", "Heading2"))
    story.extend(
        bullets(
            [
                "Student selects an available book from the catalog.",
                "Frontend sends a POST request to the issue API with book and issue date information.",
                "Backend validates the logged-in user and book availability.",
                "Backend creates an issue record and decreases available copies.",
                "Frontend refreshes the book list and displays the updated availability.",
            ]
        )
    )
    story.append(p("Figure 4.3: Sequence flow for book issue operation", "Caption"))
    story.append(p("4.6 Activity Flow for Login", "Heading2"))
    story.extend(
        bullets(
            [
                "User enters email and password.",
                "Frontend sends credentials to the login API.",
                "Backend validates credentials and creates JWT token.",
                "Frontend stores token in localStorage.",
                "User is redirected to the dashboard based on role.",
            ]
        )
    )
    story.append(p("Figure 4.4: Activity flow for login and dashboard access", "Caption"))
    story.append(p("4.7 UI/UX Wireframe Overview", "Heading2"))
    story.extend(
        bullets(
            [
                "Login page provides authentication options and demo login support.",
                "Student dashboard displays books, issue history, and recommendations.",
                "Book catalog supports search, category filters, and availability filters.",
                "Librarian dashboard provides management actions for books and issues.",
                "Reports page presents summary cards, trends, and category statistics.",
            ]
        )
    )
    story.append(PageBreak())


def chapter_5(story):
    story.append(p("Chapter 5: System Implementation", "Heading1"))
    story.append(p("5.1 Development Environment", "Heading2"))
    story.append(
        table(
            [
                ["Component", "Technology"],
                ["Frontend", "React, TypeScript, Vite, Tailwind CSS"],
                ["Backend", "Java 17, Spring Boot"],
                ["Database", "MySQL"],
                ["Authentication", "JWT with Spring Security"],
                ["API Documentation", "Swagger/OpenAPI"],
                ["Build Tools", "npm and Maven"],
            ],
            [150, 280],
        )
    )
    story.append(p("5.2 Hardware and Software Requirements", "Heading2"))
    story.extend(
        bullets(
            [
                "Processor: Intel i3 or above recommended.",
                "RAM: Minimum 4 GB, 8 GB recommended.",
                "Operating System: Windows 10/11 or compatible OS.",
                "Software: Node.js, Java 17, Maven, MySQL, VS Code or IntelliJ IDEA.",
                "Browser: Chrome, Edge, or Firefox.",
            ]
        )
    )
    story.append(p("5.3 Frontend Implementation", "Heading2"))
    story.append(
        p(
            "The frontend is implemented using React components. The pages folder contains main "
            "screens such as StudentDashboard, BookCatalog, LibrarianDashboard, IssueReturnPage, "
            "ReportsPage, and AIRecommendations. Reusable UI elements such as Button, Badge, Input, "
            "and Modal are placed in the components folder."
        )
    )
    story.append(p("5.4 Backend Implementation", "Heading2"))
    story.append(
        p(
            "The backend follows a layered Spring Boot architecture. Controllers expose REST APIs, "
            "services contain business logic, repositories interact with the database, and model "
            "classes define database entities. Security classes handle JWT authentication and request "
            "filtering."
        )
    )
    story.append(p("5.5 Module-wise Explanation", "Heading2"))
    story.extend(
        bullets(
            [
                "<b>Authentication Module:</b> Handles registration, login, token generation, and current user profile.",
                "<b>Book Module:</b> Handles book listing, add, update, delete, and trending book APIs.",
                "<b>Issue Module:</b> Handles book issue requests, return processing, and issue history.",
                "<b>Student Module:</b> Allows librarians to view student records.",
                "<b>Reports Module:</b> Generates summary statistics and category-based data.",
                "<b>Notification Module:</b> Displays and updates user notifications.",
                "<b>Recommendation Module:</b> Suggests books using rule-based backend logic.",
            ]
        )
    )
    story.append(p("5.6 Important Code Snippets", "Heading2"))
    story.append(p("Frontend API helper:", "Heading3"))
    story.append(code("const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';\n\nexport async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {\n  const token = localStorage.getItem('library_token');\n  const res = await fetch(`${API_BASE_URL}${path}`, {\n    ...options,\n    headers: {\n      'Content-Type': 'application/json',\n      ...(token ? { Authorization: `Bearer ${token}` } : {}),\n      ...options.headers,\n    },\n  });\n  return res.json() as Promise<T>;\n}"))
    story.append(p("Database connection configuration:", "Heading3"))
    story.append(code("server.port=8080\nspring.datasource.url=jdbc:mysql://localhost:3306/library_management?createDatabaseIfNotExist=true\nspring.datasource.username=root\nspring.datasource.password=your_mysql_password\nspring.jpa.hibernate.ddl-auto=update\nspringdoc.swagger-ui.path=/swagger-ui.html"))
    story.append(p("5.7 Security Features", "Heading2"))
    story.extend(
        bullets(
            [
                "JWT token is used to authenticate protected API requests.",
                "Passwords are stored as hashed values in the backend.",
                "Role-based access separates student and librarian operations.",
                "Unauthorized requests return authentication errors.",
                "CORS configuration allows frontend requests from local development URLs.",
            ]
        )
    )
    story.append(p("5.8 Version Control", "Heading2"))
    story.append(
        p(
            "The project can be maintained using Git version control. Git helps track source code "
            "changes, manage versions, and collaborate during future development."
        )
    )
    story.append(PageBreak())


def chapter_6(story):
    story.append(p("Chapter 6: Testing", "Heading1"))
    story.append(p("6.1 Testing Strategy", "Heading2"))
    story.append(
        p(
            "Testing was performed at multiple levels. Frontend type checking was used to detect "
            "TypeScript errors. Backend Maven build was used to verify Java compilation. API testing "
            "was performed using Swagger and direct HTTP requests. Integration testing was performed "
            "by logging in as student and librarian and verifying API responses."
        )
    )
    story.append(p("6.2 Types of Testing", "Heading2"))
    story.extend(
        bullets(
            [
                "<b>Unit Testing:</b> Individual service and utility logic can be tested separately.",
                "<b>Integration Testing:</b> Frontend and backend APIs were checked together.",
                "<b>System Testing:</b> Login, book catalog, reports, issue history, and recommendations were verified.",
                "<b>Validation Testing:</b> Invalid login and unauthorized access cases were checked.",
            ]
        )
    )
    story.append(p("6.3 Test Cases", "Heading2"))
    story.append(
        table(
            [
                ["Test Case ID", "Input", "Expected Output", "Actual Output", "Status"],
                ["TC-01", "Valid librarian email and password", "Login successful with token", "Login successful", "Pass"],
                ["TC-02", "Valid student email and password", "Login successful with token", "Login successful", "Pass"],
                ["TC-03", "Invalid password", "Error message", "Error returned", "Pass"],
                ["TC-04", "Open Swagger URL", "API documentation visible", "Swagger responded", "Pass"],
                ["TC-05", "Fetch /api/books", "List of books", "Seeded books returned", "Pass"],
                ["TC-06", "Fetch /api/students as librarian", "Student list", "Student list returned", "Pass"],
                ["TC-07", "Fetch /api/reports/summary", "Summary statistics", "Report data returned", "Pass"],
                ["TC-08", "Fetch /api/issues/my as student", "Student issue history", "Issue history returned", "Pass"],
                ["TC-09", "Fetch /api/recommendations", "Recommended books", "Recommendations returned", "Pass"],
                ["TC-10", "Frontend typecheck", "No TypeScript errors", "Typecheck passed", "Pass"],
                ["TC-11", "Frontend production build", "Build successful", "Build passed", "Pass"],
                ["TC-12", "Backend Maven test/build", "Build success", "Build success", "Pass"],
            ],
            [65, 95, 100, 95, 55],
        )
    )
    story.append(p("6.4 Bug Reports", "Heading2"))
    story.append(
        table(
            [
                ["Bug", "Cause", "Fix"],
                ["Missing shared TypeScript types", "The project referenced common interfaces but lacked a central type file.", "Added src/types.ts with Profile, Book, BookIssue, Notification, and role definitions."],
                ["Frontend profile reference error", "BookCatalog used profile without reading it from AuthContext.", "Imported useAuth and read profile inside BookCatalog."],
                ["Supabase dependency not required", "Original frontend used Supabase-style structure.", "Replaced it with Java API helper and MySQL-backed Spring Boot APIs."],
                ["Database persistence requirement", "Frontend-only/mock data was not enough for real storage.", "Added Java Spring Boot backend connected to MySQL."],
            ],
            [95, 150, 185],
        )
    )
    story.append(PageBreak())


def chapter_7(story):
    story.append(p("Chapter 7: Results and Discussion", "Heading1"))
    story.append(p("7.1 Output Overview", "Heading2"))
    story.append(
        p(
            "The system provides separate user experiences for students and librarians. After login, "
            "the user is redirected to the correct dashboard based on role. Students can access the "
            "catalog, issue history, and recommendations. Librarians can manage books, issue/return "
            "records, student records, and reports."
        )
    )
    story.append(p("7.2 Screenshots to Add in Final Submission", "Heading2"))
    story.extend(
        bullets(
            [
                "Login page screenshot.",
                "Student dashboard screenshot.",
                "Book catalog screenshot.",
                "Book details modal screenshot.",
                "Librarian dashboard screenshot.",
                "Issue/return page screenshot.",
                "Reports page screenshot.",
                "Swagger UI screenshot.",
                "MySQL database tables screenshot.",
            ]
        )
    )
    story.append(p("7.3 Performance Evaluation", "Heading2"))
    story.append(
        p(
            "The application is suitable for local development and small to medium educational "
            "library use cases. The frontend is lightweight because it is built using Vite and React. "
            "The backend uses Spring Boot and JPA, which are reliable for structured business "
            "applications. MySQL provides stable relational storage for users, books, issue records, "
            "and notifications."
        )
    )
    story.append(p("7.4 Comparison with Existing System", "Heading2"))
    story.append(
        table(
            [
                ["Aspect", "Existing Manual System", "Developed System"],
                ["Search", "Manual and slow", "Fast search and filters"],
                ["Records", "Registers/spreadsheets", "MySQL database"],
                ["Authentication", "Not available", "JWT login"],
                ["Reports", "Manual calculation", "API-based report summary"],
                ["Access", "Only through librarian", "Student and librarian dashboards"],
                ["Accuracy", "Prone to human errors", "Centralized data updates"],
            ],
            [100, 165, 165],
        )
    )
    story.append(p("7.5 Improvements Achieved", "Heading2"))
    story.extend(
        bullets(
            [
                "Library data is stored in a structured relational database.",
                "Frontend is connected to backend APIs instead of direct mock data.",
                "Role-based authentication improves security and access control.",
                "Swagger makes backend testing easier.",
                "Reports provide better visibility into library operations.",
                "The system can be extended for deployment, mobile apps, and advanced analytics.",
            ]
        )
    )
    story.append(PageBreak())


def chapter_8(story):
    story.append(p("Chapter 8: Conclusion and Future Enhancements", "Heading1"))
    story.append(p("8.1 Conclusion", "Heading2"))
    story.append(
        p(
            "The Library Management System successfully demonstrates a full-stack approach to "
            "managing library operations. The project includes a React frontend, Java Spring Boot "
            "backend, MySQL database, JWT authentication, Swagger API documentation, and role-based "
            "functionality for students and librarians. The major objectives of book catalog "
            "management, issue-return handling, reporting, and user authentication have been achieved."
        )
    )
    story.append(
        p(
            "The project helped in understanding software development lifecycle activities such as "
            "requirement analysis, database design, API development, frontend-backend integration, "
            "testing, and documentation. It also provides a strong foundation for future improvement "
            "and deployment."
        )
    )
    story.append(p("8.2 Key Achievements", "Heading2"))
    story.extend(
        bullets(
            [
                "Implemented role-based student and librarian workflows.",
                "Connected frontend to Spring Boot REST APIs.",
                "Connected backend to MySQL database.",
                "Added JWT-based authentication.",
                "Added Swagger API documentation.",
                "Prepared report and testing structure according to academic guidelines.",
            ]
        )
    )
    story.append(p("8.3 Technical Learning Outcomes", "Heading2"))
    story.extend(
        bullets(
            [
                "Understanding of React component-based frontend development.",
                "Understanding of REST API integration.",
                "Understanding of Spring Boot layered architecture.",
                "Understanding of JPA entity relationships and repositories.",
                "Understanding of JWT authentication and role-based access.",
                "Understanding of MySQL database schema design.",
            ]
        )
    )
    story.append(p("8.4 Future Scope", "Heading2"))
    story.extend(
        bullets(
            [
                "Fine calculation for overdue books.",
                "Email or SMS notifications.",
                "Barcode or QR-based issue and return system.",
                "Book reservation and waitlist system.",
                "PDF and Excel report export.",
                "Cloud deployment with production database configuration.",
                "Mobile application support.",
                "Real AI recommendation model integration.",
            ]
        )
    )
    story.append(PageBreak())


def chapter_9(story):
    story.append(p("Chapter 9: References", "Heading1"))
    references = [
        "Sommerville, I. (2016). <i>Software Engineering</i> (10th ed.). Pearson.",
        "Pressman, R. S., & Maxim, B. R. (2019). <i>Software Engineering: A Practitioner's Approach</i>. McGraw-Hill.",
        "Silberschatz, A., Korth, H. F., & Sudarshan, S. (2019). <i>Database System Concepts</i>. McGraw-Hill.",
        "Elmasri, R., & Navathe, S. B. (2016). <i>Fundamentals of Database Systems</i>. Pearson.",
        "Oracle. (2024). <i>Java Platform, Standard Edition Documentation</i>. https://docs.oracle.com/en/java/",
        "Spring. (2024). <i>Spring Boot Reference Documentation</i>. https://docs.spring.io/spring-boot/",
        "Spring. (2024). <i>Spring Security Reference Documentation</i>. https://docs.spring.io/spring-security/",
        "Spring. (2024). <i>Spring Data JPA Reference Documentation</i>. https://docs.spring.io/spring-data/jpa/",
        "Hibernate. (2024). <i>Hibernate ORM User Guide</i>. https://hibernate.org/orm/documentation/",
        "MySQL. (2024). <i>MySQL Reference Manual</i>. https://dev.mysql.com/doc/",
        "React. (2024). <i>React Documentation</i>. https://react.dev/",
        "Microsoft. (2024). <i>TypeScript Handbook</i>. https://www.typescriptlang.org/docs/",
        "Vite. (2024). <i>Vite Documentation</i>. https://vitejs.dev/guide/",
        "Tailwind Labs. (2024). <i>Tailwind CSS Documentation</i>. https://tailwindcss.com/docs",
        "OpenAPI Initiative. (2024). <i>OpenAPI Specification</i>. https://spec.openapis.org/oas/latest.html",
        "Swagger. (2024). <i>Swagger UI Documentation</i>. https://swagger.io/tools/swagger-ui/",
        "IETF. (2015). <i>JSON Web Token (JWT), RFC 7519</i>. https://www.rfc-editor.org/rfc/rfc7519",
        "OWASP Foundation. (2021). <i>OWASP Top 10 Web Application Security Risks</i>. https://owasp.org/www-project-top-ten/",
        "MDN Web Docs. (2024). <i>Fetch API</i>. https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API",
        "Apache Maven Project. (2024). <i>Apache Maven Documentation</i>. https://maven.apache.org/guides/",
        "Lucide. (2024). <i>Lucide Icons Documentation</i>. https://lucide.dev/",
    ]
    for i, ref in enumerate(references, 1):
        story.append(p(f"{i}. {ref}", "Body"))
    story.append(PageBreak())


def chapter_10(story):
    story.append(p("Chapter 10: Appendices", "Heading1"))
    story.append(p("Appendix A: Source Code Structure", "Heading2"))
    story.append(code("Book-manegement-main/\n  src/\n    components/\n    context/\n    data/\n    lib/\n    pages/\n    types.ts\n  backend/\n    src/main/java/com/library/\n      config/\n      controller/\n      dto/\n      exception/\n      mapper/\n      model/\n      repository/\n      security/\n      service/\n    src/main/resources/application.properties\n  public/\n  package.json\n  vite.config.ts"))
    story.append(p("Appendix B: Database Setup", "Heading2"))
    story.append(code("CREATE DATABASE library_management;\n\n-- Backend can also create the database automatically when\n-- createDatabaseIfNotExist=true is present in the JDBC URL."))
    story.append(p("Appendix C: Installation Guide", "Heading2"))
    story.extend(
        bullets(
            [
                "Install Java 17, Node.js, Maven, and MySQL.",
                "Update backend/src/main/resources/application.properties with MySQL username and password.",
                "Run backend using Maven: mvn spring-boot:run.",
                "Run frontend using npm run dev.",
                "Open frontend at http://localhost:5173.",
                "Open Swagger at http://localhost:8080/swagger-ui.html.",
            ]
        )
    )
    story.append(p("Appendix D: User Manual", "Heading2"))
    story.extend(
        bullets(
            [
                "Student logs in and opens the dashboard.",
                "Student searches books from the catalog.",
                "Student requests an available book.",
                "Librarian logs in and opens librarian dashboard.",
                "Librarian adds, edits, deletes, issues, and returns books.",
                "Librarian checks reports and student records.",
            ]
        )
    )
    story.append(p("Appendix E: Items to Attach in Final Submission", "Heading2"))
    story.extend(
        bullets(
            [
                "Complete source code printout or repository reference, as required by the institute.",
                "Database dump file.",
                "Final screenshots of working application screens.",
                "Signed bonafide certificate.",
                "Guide approval signature.",
            ]
        )
    )


def build_report():
    doc = ReportDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=inch,
        bottomMargin=inch,
        title="Library Management System Project Report",
        author=STUDENT_NAME,
    )
    story = []
    cover_page(story)
    preliminary_pages(story)
    toc_pages(story)
    chapter_1(story)
    chapter_2(story)
    chapter_3(story)
    chapter_4(story)
    chapter_5(story)
    chapter_6(story)
    chapter_7(story)
    chapter_8(story)
    chapter_9(story)
    chapter_10(story)
    doc.multiBuild(story, onFirstPage=page_number, onLaterPages=page_number)
    return OUTPUT


if __name__ == "__main__":
    print(build_report())
