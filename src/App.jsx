import { useEffect, useState } from "react";
import "./App.css";

import NewAssessmentModal from "./NewAssessmentModal";
import AddFindingModal from "./AddFindingModal";

import SecurityScanner from "./SecurityScanner";
import SessionSecurityScanner from "./SessionSecurityScanner";
import RateLimitScanner from "./RateLimitScanner";
import AccessControlScanner from "./AccessControlScanner";
import ReportGenerator from "./ReportGenerator";


function App() {
  // =====================================================
  // UI STATE
  // =====================================================

  const [showAssessment, setShowAssessment] = useState(false);
  const [showFinding, setShowFinding] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");

  // =====================================================
  // DATA
  // =====================================================

  const [assessment, setAssessment] = useState(null);
  const [findings, setFindings] = useState([]);

  // =====================================================
  // LOAD SAVED DATA
  // =====================================================

  useEffect(() => {
    const savedAssessment = localStorage.getItem(
      "webshieldCurrentAssessment"
    );

    const savedFindings = localStorage.getItem(
      "webshieldFindings"
    );

    if (savedAssessment) {
      try {
        setAssessment(JSON.parse(savedAssessment));
      } catch (error) {
        console.error(
          "Could not load assessment:",
          error
        );
      }
    }

    if (savedFindings) {
      try {
        const parsed = JSON.parse(savedFindings);

        if (Array.isArray(parsed)) {
          setFindings(parsed);
        }
      } catch (error) {
        console.error(
          "Could not load findings:",
          error
        );
      }
    }
  }, []);

  // =====================================================
  // SAVE HELPER
  // =====================================================

  const saveFindings = (updatedFindings) => {
    localStorage.setItem(
      "webshieldFindings",
      JSON.stringify(updatedFindings)
    );
  };

  // =====================================================
  // MANUAL FINDING
  // =====================================================

  const handleFindingCreated = (newFinding) => {
    setFindings((currentFindings) => {
      const preparedFinding = {
        ...newFinding,

        verification:
          newFinding.verification || "CONFIRMED",

        status:
          newFinding.status?.toUpperCase() || "OPEN",

        severity:
          newFinding.severity?.toUpperCase() || "LOW",

        source:
          newFinding.source || "Manual Assessment",

        createdAt:
          newFinding.createdAt ||
          new Date().toISOString(),
      };

      const updatedFindings = [
        preparedFinding,
        ...currentFindings,
      ];

      saveFindings(updatedFindings);

      return updatedFindings;
    });
  };

  // =====================================================
  // AUTOMATED SCANNER FINDINGS
  // =====================================================

  const handleScannerFindings = (scannerFindings) => {
    if (
      !Array.isArray(scannerFindings) ||
      scannerFindings.length === 0
    ) {
      return;
    }

    setFindings((currentFindings) => {
      const existingKeys = new Set(
        currentFindings.map(
          (finding) =>
            `${finding.title}|${finding.url || ""}`
        )
      );

      const timestamp = Date.now();

      const newScannerFindings = scannerFindings
        .filter(
          (finding) =>
            !existingKeys.has(
              `${finding.title}|${finding.url || ""}`
            )
        )
        .map((finding, index) => ({
          ...finding,

          id:
            finding.id ||
            `AUTO-${timestamp}-${index + 1}`,

          severity:
            finding.severity?.toUpperCase() ||
            "LOW",

          status: "REVIEW",

          verification: "POTENTIAL",

          source:
            "WebShield Security Engine",

          detectedAt:
            new Date().toISOString(),

          retestHistory:
            Array.isArray(finding.retestHistory)
              ? finding.retestHistory
              : [],
        }));

      if (newScannerFindings.length === 0) {
        return currentFindings;
      }

      const updatedFindings = [
        ...newScannerFindings,
        ...currentFindings,
      ];

      saveFindings(updatedFindings);

      return updatedFindings;
    });
  };

  // =====================================================
  // ANALYST REVIEW
  // =====================================================

  const confirmScannerFinding = (findingId) => {
    setFindings((currentFindings) => {
      const updatedFindings = currentFindings.map(
        (finding) =>
          finding.id === findingId
            ? {
                ...finding,
                verification: "CONFIRMED",
                status: "OPEN",
                confirmedAt:
                  new Date().toISOString(),
              }
            : finding
      );

      saveFindings(updatedFindings);

      return updatedFindings;
    });
  };


  const dismissScannerFinding = (findingId) => {
    setFindings((currentFindings) => {
      const updatedFindings = currentFindings.map(
        (finding) =>
          finding.id === findingId
            ? {
                ...finding,
                verification: "DISMISSED",
                status: "DISMISSED",
                dismissedAt:
                  new Date().toISOString(),
              }
            : finding
      );

      saveFindings(updatedFindings);

      return updatedFindings;
    });
  };

  // =====================================================
  // REMEDIATION & RETESTING
  // =====================================================

  const markForRetest = (findingId) => {
    setFindings((currentFindings) => {
      const now = new Date().toISOString();

      const updatedFindings = currentFindings.map(
        (finding) => {
          if (finding.id !== findingId) {
            return finding;
          }

          const history = Array.isArray(
            finding.retestHistory
          )
            ? finding.retestHistory
            : [];

          return {
            ...finding,

            status: "RETESTING",

            retestStartedAt: now,

            retestHistory: [
              ...history,
              {
                action: "RETEST_STARTED",
                timestamp: now,
              },
            ],
          };
        }
      );

      saveFindings(updatedFindings);

      return updatedFindings;
    });
  };


  const markStillVulnerable = (findingId) => {
    setFindings((currentFindings) => {
      const now = new Date().toISOString();

      const updatedFindings = currentFindings.map(
        (finding) => {
          if (finding.id !== findingId) {
            return finding;
          }

          const history = Array.isArray(
            finding.retestHistory
          )
            ? finding.retestHistory
            : [];

          return {
            ...finding,

            status: "OPEN",

            retestResult:
              "STILL_VULNERABLE",

            lastRetestAt: now,

            resolvedAt: null,

            retestHistory: [
              ...history,
              {
                action:
                  "STILL_VULNERABLE",
                timestamp: now,
              },
            ],
          };
        }
      );

      saveFindings(updatedFindings);

      return updatedFindings;
    });
  };


  const markResolved = (findingId) => {
    setFindings((currentFindings) => {
      const now = new Date().toISOString();

      const updatedFindings = currentFindings.map(
        (finding) => {
          if (finding.id !== findingId) {
            return finding;
          }

          const history = Array.isArray(
            finding.retestHistory
          )
            ? finding.retestHistory
            : [];

          return {
            ...finding,

            status: "RESOLVED",

            retestResult: "RESOLVED",

            lastRetestAt: now,

            resolvedAt: now,

            retestHistory: [
              ...history,
              {
                action:
                  "REMEDIATION_VERIFIED",
                timestamp: now,
              },
            ],
          };
        }
      );

      saveFindings(updatedFindings);

      return updatedFindings;
    });
  };

  // =====================================================
  // FINDING GROUPS
  // =====================================================

  const visibleFindings = findings.filter(
    (finding) =>
      finding.verification !== "DISMISSED"
  );


  const potentialFindings =
    visibleFindings.filter(
      (finding) =>
        finding.verification === "POTENTIAL"
    );


  const potentialCount =
    potentialFindings.length;


  const confirmedFindings =
    visibleFindings.filter(
      (finding) =>
        finding.verification !== "POTENTIAL"
    );


  const activeFindings =
    confirmedFindings.filter(
      (finding) =>
        finding.status !== "RESOLVED"
    );

  // =====================================================
  // COUNTS
  // =====================================================

  const criticalCount =
    activeFindings.filter(
      (finding) =>
        finding.severity === "CRITICAL"
    ).length;


  const highCount =
    activeFindings.filter(
      (finding) =>
        finding.severity === "HIGH"
    ).length;


  const mediumCount =
    activeFindings.filter(
      (finding) =>
        finding.severity === "MEDIUM"
    ).length;


  const lowCount =
    activeFindings.filter(
      (finding) =>
        finding.severity === "LOW"
    ).length;


  const openCount =
    confirmedFindings.filter(
      (finding) =>
        finding.status === "OPEN"
    ).length;


  const retestingCount =
    confirmedFindings.filter(
      (finding) =>
        finding.status === "RETESTING"
    ).length;


  const resolvedCount =
    confirmedFindings.filter(
      (finding) =>
        finding.status === "RESOLVED"
    ).length;

  // =====================================================
  // SECURITY SCORE
  // =====================================================

  const deductions =
    criticalCount * 25 +
    highCount * 15 +
    mediumCount * 8 +
    lowCount * 3;


  const securityScore = Math.max(
    0,
    100 - deductions
  );


  let riskLevel = "Strong";

  if (securityScore < 50) {
    riskLevel = "High Risk";
  } else if (securityScore < 75) {
    riskLevel = "Needs Improvement";
  } else if (securityScore < 90) {
    riskLevel = "Moderate";
  }

  // =====================================================
  // RISK BAR
  // =====================================================

  const severityPercentage = (number) => {
    if (activeFindings.length === 0) {
      return "0%";
    }

    return `${Math.round(
      (number / activeFindings.length) * 100
    )}%`;
  };

  // =====================================================
  // MENU
  // =====================================================

  const menuItems = [
    "Dashboard",
    "Assessments",
    "Vulnerabilities",
    "OWASP Top 10",
    "Evidence",
    "Remediation",
    "Reports",
  ];


  const getPageTitle = () => {
    switch (activePage) {
      case "Dashboard":
        return "Security Dashboard";

      case "Assessments":
        return "Security Assessments";

      case "Vulnerabilities":
        return "Vulnerability Management";

      case "OWASP Top 10":
        return "OWASP Top 10";

      case "Evidence":
        return "Security Evidence";

      case "Remediation":
        return "Remediation Tracking";

      case "Reports":
        return "Security Reports";

      default:
        return "Security Dashboard";
    }
  };

  // =====================================================
  // EVIDENCE DISPLAY
  // =====================================================

  const EvidenceDisplay = ({ finding }) => {
    if (!finding.evidence) {
      return null;
    }

    const isImage =
      typeof finding.evidence === "string" &&
      finding.evidence.startsWith(
        "data:image"
      );


    if (isImage) {
      return (
        <div className="finding-evidence">
          <img
            src={finding.evidence}
            alt={`Evidence for ${finding.title}`}
            title="Click to open full evidence"
            onClick={() =>
              window.open(
                finding.evidence,
                "_blank"
              )
            }
          />

          <span>
            SCREENSHOT EVIDENCE • CLICK TO VIEW
          </span>
        </div>
      );
    }


    return (
      <div
        style={{
          marginTop: "9px",
          padding: "10px 12px",
          maxWidth: "350px",
          border:
            "1px solid rgba(255,255,255,0.08)",
          borderRadius: "6px",
          background:
            "rgba(255,255,255,0.025)",
        }}
      >
        <span
          style={{
            display: "block",
            marginBottom: "5px",
            fontSize: "8px",
            fontWeight: "700",
            letterSpacing: "1.2px",
            color: "#ff4545",
          }}
        >
          SCANNER EVIDENCE
        </span>

        <small
          style={{
            display: "block",
            fontSize: "10px",
            lineHeight: "1.5",
            color: "#8994a3",
            wordBreak: "break-word",
          }}
        >
          {String(finding.evidence)}
        </small>
      </div>
    );
  };

  // =====================================================
  // ANALYST REVIEW CONTROLS
  // =====================================================

  const AnalystReviewControls = ({
    finding,
  }) => {
    if (
      finding.verification !== "POTENTIAL"
    ) {
      return null;
    }

    return (
      <div
        style={{
          marginTop: "9px",
          display: "flex",
          flexDirection: "column",
          gap: "7px",
          alignItems: "flex-start",
        }}
      >
        <span
          style={{
            fontSize: "8px",
            letterSpacing: "1.15px",
            fontWeight: "700",
            color: "#f59e0b",
          }}
        >
          POTENTIAL • NEEDS ANALYST REVIEW
        </span>

        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          <button
            type="button"
            onClick={() =>
              confirmScannerFinding(
                finding.id
              )
            }
            style={{
              padding: "6px 11px",
              borderRadius: "5px",
              border:
                "1px solid rgba(34,197,94,0.4)",
              background:
                "rgba(34,197,94,0.08)",
              color: "#22c55e",
              fontSize: "8px",
              fontWeight: "700",
              letterSpacing: "0.7px",
              cursor: "pointer",
            }}
          >
            CONFIRM
          </button>

          <button
            type="button"
            onClick={() =>
              dismissScannerFinding(
                finding.id
              )
            }
            style={{
              padding: "6px 11px",
              borderRadius: "5px",
              border:
                "1px solid rgba(239,68,68,0.4)",
              background:
                "rgba(239,68,68,0.08)",
              color: "#ef4444",
              fontSize: "8px",
              fontWeight: "700",
              letterSpacing: "0.7px",
              cursor: "pointer",
            }}
          >
            DISMISS
          </button>
        </div>
      </div>
    );
  };

  // =====================================================
  // REMEDIATION CONTROLS
  // =====================================================

  const RemediationControls = ({
    finding,
  }) => {
    if (
      finding.verification === "POTENTIAL"
    ) {
      return (
        <span
          style={{
            display: "block",
            marginTop: "9px",
            color: "#f59e0b",
            fontSize: "8px",
            fontWeight: "700",
            letterSpacing: "1px",
          }}
        >
          ANALYST CONFIRMATION REQUIRED
        </span>
      );
    }


    if (finding.status === "OPEN") {
      return (
        <div
          style={{
            marginTop: "10px",
          }}
        >
          <button
            type="button"
            onClick={() =>
              markForRetest(finding.id)
            }
            style={{
              padding: "7px 11px",
              borderRadius: "5px",
              border:
                "1px solid rgba(245,158,11,0.4)",
              background:
                "rgba(245,158,11,0.08)",
              color: "#f59e0b",
              fontSize: "8px",
              fontWeight: "700",
              letterSpacing: "0.8px",
              cursor: "pointer",
            }}
          >
            MARK FOR RETEST
          </button>
        </div>
      );
    }


    if (
      finding.status === "RETESTING"
    ) {
      return (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "10px",
          }}
        >
          <button
            type="button"
            onClick={() =>
              markStillVulnerable(
                finding.id
              )
            }
            style={{
              padding: "7px 11px",
              borderRadius: "5px",
              border:
                "1px solid rgba(239,68,68,0.4)",
              background:
                "rgba(239,68,68,0.08)",
              color: "#ef4444",
              fontSize: "8px",
              fontWeight: "700",
              letterSpacing: "0.8px",
              cursor: "pointer",
            }}
          >
            STILL VULNERABLE
          </button>

          <button
            type="button"
            onClick={() =>
              markResolved(finding.id)
            }
            style={{
              padding: "7px 11px",
              borderRadius: "5px",
              border:
                "1px solid rgba(34,197,94,0.4)",
              background:
                "rgba(34,197,94,0.08)",
              color: "#22c55e",
              fontSize: "8px",
              fontWeight: "700",
              letterSpacing: "0.8px",
              cursor: "pointer",
            }}
          >
            MARK RESOLVED
          </button>
        </div>
      );
    }


    if (
      finding.status === "RESOLVED"
    ) {
      return (
        <div
          style={{
            marginTop: "10px",
          }}
        >
          <span
            style={{
              display: "block",
              color: "#22c55e",
              fontSize: "8px",
              fontWeight: "700",
              letterSpacing: "1px",
            }}
          >
            ✓ REMEDIATION VERIFIED
          </span>

          {finding.resolvedAt && (
            <small
              style={{
                display: "block",
                marginTop: "5px",
                color: "#6f7b89",
                fontSize: "9px",
              }}
            >
              Verified:{" "}
              {new Date(
                finding.resolvedAt
              ).toLocaleString()}
            </small>
          )}
        </div>
      );
    }

    return null;
  };

  // =====================================================
  // FINDING ROW
  // =====================================================

  const FindingRow = ({
    finding,
    showEvidence = false,
    showReview = true,
    showRemediation = false,
  }) => {
    return (
      <div
        className="finding-row"
        key={finding.id}
      >
        <div>
          <span className="finding-id">
            {finding.id}
          </span>

          <strong>
            {finding.title}
          </strong>


          {finding.source ===
            "WebShield Security Engine" && (
            <span
              style={{
                display: "block",
                marginTop: "4px",
                fontSize: "8px",
                letterSpacing: "1px",
                color: "#ff4545",
                fontWeight: "700",
              }}
            >
              AUTOMATED SECURITY ENGINE
            </span>
          )}


          {finding.source ===
            "WebShield Security Engine" &&
            finding.verification ===
              "CONFIRMED" && (
              <span
                style={{
                  display: "block",
                  marginTop: "5px",
                  fontSize: "8px",
                  letterSpacing: "1px",
                  color: "#22c55e",
                  fontWeight: "700",
                }}
              >
                ANALYST VERIFIED
              </span>
            )}


          {showReview && (
            <AnalystReviewControls
              finding={finding}
            />
          )}


          {showEvidence && (
            <EvidenceDisplay
              finding={finding}
            />
          )}


          {showRemediation && (
            <RemediationControls
              finding={finding}
            />
          )}
        </div>


        <span className="category">
          {finding.category ||
            "Uncategorized"}
        </span>


        <span
          className={`severity ${
            finding.severity
              ?.toLowerCase() || "low"
          }`}
        >
          {finding.severity || "LOW"}
        </span>


        {finding.verification ===
        "POTENTIAL" ? (
          <span
            style={{
              fontSize: "9px",
              color: "#f59e0b",
              fontWeight: "700",
              letterSpacing: "0.6px",
            }}
          >
            REVIEW
          </span>
        ) : (
          <span
            className={`finding-status ${
              finding.status
                ?.toLowerCase() ||
              "open"
            }`}
          >
            {finding.status || "OPEN"}
          </span>
        )}
      </div>
    );
  };

  // =====================================================
  // DASHBOARD
  // =====================================================

  const DashboardPage = () => {
    return (
      <>
        <SecurityScanner
          onFindingsReceived={
            handleScannerFindings
          }
        />


        <SessionSecurityScanner
          onFindingsReceived={
            handleScannerFindings
          }
        />


        <RateLimitScanner
          onFindingsReceived={
            handleScannerFindings
          }
        />


        <AccessControlScanner
          onFindingsReceived={
            handleScannerFindings
          }
        />


        <section className="target-card">
          <div className="target-left">
            <div className="target-icon">
              ◎
            </div>

            <div>
              <p className="section-label">
                CURRENT TARGET
              </p>

              <h2>
                {assessment?.targetName ||
                  "No Active Assessment"}
              </h2>

              <p className="target-url">
                {assessment?.targetUrl ||
                  "Create an assessment to begin"}
              </p>
            </div>
          </div>

          <div className="target-info">
            <div>
              <span>
                ENVIRONMENT
              </span>

              <strong>
                {assessment?.environment ||
                  "Not Selected"}
              </strong>
            </div>

            <div>
              <span>
                TESTING OS
              </span>

              <strong>
                {assessment?.testingOs ||
                  "Not Selected"}
              </strong>
            </div>

            <div>
              <span>
                METHODOLOGY
              </span>

              <strong>
                {assessment?.method ||
                  "Not Selected"}
              </strong>
            </div>

            <div>
              <span>
                STATUS
              </span>

              {assessment ? (
                <strong className="active-text">
                  ● ACTIVE
                </strong>
              ) : (
                <strong>
                  NOT STARTED
                </strong>
              )}
            </div>
          </div>
        </section>


        <section className="stats">
          <div className="stat-card security-score">
            <div className="stat-top">
              <span>
                SECURITY SCORE
              </span>

              <span className="stat-icon">
                ⚠
              </span>
            </div>

            <div className="score-row">
              <h2>
                {assessment
                  ? securityScore
                  : "--"}
              </h2>

              <span>
                /100
              </span>
            </div>

            <div className="score-bar">
              <div
                className="score-progress"
                style={{
                  width: assessment
                    ? `${securityScore}%`
                    : "0%",
                }}
              />
            </div>

            <small>
              {assessment
                ? `Risk level: ${riskLevel}`
                : "Create an assessment first"}
            </small>
          </div>


          <div className="stat-card">
            <div className="stat-top">
              <span>
                CONFIRMED FINDINGS
              </span>

              <span className="stat-number-icon">
                {confirmedFindings.length}
              </span>
            </div>

            <h2>
              {String(
                confirmedFindings.length
              ).padStart(2, "0")}
            </h2>

            <small>
              {potentialCount > 0
                ? `${potentialCount} finding(s) pending analyst review`
                : "Verified security findings"}
            </small>
          </div>


          <div className="stat-card danger-card">
            <div className="stat-top">
              <span>
                HIGH RISK
              </span>

              <span className="danger-dot" />
            </div>

            <h2>
              {String(
                criticalCount +
                  highCount
              ).padStart(2, "0")}
            </h2>

            <small>
              Confirmed critical + high
            </small>
          </div>


          <div className="stat-card resolved-card">
            <div className="stat-top">
              <span>
                RESOLVED
              </span>

              <span className="resolved-dot" />
            </div>

            <h2>
              {String(
                resolvedCount
              ).padStart(2, "0")}
            </h2>

            <small>
              Successfully remediated
            </small>
          </div>
        </section>


        <section className="content-grid">
          <div className="panel findings-panel">
            <div className="panel-header">
              <div>
                <p className="section-label">
                  ASSESSMENT RESULTS
                </p>

                <h3>
                  Recent Security Findings
                </h3>
              </div>

              <button
                className="view-button"
                disabled={!assessment}
                onClick={() =>
                  assessment &&
                  setShowFinding(true)
                }
              >
                + ADD FINDING
              </button>
            </div>

            <div className="table-header">
              <span>FINDING</span>
              <span>CATEGORY</span>
              <span>SEVERITY</span>
              <span>STATUS</span>
            </div>

            <div className="findings-list">
              {visibleFindings.length >
              0 ? (
                visibleFindings
                  .slice(0, 5)
                  .map((finding) => (
                    <FindingRow
                      key={finding.id}
                      finding={finding}
                      showEvidence={true}
                      showReview={true}
                    />
                  ))
              ) : (
                <div className="empty-findings">
                  <strong>
                    No vulnerabilities recorded
                  </strong>

                  <span>
                    Run an authorized security
                    assessment or add a verified
                    finding manually.
                  </span>
                </div>
              )}
            </div>
          </div>


          <div className="panel">
            <p className="section-label">
              RISK ANALYSIS
            </p>

            <h3>
              Severity Distribution
            </h3>

            <div className="risk-list">
              <Risk
                label="Critical"
                value={criticalCount}
                width={severityPercentage(
                  criticalCount
                )}
                type="critical"
              />

              <Risk
                label="High"
                value={highCount}
                width={severityPercentage(
                  highCount
                )}
                type="high"
              />

              <Risk
                label="Medium"
                value={mediumCount}
                width={severityPercentage(
                  mediumCount
                )}
                type="medium"
              />

              <Risk
                label="Low"
                value={lowCount}
                width={severityPercentage(
                  lowCount
                )}
                type="low"
              />
            </div>


            <div className="risk-summary">
              <div>
                <span>OPEN</span>

                <strong>
                  {openCount}
                </strong>
              </div>

              <div>
                <span>
                  RETESTING
                </span>

                <strong>
                  {retestingCount}
                </strong>
              </div>

              <div>
                <span>
                  RESOLVED
                </span>

                <strong>
                  {resolvedCount}
                </strong>
              </div>
            </div>


            {potentialCount > 0 && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "12px",
                  border:
                    "1px solid rgba(245,158,11,0.22)",
                  borderRadius: "7px",
                  background:
                    "rgba(245,158,11,0.035)",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: "9px",
                    color: "#f59e0b",
                    fontWeight: "700",
                    letterSpacing: "1px",
                  }}
                >
                  PENDING ANALYST REVIEW
                </span>

                <strong
                  style={{
                    display: "block",
                    marginTop: "5px",
                    fontSize: "22px",
                  }}
                >
                  {potentialCount}
                </strong>

                <small>
                  Automated observations awaiting
                  verification
                </small>
              </div>
            )}
          </div>
        </section>


        <section className="testing-section">
          <div>
            <p className="section-label">
              SECURITY TESTING ENVIRONMENT
            </p>

            <h3>
              Assessment Methodology
            </h3>
          </div>

          <div className="testing-tools">
            <div className="tool">
              <span className="tool-icon">
                &gt;_
              </span>

              <div>
                <strong>
                  Burp Suite
                </strong>

                <small>
                  Manual Testing
                </small>
              </div>
            </div>


            <div className="tool">
              <span className="tool-icon">
                WS
              </span>

              <div>
                <strong>
                  WebShield Engine
                </strong>

                <small>
                  Controlled Automated Testing
                </small>
              </div>
            </div>


            <div className="tool">
              <span className="tool-icon">
                K
              </span>

              <div>
                <strong>
                  Kali Linux
                </strong>

                <small>
                  Security Environment
                </small>
              </div>
            </div>


            <div className="tool">
              <span className="tool-icon">
                OW
              </span>

              <div>
                <strong>
                  OWASP
                </strong>

                <small>
                  Security Reference
                </small>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  };

  // =====================================================
  // ASSESSMENTS PAGE
  // =====================================================

  const AssessmentsPage = () => {
    return (
      <>
        <section className="target-card">
          <div className="target-left">
            <div className="target-icon">
              ◎
            </div>

            <div>
              <p className="section-label">
                CURRENT ASSESSMENT
              </p>

              <h2>
                {assessment?.targetName ||
                  "No Active Assessment"}
              </h2>

              <p className="target-url">
                {assessment?.targetUrl ||
                  "Create your first assessment"}
              </p>
            </div>
          </div>

          <button
            className="new-assessment"
            onClick={() =>
              setShowAssessment(true)
            }
          >
            + NEW ASSESSMENT
          </button>
        </section>


        <section className="content-grid">
          <div className="panel findings-panel">
            <p className="section-label">
              ASSESSMENT INFORMATION
            </p>

            <h3>
              Target Configuration
            </h3>

            {assessment ? (
              <div className="risk-list">
                <InformationRow
                  label="Target Name"
                  value={
                    assessment.targetName
                  }
                />

                <InformationRow
                  label="Target URL"
                  value={
                    assessment.targetUrl
                  }
                />

                <InformationRow
                  label="Environment"
                  value={
                    assessment.environment
                  }
                />

                <InformationRow
                  label="Testing OS"
                  value={
                    assessment.testingOs
                  }
                />

                <InformationRow
                  label="Methodology"
                  value={
                    assessment.method
                  }
                />
              </div>
            ) : (
              <div className="empty-findings">
                No active assessment.
              </div>
            )}
          </div>


          <div className="panel">
            <p className="section-label">
              ASSESSMENT SUMMARY
            </p>

            <h3>
              Current Results
            </h3>

            <div className="risk-summary">
              <div>
                <span>
                  CONFIRMED
                </span>

                <strong>
                  {confirmedFindings.length}
                </strong>
              </div>

              <div>
                <span>
                  REVIEW
                </span>

                <strong>
                  {potentialCount}
                </strong>
              </div>

              <div>
                <span>
                  RESOLVED
                </span>

                <strong>
                  {resolvedCount}
                </strong>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  };

  // =====================================================
  // VULNERABILITIES PAGE
  // =====================================================

  const VulnerabilitiesPage = () => {
    return (
      <section className="panel findings-panel">
        <div className="panel-header">
          <div>
            <p className="section-label">
              VULNERABILITY MANAGEMENT
            </p>

            <h3>
              All Active Findings
            </h3>
          </div>

          <button
            className="view-button"
            disabled={!assessment}
            onClick={() =>
              setShowFinding(true)
            }
          >
            + ADD FINDING
          </button>
        </div>

        <div className="table-header">
          <span>FINDING</span>
          <span>CATEGORY</span>
          <span>SEVERITY</span>
          <span>STATUS</span>
        </div>

        <div className="findings-list">
          {visibleFindings.length >
          0 ? (
            visibleFindings.map(
              (finding) => (
                <FindingRow
                  key={finding.id}
                  finding={finding}
                  showEvidence={true}
                  showReview={true}
                />
              )
            )
          ) : (
            <div className="empty-findings">
              No vulnerabilities available.
            </div>
          )}
        </div>
      </section>
    );
  };

  // =====================================================
  // OWASP PAGE
  // =====================================================

  const OwaspPage = () => {
    const categories = [
      {
        code: "A01",
        name: "Broken Access Control",
      },
      {
        code: "A02",
        name:
          "Security Misconfiguration",
      },
      {
        code: "A03",
        name:
          "Software Supply Chain Failures",
      },
      {
        code: "A04",
        name:
          "Cryptographic Failures",
      },
      {
        code: "A05",
        name: "Injection",
      },
      {
        code: "A06",
        name: "Insecure Design",
      },
      {
        code: "A07",
        name:
          "Authentication Failures",
      },
      {
        code: "A08",
        name:
          "Software or Data Integrity Failures",
      },
      {
        code: "A09",
        name:
          "Security Logging and Alerting Failures",
      },
      {
        code: "A10",
        name:
          "Mishandling of Exceptional Conditions",
      },
    ];

    return (
      <section className="content-grid">
        <div className="panel findings-panel">
          <p className="section-label">
            OWASP SECURITY STANDARD
          </p>

          <h3>
            OWASP Top 10 Categories
          </h3>

          <div className="risk-list">
            {categories.map(
              (category) => (
                <div
                  className="risk-heading"
                  key={category.code}
                >
                  <span>
                    <strong>
                      {category.code}
                    </strong>

                    {" — "}

                    {category.name}
                  </span>
                </div>
              )
            )}
          </div>
        </div>


        <div className="panel">
          <p className="section-label">
            CONFIRMED COVERAGE
          </p>

          <h3>
            Verified Findings
          </h3>

          <div className="risk-list">
            {confirmedFindings.length >
            0 ? (
              confirmedFindings.map(
                (finding) => (
                  <div
                    className="risk-heading"
                    key={finding.id}
                  >
                    <span>
                      {finding.category}
                    </span>

                    <strong>
                      {finding.id}
                    </strong>
                  </div>
                )
              )
            ) : (
              <div className="empty-findings">
                No confirmed findings.
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  // =====================================================
  // EVIDENCE PAGE
  // =====================================================

  const EvidencePage = () => {
    const evidenceFindings =
      visibleFindings.filter(
        (finding) =>
          finding.evidence
      );

    return (
      <section className="panel findings-panel">
        <div className="panel-header">
          <div>
            <p className="section-label">
              SECURITY EVIDENCE
            </p>

            <h3>
              Assessment Evidence
            </h3>
          </div>

          <strong>
            {evidenceFindings.length} RECORDS
          </strong>
        </div>

        <div className="table-header">
          <span>FINDING</span>
          <span>CATEGORY</span>
          <span>SEVERITY</span>
          <span>STATUS</span>
        </div>

        <div className="findings-list">
          {evidenceFindings.length >
          0 ? (
            evidenceFindings.map(
              (finding) => (
                <FindingRow
                  key={finding.id}
                  finding={finding}
                  showEvidence={true}
                  showReview={true}
                />
              )
            )
          ) : (
            <div className="empty-findings">
              No evidence available.
            </div>
          )}
        </div>
      </section>
    );
  };

  // =====================================================
  // REMEDIATION PAGE
  // =====================================================

  const RemediationPage = () => {
    return (
      <>
        <section className="stats">
          <div className="stat-card">
            <div className="stat-top">
              <span>OPEN</span>
            </div>

            <h2>
              {String(
                openCount
              ).padStart(2, "0")}
            </h2>

            <small>
              Awaiting remediation
            </small>
          </div>


          <div className="stat-card">
            <div className="stat-top">
              <span>
                RETESTING
              </span>
            </div>

            <h2>
              {String(
                retestingCount
              ).padStart(2, "0")}
            </h2>

            <small>
              Verification in progress
            </small>
          </div>


          <div className="stat-card resolved-card">
            <div className="stat-top">
              <span>
                RESOLVED
              </span>
            </div>

            <h2>
              {String(
                resolvedCount
              ).padStart(2, "0")}
            </h2>

            <small>
              Remediation verified
            </small>
          </div>
        </section>


        <section
          className="panel"
          style={{
            marginBottom: "20px",
          }}
        >
          <p className="section-label">
            REMEDIATION LIFECYCLE
          </p>

          <h3>
            Finding Verification Workflow
          </h3>

          <p
            style={{
              marginTop: "10px",
              color: "#7f8b99",
              lineHeight: "1.7",
              fontSize: "11px",
            }}
          >
            Confirmed findings begin as OPEN.
            After a developer applies a fix,
            mark the finding for retesting.
            Perform the relevant security test
            again and record whether the
            weakness remains or has been fixed.
          </p>
        </section>


        <section className="panel findings-panel">
          <div className="panel-header">
            <div>
              <p className="section-label">
                REMEDIATION STATUS
              </p>

              <h3>
                Confirmed Finding Tracking
              </h3>
            </div>
          </div>

          <div className="table-header">
            <span>FINDING</span>
            <span>CATEGORY</span>
            <span>SEVERITY</span>
            <span>STATUS</span>
          </div>

          <div className="findings-list">
            {confirmedFindings.length >
            0 ? (
              confirmedFindings.map(
                (finding) => (
                  <FindingRow
                    key={finding.id}
                    finding={finding}
                    showEvidence={false}
                    showReview={false}
                    showRemediation={true}
                  />
                )
              )
            ) : (
              <div className="empty-findings">
                No confirmed findings.
              </div>
            )}
          </div>
        </section>
      </>
    );
  };

  // =====================================================
  // REPORTS PAGE
  // =====================================================

  const ReportsPage = () => {
    return (
      <>
        {/* REPORT TARGET */}

        <section className="target-card">
          <div className="target-left">
            <div className="target-icon">
              ◫
            </div>

            <div>
              <p className="section-label">
                SECURITY ASSESSMENT REPORT
              </p>

              <h2>
                {assessment?.targetName ||
                  "WebShield Assessment"}
              </h2>

              <p className="target-url">
                {assessment?.targetUrl ||
                  "No target selected"}
              </p>
            </div>
          </div>
        </section>


        {/* =============================================
            REPORT EXPORT
        ============================================= */}

        <section
          className="panel"
          style={{
            marginBottom: "20px",
          }}
        >
          <p className="section-label">
            REPORT EXPORT
          </p>

          <h3>
            Generate Security Assessment Report
          </h3>

          <p
            style={{
              marginTop: "8px",
              marginBottom: "18px",
              color: "#7f8b99",
              fontSize: "11px",
              lineHeight: "1.6",
            }}
          >
            Generate a printable security
            assessment report containing target
            information, security score,
            confirmed findings, remediation
            status, impact, evidence and
            recommendations.
          </p>

          <ReportGenerator
            assessment={assessment}
            findings={findings}
            securityScore={securityScore}
            riskLevel={riskLevel}
          />
        </section>


        {/* REPORT STATISTICS */}

        <section className="stats">
          <div className="stat-card security-score">
            <div className="stat-top">
              <span>
                SECURITY SCORE
              </span>
            </div>

            <h2>
              {assessment
                ? securityScore
                : "--"}
            </h2>

            <small>
              {riskLevel}
            </small>
          </div>


          <div className="stat-card">
            <div className="stat-top">
              <span>
                CONFIRMED
              </span>
            </div>

            <h2>
              {confirmedFindings.length}
            </h2>

            <small>
              Verified findings
            </small>
          </div>


          <div className="stat-card danger-card">
            <div className="stat-top">
              <span>
                CRITICAL / HIGH
              </span>
            </div>

            <h2>
              {criticalCount +
                highCount}
            </h2>

            <small>
              Priority findings
            </small>
          </div>


          <div className="stat-card resolved-card">
            <div className="stat-top">
              <span>
                RESOLVED
              </span>
            </div>

            <h2>
              {resolvedCount}
            </h2>

            <small>
              Remediated findings
            </small>
          </div>
        </section>


        {/* REPORT FINDINGS */}

        <section className="panel findings-panel">
          <p className="section-label">
            REPORT CONTENT
          </p>

          <h3>
            Verified Security Findings
          </h3>

          <div className="table-header">
            <span>FINDING</span>
            <span>CATEGORY</span>
            <span>SEVERITY</span>
            <span>STATUS</span>
          </div>

          <div className="findings-list">
            {confirmedFindings.length >
            0 ? (
              confirmedFindings.map(
                (finding) => (
                  <FindingRow
                    key={finding.id}
                    finding={finding}
                    showEvidence={false}
                    showReview={false}
                  />
                )
              )
            ) : (
              <div className="empty-findings">
                No verified findings available.
              </div>
            )}
          </div>
        </section>
      </>
    );
  };

  // =====================================================
  // PAGE ROUTER
  // =====================================================

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <DashboardPage />;

      case "Assessments":
        return <AssessmentsPage />;

      case "Vulnerabilities":
        return <VulnerabilitiesPage />;

      case "OWASP Top 10":
        return <OwaspPage />;

      case "Evidence":
        return <EvidencePage />;

      case "Remediation":
        return <RemediationPage />;

      case "Reports":
        return <ReportsPage />;

      default:
        return <DashboardPage />;
    }
  };

  // =====================================================
  // MAIN APP
  // =====================================================

  return (
    <div className="app">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="brand">
          <div className="logo">
            WS
          </div>

          <div>
            <h2>
              WebShield
            </h2>

            <span>
              SECURITY ASSESSMENT
            </span>
          </div>
        </div>


        <div className="nav-label">
          MAIN MENU
        </div>


        <nav>
          {menuItems.map(
            (item) => (
              <button
                type="button"
                key={item}
                onClick={() =>
                  setActivePage(item)
                }
                className={
                  activePage === item
                    ? "nav-item active"
                    : "nav-item"
                }
              >
                <span className="nav-dot" />

                {item}
              </button>
            )
          )}
        </nav>


        <div className="sidebar-bottom">
          <div className="system-status">
            <div className="pulse" />

            <div>
              <strong>
                LAB ENVIRONMENT
              </strong>

              <span>
                Systems Operational
              </span>
            </div>
          </div>

          <p className="version">
            WebShield v2.3
          </p>
        </div>
      </aside>


      {/* MAIN */}

      <main className="main">
        <header className="header">
          <div>
            <p className="eyebrow">
              WEB APPLICATION SECURITY
              ASSESSMENT
            </p>

            <h1>
              {getPageTitle()}
            </h1>

            <p className="subtitle">
              Vulnerability Assessment &
              Penetration Testing Platform
            </p>
          </div>


          <div className="header-actions">
            <button
              className="add-finding-button"
              disabled={!assessment}
              onClick={() =>
                setShowFinding(true)
              }
            >
              + ADD FINDING
            </button>

            <button
              className="new-assessment"
              onClick={() =>
                setShowAssessment(true)
              }
            >
              <span>+</span>

              NEW ASSESSMENT
            </button>
          </div>
        </header>


        {renderPage()}


        <footer>
          <span>
            WEBSHIELD SECURITY PLATFORM
          </span>

          <span>
            AUTHORIZED SECURITY ASSESSMENT ONLY
          </span>
        </footer>


        {/* NEW ASSESSMENT */}

        <NewAssessmentModal
          open={showAssessment}
          onClose={() =>
            setShowAssessment(false)
          }
          onCreated={(newAssessment) => {
            setAssessment(
              newAssessment
            );

            localStorage.setItem(
              "webshieldCurrentAssessment",
              JSON.stringify(
                newAssessment
              )
            );

            setShowAssessment(false);
          }}
        />


        {/* ADD FINDING */}

        <AddFindingModal
          open={showFinding}
          onClose={() =>
            setShowFinding(false)
          }
          onCreated={
            handleFindingCreated
          }
          assessment={assessment}
          existingCount={
            findings.length
          }
        />
      </main>
    </div>
  );
}


// =====================================================
// RISK COMPONENT
// =====================================================

function Risk({
  label,
  value,
  width,
  type,
}) {
  return (
    <div className="risk-item">
      <div className="risk-heading">
        <span>
          <i
            className={`risk-dot ${type}`}
          />

          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>

      <div className="risk-bar">
        <div
          className={`risk-progress ${type}`}
          style={{
            width,
          }}
        />
      </div>
    </div>
  );
}


// =====================================================
// INFORMATION ROW
// =====================================================

function InformationRow({
  label,
  value,
}) {
  return (
    <div className="risk-heading">
      <span>
        {label}
      </span>

      <strong>
        {value || "Not provided"}
      </strong>
    </div>
  );
}


export default App;
