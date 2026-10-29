# WebShield

WebShield is an authorized web application security assessment platform that combines automated security checks, analyst verification, evidence management, remediation tracking, and reporting in one workflow.

The project was developed to move beyond a simple vulnerability dashboard. WebShield includes its own Python-based security engine that interacts with an authorized target, analyzes HTTP behaviour, generates potential findings, and sends them to a React dashboard for analyst review.

> WebShield is designed only for systems that the tester owns or has explicit authorization to assess.

---

## Project Overview

Traditional vulnerability dashboards mainly store findings after testing has already been performed using external tools.

WebShield extends that workflow by adding its own controlled security-testing engine.

The platform can:

- Perform selected automated web security checks
- Test authentication using an authorized lab account
- Analyze JWT metadata and security properties
- Perform bounded authentication rate-limit testing
- Compare authorization behaviour between two controlled test accounts
- Generate potential findings automatically
- Allow an analyst to confirm or dismiss findings
- Store manual and automated evidence
- Track remediation and retesting
- Generate a printable security assessment report

---

## Architecture

```text
Authorized Target
      |
      v
WebShield React Dashboard
      |
      | HTTP / JSON
      v
FastAPI Security Engine
      |
      | httpx
      v
Target Application
      |
      v
HTTP Response Analysis
      |
      v
Potential Security Findings
      |
      v
Analyst Review
      |
      +---- Confirm
      |
      +---- Dismiss
      |
      v
Remediation / Retesting
      |
      v
Security Report


Security Testing Environment

The current project is demonstrated against:

OWASP Juice Shop

OWASP Juice Shop is an intentionally vulnerable web application designed for security education and authorized testing.

It is run locally using Docker.

sudo docker run --rm -p 3000:3000 bkimminich/juice-shop

Target:

http://localhost:3000
Technology Stack
Frontend
React
Vite
JavaScript
CSS
Browser localStorage
Backend
Python
FastAPI
Uvicorn
httpx
Pydantic
Security Environment
Kali Linux
OWASP Juice Shop
Docker
Burp Suite
OWASP Top 10
Development & Deployment
Git
GitHub
GitHub Pages
Core Security Modules
1. Passive Security Assessment

WebShield sends controlled HTTP requests to the target and analyzes response behaviour.

Current checks include:

Target connectivity
HTTPS usage
Security headers
Server information disclosure
Cookie security attributes
CORS configuration

Example:

Target Connectivity        PASS
HTTPS                      REVIEW
Security Headers           REVIEW
Cookie Security            INFO
CORS Configuration         PASS

The engine generates potential findings where appropriate.

2. Authentication & Session Assessment

WebShield supports authenticated security testing using a dedicated authorized test account.

The engine can:

Send a login request
Validate authentication success
Capture an authentication token
Access an authorized protected resource
Inspect authentication cookie behaviour
Support session invalidation testing when a logout endpoint is available

Example:

Authentication                  PASS
Token Acquisition               PASS
Authenticated Resource Access   PASS
Session Invalidation            INFO
JWT Security Analysis

When WebShield detects a JWT authentication token, it analyzes selected token metadata.

Current JWT checks include:

JWT structure
Signing algorithm
iat claim
exp claim
Token lifetime

Example result:

JWT Signing Algorithm     PASS
Algorithm                 RS256

JWT Expiration            REVIEW
exp claim not present

JWT Issued At             PASS

JWT Lifetime              INFO

A missing expiration claim can generate a potential authentication finding.

Important:

WebShield currently decodes and analyzes JWT metadata.

It does not independently prove that the JWT signature is cryptographically valid.

Authentication Rate-Limit Assessment

WebShield includes a controlled authentication rate-limit test.

The test is deliberately bounded.

Maximum requests:

5 controlled failed authentication requests

The engine records:

HTTP response codes
HTTP 429 responses
Retry-After headers
Observable throttling behaviour

Example:

Attempts Sent      5
HTTP 429           0
Throttling         NOT OBSERVED

If no throttling behaviour is observed, WebShield generates a potential rate-limiting finding for analyst review.

This test is not intended to perform password brute forcing.

Access-Control Assessment

WebShield implements a controlled horizontal authorization test using two explicitly authorized lab accounts.

Testing workflow:

Account A Authentication
        |
        v
Account B Authentication
        |
        v
Account A -> Account A Resource
        |
        v
Account B -> Account B Resource
        |
        v
Account A -> Account B Resource

Example:

Account A -> Own Resource      HTTP 200
Account B -> Own Resource      HTTP 200
Account A -> B Resource        HTTP 200

If Account A can access Account B's controlled resource, WebShield generates:

Potential Horizontal Access-Control Weakness
Severity: HIGH
Category: Broken Access Control

The result remains a potential finding until an analyst verifies it.

Analyst Verification Workflow

Automated scanner results are not immediately treated as confirmed vulnerabilities.

WebShield uses the following workflow:

Security Engine
      |
      v
Potential Finding
      |
      v
Analyst Review
   /       \
CONFIRM   DISMISS
   |
   v
OPEN

This reduces the risk of automatically treating false positives as confirmed vulnerabilities.

Evidence Management

WebShield supports two types of evidence.

Manual Evidence

Screenshots collected during manual security testing.

Automated Evidence

Structured text generated directly by the WebShield Security Engine.

Example:

SCANNER EVIDENCE

Account A own resource: HTTP 200
Account B own resource: HTTP 200
Account A -> Account B resource: HTTP 200
Remediation & Retesting

Confirmed findings can enter the remediation lifecycle.

OPEN
 |
 v
MARK FOR RETEST
 |
 v
RETESTING
 |
 +-------------------+
 |                   |
 v                   v
STILL              FIXED
VULNERABLE
 |                   |
 v                   v
OPEN              RESOLVED

This allows WebShield to track the security issue beyond initial discovery.

Security Reporting

The Reports section summarizes:

Target information
Security score
Risk level
Confirmed findings
Severity distribution
Open findings
Retesting findings
Resolved findings

WebShield can also generate a printable security assessment report.

The report includes:

Finding title
Finding ID
Category
Severity
Status
Source
Verification state
Description
Impact
Recommendation
Scanner evidence
Remediation information

The report can be saved as PDF using the browser print interface.

Project Workflow
Create Assessment
       |
       v
Run Security Checks
       |
       v
Potential Findings
       |
       v
Analyst Verification
       |
       v
Confirmed Findings
       |
       v
Risk Analysis
       |
       v
Remediation
       |
       v
Retesting
       |
       v
Resolved Findings
       |
       v
Security Report
Project Structure
WebShield/
|
├── frontend/
|   |
|   ├── src/
|   |   ├── App.jsx
|   |   ├── App.css
|   |   ├── SecurityScanner.jsx
|   |   ├── SessionSecurityScanner.jsx
|   |   ├── RateLimitScanner.jsx
|   |   ├── AccessControlScanner.jsx
|   |   ├── ReportGenerator.jsx
|   |   ├── NewAssessmentModal.jsx
|   |   └── AddFindingModal.jsx
|   |
|   ├── public/
|   ├── package.json
|   └── vite.config.js
|
└── backend/
    ├── main.py
    └── venv/
Running WebShield Locally

Three services are used during the lab demonstration.

1. Start OWASP Juice Shop
sudo docker run --rm -p 3000:3000 bkimminich/juice-shop

Open:

http://localhost:3000
2. Start WebShield Security Engine
cd ~/WebShield/backend
source venv/bin/activate

uvicorn main:app --reload --host 127.0.0.1 --port 8000

Backend:

http://127.0.0.1:8000

Health check:

http://127.0.0.1:8000/health

FastAPI API documentation:

http://127.0.0.1:8000/docs
3. Start WebShield Frontend
cd ~/WebShield/frontend
npm run dev

Open the Vite development URL shown in the terminal.

Building the Frontend
npm run build

A successful build displays:

✓ built
Data Persistence

The current prototype uses browser localStorage.

Important keys:

webshieldCurrentAssessment
webshieldFindings

This allows assessment and finding information to survive normal page refreshes in the same browser profile and origin.

For a production implementation, this would normally be replaced with authenticated server-side storage and a database.

Security Score

WebShield currently uses a project-specific security score based on confirmed active findings and their severity.

It is designed for dashboard visualization.

It is not CVSS.

CVSS is a separate standardized vulnerability severity scoring system.

Current Limitations

WebShield is an educational security assessment platform and is not intended to replace enterprise vulnerability scanners.

Current limitations include:

Local browser storage instead of a production database
Selected security checks rather than full web application coverage
JWT metadata analysis rather than independent cryptographic signature verification
Rate-limit testing uses a deliberately small bounded number of requests
Access-control testing requires explicitly controlled accounts and resources
Some findings still require manual analyst validation
The current backend is designed primarily for the authorized local lab environment
Security & Ethical Boundary

WebShield should only be used against:

Systems owned by the tester
Local security labs
Intentionally vulnerable applications
Systems where explicit security-testing authorization has been provided

The current demonstration uses OWASP Juice Shop running locally.

WebShield is not designed for unauthorized testing of public websites.

What I Built

The main contribution of this project is not Kali Linux, Docker, Burp Suite, or OWASP Juice Shop.

Those are supporting tools.

The WebShield project itself includes:

React security assessment dashboard
Python FastAPI security engine
HTTP response analysis
Automated potential-finding generation
Authentication testing workflow
JWT metadata analysis
Controlled rate-limit assessment
Controlled two-account authorization assessment
Manual and automated evidence management
Analyst verification workflow
Risk classification
Remediation and retesting workflow
Security report generation
Future Improvements

Possible future improvements include:

PostgreSQL or MongoDB database
User authentication and role-based access
Assessment history
Finding edit functionality
CVSS scoring
Additional safe security-testing modules
Background scan jobs
Public HTTPS backend deployment
Improved report templates
CI/CD security integration
Containerized WebShield deployment
Disclaimer

WebShield was developed for cybersecurity education and authorized security assessment.

Only test applications and systems for which you have explicit permission.

Author

Riya Singh

BCA Graduate
Full-Stack Development & Cybersecurity
