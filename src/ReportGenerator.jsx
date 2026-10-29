function ReportGenerator({
  assessment,
  findings,
  securityScore,
  riskLevel,
}) {
  const generateReport = () => {
    const confirmedFindings = findings.filter(
      (finding) =>
        finding.verification !== "POTENTIAL" &&
        finding.verification !== "DISMISSED"
    );

    const criticalCount = confirmedFindings.filter(
      (finding) =>
        finding.severity === "CRITICAL"
    ).length;

    const highCount = confirmedFindings.filter(
      (finding) =>
        finding.severity === "HIGH"
    ).length;

    const mediumCount = confirmedFindings.filter(
      (finding) =>
        finding.severity === "MEDIUM"
    ).length;

    const lowCount = confirmedFindings.filter(
      (finding) =>
        finding.severity === "LOW"
    ).length;

    const openCount = confirmedFindings.filter(
      (finding) =>
        finding.status === "OPEN"
    ).length;

    const retestingCount = confirmedFindings.filter(
      (finding) =>
        finding.status === "RETESTING"
    ).length;

    const resolvedCount = confirmedFindings.filter(
      (finding) =>
        finding.status === "RESOLVED"
    ).length;

    const reportWindow = window.open(
      "",
      "_blank"
    );

    if (!reportWindow) {
      alert(
        "Please allow pop-ups to generate the report."
      );
      return;
    }

    const findingsHtml =
      confirmedFindings.length > 0
        ? confirmedFindings
            .map(
              (finding, index) => `
                <section class="finding">
                  <div class="finding-number">
                    Finding ${index + 1}
                  </div>

                  <h2>
                    ${escapeHtml(
                      finding.title || "Untitled Finding"
                    )}
                  </h2>

                  <div class="meta-grid">
                    <div>
                      <span>ID</span>
                      <strong>
                        ${escapeHtml(
                          finding.id || "N/A"
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Severity</span>
                      <strong>
                        ${escapeHtml(
                          finding.severity || "N/A"
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Status</span>
                      <strong>
                        ${escapeHtml(
                          finding.status || "N/A"
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Category</span>
                      <strong>
                        ${escapeHtml(
                          finding.category || "N/A"
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Source</span>
                      <strong>
                        ${escapeHtml(
                          finding.source || "Manual Assessment"
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Verification</span>
                      <strong>
                        ${escapeHtml(
                          finding.verification ||
                            "CONFIRMED"
                        )}
                      </strong>
                    </div>
                  </div>

                  ${
                    finding.url
                      ? `
                      <div class="detail">
                        <h3>Affected URL / Component</h3>
                        <p>
                          ${escapeHtml(
                            finding.url
                          )}
                        </p>
                      </div>
                    `
                      : ""
                  }

                  ${
                    finding.description
                      ? `
                      <div class="detail">
                        <h3>Description</h3>
                        <p>
                          ${escapeHtml(
                            finding.description
                          )}
                        </p>
                      </div>
                    `
                      : ""
                  }

                  ${
                    finding.impact
                      ? `
                      <div class="detail">
                        <h3>Impact</h3>
                        <p>
                          ${escapeHtml(
                            finding.impact
                          )}
                        </p>
                      </div>
                    `
                      : ""
                  }

                  ${
                    finding.recommendation
                      ? `
                      <div class="detail">
                        <h3>Recommendation</h3>
                        <p>
                          ${escapeHtml(
                            finding.recommendation
                          )}
                        </p>
                      </div>
                    `
                      : ""
                  }

                  ${
                    finding.evidence &&
                    !String(
                      finding.evidence
                    ).startsWith("data:image")
                      ? `
                      <div class="detail">
                        <h3>Scanner Evidence</h3>
                        <p class="evidence">
                          ${escapeHtml(
                            String(
                              finding.evidence
                            )
                          )}
                        </p>
                      </div>
                    `
                      : ""
                  }

                  ${
                    finding.resolvedAt
                      ? `
                      <div class="detail">
                        <h3>Resolution</h3>
                        <p>
                          Remediation verified:
                          ${escapeHtml(
                            new Date(
                              finding.resolvedAt
                            ).toLocaleString()
                          )}
                        </p>
                      </div>
                    `
                      : ""
                  }
                </section>
              `
            )
            .join("")
        : `
          <p class="empty">
            No confirmed findings are available.
          </p>
        `;

    const generatedAt =
      new Date().toLocaleString();

    reportWindow.document.write(`
      <!DOCTYPE html>

      <html>
        <head>
          <title>
            WebShield Security Assessment Report
          </title>

          <meta charset="UTF-8" />

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 0;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
              background: #ffffff;
              color: #16181d;
            }

            .report {
              width: 92%;
              max-width: 1000px;
              margin: auto;
              padding: 45px 0 70px;
            }

            .cover {
              padding: 55px 45px;
              background: #111318;
              color: white;
              border-radius: 12px;
              margin-bottom: 35px;
            }

            .brand {
              color: #ef4444;
              font-weight: 800;
              letter-spacing: 3px;
              font-size: 13px;
            }

            .cover h1 {
              font-size: 38px;
              margin:
                18px 0 10px;
            }

            .cover p {
              color: #b5bbc5;
              line-height: 1.6;
            }

            .summary {
              display: grid;
              grid-template-columns:
                repeat(4, 1fr);
              gap: 12px;
              margin:
                25px 0 35px;
            }

            .card {
              border:
                1px solid #dfe3e8;
              border-radius: 8px;
              padding: 18px;
            }

            .card span {
              display: block;
              font-size: 10px;
              color: #777f8b;
              letter-spacing: 1px;
              text-transform: uppercase;
            }

            .card strong {
              display: block;
              margin-top: 8px;
              font-size: 25px;
            }

            .section-title {
              border-bottom:
                2px solid #ef4444;
              padding-bottom: 8px;
              margin:
                38px 0 20px;
            }

            .target {
              border:
                1px solid #dfe3e8;
              border-radius: 8px;
              padding: 20px;
              line-height: 1.8;
            }

            .target strong {
              min-width: 150px;
              display: inline-block;
            }

            .finding {
              border:
                1px solid #dfe3e8;
              border-radius: 10px;
              padding: 25px;
              margin-bottom: 22px;
              break-inside: avoid;
            }

            .finding-number {
              color: #ef4444;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 1.5px;
              text-transform: uppercase;
            }

            .finding h2 {
              margin:
                8px 0 20px;
              font-size: 21px;
            }

            .meta-grid {
              display: grid;
              grid-template-columns:
                repeat(3, 1fr);
              gap: 10px;
              margin-bottom: 20px;
            }

            .meta-grid div {
              background: #f6f7f9;
              padding: 12px;
              border-radius: 6px;
            }

            .meta-grid span {
              display: block;
              color: #7a818c;
              font-size: 9px;
              letter-spacing: 1px;
              text-transform: uppercase;
            }

            .meta-grid strong {
              display: block;
              margin-top: 5px;
              font-size: 12px;
            }

            .detail {
              margin-top: 17px;
            }

            .detail h3 {
              margin-bottom: 6px;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            .detail p {
              line-height: 1.65;
              font-size: 13px;
              color: #454b55;
              white-space: pre-wrap;
              word-break: break-word;
            }

            .evidence {
              background: #f5f6f8;
              border-left:
                3px solid #ef4444;
              padding: 12px;
            }

            .empty {
              color: #707782;
            }

            .footer {
              margin-top: 45px;
              padding-top: 15px;
              border-top:
                1px solid #dfe3e8;
              color: #838a94;
              font-size: 10px;
            }

            .print-button {
              position: fixed;
              right: 25px;
              bottom: 25px;
              border: none;
              border-radius: 7px;
              padding: 13px 18px;
              background: #ef4444;
              color: white;
              cursor: pointer;
              font-weight: bold;
            }

            @media print {
              .print-button {
                display: none;
              }

              body {
                background: white;
              }

              .report {
                width: 100%;
                padding: 0;
              }

              .cover {
                border-radius: 0;
              }
            }
          </style>
        </head>

        <body>

          <button
            class="print-button"
            onclick="window.print()"
          >
            SAVE / PRINT PDF
          </button>

          <main class="report">

            <section class="cover">
              <div class="brand">
                WEBSHIELD
              </div>

              <h1>
                Web Application Security
                Assessment Report
              </h1>

              <p>
                Authorized security assessment
                generated by the WebShield
                Security Assessment Platform.
              </p>

              <p>
                Generated:
                ${escapeHtml(
                  generatedAt
                )}
              </p>
            </section>


            <h2 class="section-title">
              Assessment Overview
            </h2>

            <div class="target">
              <div>
                <strong>
                  Target:
                </strong>

                ${escapeHtml(
                  assessment?.targetName ||
                    "Not provided"
                )}
              </div>

              <div>
                <strong>
                  Target URL:
                </strong>

                ${escapeHtml(
                  assessment?.targetUrl ||
                    "Not provided"
                )}
              </div>

              <div>
                <strong>
                  Environment:
                </strong>

                ${escapeHtml(
                  assessment?.environment ||
                    "Not provided"
                )}
              </div>

              <div>
                <strong>
                  Testing OS:
                </strong>

                ${escapeHtml(
                  assessment?.testingOs ||
                    "Not provided"
                )}
              </div>

              <div>
                <strong>
                  Methodology:
                </strong>

                ${escapeHtml(
                  assessment?.method ||
                    "Not provided"
                )}
              </div>
            </div>


            <div class="summary">

              <div class="card">
                <span>
                  Security Score
                </span>

                <strong>
                  ${securityScore}/100
                </strong>
              </div>

              <div class="card">
                <span>
                  Risk Level
                </span>

                <strong>
                  ${escapeHtml(
                    riskLevel
                  )}
                </strong>
              </div>

              <div class="card">
                <span>
                  Confirmed
                </span>

                <strong>
                  ${confirmedFindings.length}
                </strong>
              </div>

              <div class="card">
                <span>
                  Resolved
                </span>

                <strong>
                  ${resolvedCount}
                </strong>
              </div>

            </div>


            <div class="summary">

              <div class="card">
                <span>
                  Critical
                </span>

                <strong>
                  ${criticalCount}
                </strong>
              </div>

              <div class="card">
                <span>
                  High
                </span>

                <strong>
                  ${highCount}
                </strong>
              </div>

              <div class="card">
                <span>
                  Medium
                </span>

                <strong>
                  ${mediumCount}
                </strong>
              </div>

              <div class="card">
                <span>
                  Low
                </span>

                <strong>
                  ${lowCount}
                </strong>
              </div>

            </div>


            <div class="summary">

              <div class="card">
                <span>
                  Open
                </span>

                <strong>
                  ${openCount}
                </strong>
              </div>

              <div class="card">
                <span>
                  Retesting
                </span>

                <strong>
                  ${retestingCount}
                </strong>
              </div>

              <div class="card">
                <span>
                  Resolved
                </span>

                <strong>
                  ${resolvedCount}
                </strong>
              </div>

              <div class="card">
                <span>
                  Total Verified
                </span>

                <strong>
                  ${confirmedFindings.length}
                </strong>
              </div>

            </div>


            <h2 class="section-title">
              Confirmed Security Findings
            </h2>

            ${findingsHtml}


            <div class="footer">
              WebShield Security Assessment Platform
              • Authorized security testing only
              • This report contains analyst-confirmed
              findings from the current assessment.
            </div>

          </main>

        </body>
      </html>
    `);

    reportWindow.document.close();
  };

  return (
    <button
      type="button"
      className="new-assessment"
      onClick={generateReport}
    >
      DOWNLOAD SECURITY REPORT
    </button>
  );
}


// =====================================================
// BASIC HTML ESCAPING
// Prevent finding text from becoming report HTML
// =====================================================

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


export default ReportGenerator;
