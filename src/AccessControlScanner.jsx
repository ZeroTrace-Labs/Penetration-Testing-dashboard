import { useState } from "react";

function AccessControlScanner({ onFindingsReceived }) {
  const [loginUrl, setLoginUrl] = useState(
    "http://localhost:3000/rest/user/login"
  );

  const [resourceTemplate, setResourceTemplate] =
    useState(
      "http://localhost:3000/rest/basket/{id}"
    );

  const [accountAUsername, setAccountAUsername] =
    useState("");

  const [accountAPassword, setAccountAPassword] =
    useState("");

  const [accountBUsername, setAccountBUsername] =
    useState("");

  const [accountBPassword, setAccountBPassword] =
    useState("");

  const [resourceAId, setResourceAId] =
    useState("");

  const [resourceBId, setResourceBId] =
    useState("");

  const [authorized, setAuthorized] =
    useState(false);

  const [testing, setTesting] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  const runAccessControlTest = async () => {
    if (!authorized) {
      setError(
        "Please confirm that both accounts and resources are authorized for testing."
      );
      return;
    }

    if (
      !accountAUsername ||
      !accountAPassword ||
      !accountBUsername ||
      !accountBPassword ||
      !resourceAId ||
      !resourceBId
    ) {
      setError(
        "Complete both authorized test accounts and resource IDs."
      );
      return;
    }

    setTesting(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/access-control-test",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            login_url: loginUrl,

            account_a_username:
              accountAUsername,

            account_a_password:
              accountAPassword,

            account_b_username:
              accountBUsername,

            account_b_password:
              accountBPassword,

            resource_url_template:
              resourceTemplate,

            resource_a_id:
              resourceAId,

            resource_b_id:
              resourceBId,

            authorized: true,
          }),
        }
      );

      const data =
        await response.json();

      if (!data.success) {
        setError(
          data.message ||
            "Access-control assessment failed."
        );

        setResult(data);
        return;
      }

      setResult(data);

      if (
        onFindingsReceived &&
        Array.isArray(data.findings) &&
        data.findings.length > 0
      ) {
        onFindingsReceived(
          data.findings
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        "Could not connect to the WebShield Security Engine."
      );
    } finally {
      setTesting(false);
    }
  };

  const statusColor = (status) => {
    const value =
      String(status).toUpperCase();

    if (value === "PASS") {
      return "#22c55e";
    }

    if (
      value === "REVIEW" ||
      value === "FAIL"
    ) {
      return "#ef4444";
    }

    return "#f59e0b";
  };

  const fieldStyle = {
    width: "100%",
    marginTop: "7px",
    padding: "12px",
  };

  return (
    <section
      className="panel"
      style={{
        marginTop: "20px",
      }}
    >
      <p className="section-label">
        ACCESS-CONTROL SECURITY
      </p>

      <h3>
        Controlled Horizontal Authorization Assessment
      </h3>

      <p
        style={{
          marginTop: "8px",
          fontSize: "11px",
          color: "#7f8b99",
          lineHeight: "1.6",
        }}
      >
        Uses two explicitly authorized test
        accounts to compare access to
        user-owned resources. Only controlled
        GET requests are performed.
      </p>

      {/* LOGIN ENDPOINT */}

      <div style={{ marginTop: "20px" }}>
        <label>
          Login Endpoint
        </label>

        <input
          type="text"
          value={loginUrl}
          onChange={(event) =>
            setLoginUrl(
              event.target.value
            )
          }
          style={fieldStyle}
        />
      </div>

      {/* RESOURCE TEMPLATE */}

      <div style={{ marginTop: "14px" }}>
        <label>
          Resource URL Template
        </label>

        <input
          type="text"
          value={resourceTemplate}
          onChange={(event) =>
            setResourceTemplate(
              event.target.value
            )
          }
          style={fieldStyle}
        />

        <small
          style={{
            display: "block",
            marginTop: "6px",
            color: "#697483",
          }}
        >
          Use {"{id}"} where the resource ID
          should be inserted.
        </small>
      </div>

      {/* ACCOUNT A */}

      <div
        style={{
          marginTop: "22px",
          paddingTop: "16px",
          borderTop:
            "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <p className="section-label">
          TEST ACCOUNT A
        </p>

        <div style={{ marginTop: "12px" }}>
          <label>
            Account A Email
          </label>

          <input
            type="email"
            value={accountAUsername}
            onChange={(event) =>
              setAccountAUsername(
                event.target.value
              )
            }
            autoComplete="off"
            style={fieldStyle}
          />
        </div>

        <div style={{ marginTop: "12px" }}>
          <label>
            Account A Password
          </label>

          <input
            type="password"
            value={accountAPassword}
            onChange={(event) =>
              setAccountAPassword(
                event.target.value
              )
            }
            autoComplete="new-password"
            style={fieldStyle}
          />
        </div>

        <div style={{ marginTop: "12px" }}>
          <label>
            Account A Resource ID
          </label>

          <input
            type="text"
            value={resourceAId}
            onChange={(event) =>
              setResourceAId(
                event.target.value
              )
            }
            placeholder="6"
            style={fieldStyle}
          />
        </div>
      </div>

      {/* ACCOUNT B */}

      <div
        style={{
          marginTop: "22px",
          paddingTop: "16px",
          borderTop:
            "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <p className="section-label">
          TEST ACCOUNT B
        </p>

        <div style={{ marginTop: "12px" }}>
          <label>
            Account B Email
          </label>

          <input
            type="email"
            value={accountBUsername}
            onChange={(event) =>
              setAccountBUsername(
                event.target.value
              )
            }
            autoComplete="off"
            style={fieldStyle}
          />
        </div>

        <div style={{ marginTop: "12px" }}>
          <label>
            Account B Password
          </label>

          <input
            type="password"
            value={accountBPassword}
            onChange={(event) =>
              setAccountBPassword(
                event.target.value
              )
            }
            autoComplete="new-password"
            style={fieldStyle}
          />
        </div>

        <div style={{ marginTop: "12px" }}>
          <label>
            Account B Resource ID
          </label>

          <input
            type="text"
            value={resourceBId}
            onChange={(event) =>
              setResourceBId(
                event.target.value
              )
            }
            placeholder="7"
            style={fieldStyle}
          />
        </div>
      </div>

      {/* BOUNDARY */}

      <div
        style={{
          marginTop: "18px",
          padding: "11px",
          border:
            "1px solid rgba(255,255,255,0.07)",
          borderRadius: "6px",
          background:
            "rgba(255,255,255,0.02)",
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: "8px",
            color: "#697483",
            letterSpacing: "1px",
          }}
        >
          CONTROLLED TEST BOUNDARY
        </span>

        <strong
          style={{
            display: "block",
            marginTop: "5px",
          }}
        >
          2 baseline GET requests + 1
          cross-account GET request
        </strong>

        <small
          style={{
            display: "block",
            marginTop: "5px",
            color: "#778493",
          }}
        >
          No resource modification or deletion
          is performed.
        </small>
      </div>

      {/* AUTHORIZATION */}

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginTop: "17px",
        }}
      >
        <input
          type="checkbox"
          checked={authorized}
          onChange={(event) =>
            setAuthorized(
              event.target.checked
            )
          }
        />

        I confirm both test accounts and
        resources are authorized for this
        security assessment.
      </label>

      {/* RUN */}

      <button
        type="button"
        className="new-assessment"
        disabled={testing}
        onClick={runAccessControlTest}
        style={{
          marginTop: "20px",
        }}
      >
        {testing
          ? "ACCESS-CONTROL TEST RUNNING..."
          : "RUN ACCESS-CONTROL TEST"}
      </button>

      {/* ERROR */}

      {error && (
        <div
          style={{
            marginTop: "15px",
            padding: "11px",
            border:
              "1px solid rgba(239,68,68,0.25)",
            borderRadius: "6px",
            color: "#ef4444",
            fontSize: "11px",
          }}
        >
          {error}
        </div>
      )}

      {/* RESULTS */}

      {result && (
        <div
          style={{
            marginTop: "25px",
          }}
        >
          <p className="section-label">
            ACCESS-CONTROL RESULTS
          </p>

          <div
            style={{
              display: "flex",
              gap: "25px",
              marginTop: "12px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "8px",
                  color: "#697483",
                  letterSpacing: "1px",
                }}
              >
                ACCOUNT A RESOURCE
              </span>

              <strong>
                HTTP{" "}
                {result.resource_a_status}
              </strong>
            </div>

            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "8px",
                  color: "#697483",
                  letterSpacing: "1px",
                }}
              >
                ACCOUNT B RESOURCE
              </span>

              <strong>
                HTTP{" "}
                {result.resource_b_status}
              </strong>
            </div>

            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "8px",
                  color: "#697483",
                  letterSpacing: "1px",
                }}
              >
                CROSS-ACCOUNT
              </span>

              <strong
                style={{
                  color:
                    result.cross_account_access_observed
                      ? "#ef4444"
                      : "#22c55e",
                }}
              >
                HTTP{" "}
                {result.cross_account_status}
              </strong>
            </div>

            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "8px",
                  color: "#697483",
                  letterSpacing: "1px",
                }}
              >
                POTENTIAL FINDINGS
              </span>

              <strong>
                {result.total_findings || 0}
              </strong>
            </div>
          </div>

          {result.cross_account_access_observed && (
            <div
              style={{
                padding: "12px",
                marginBottom: "17px",
                border:
                  "1px solid rgba(239,68,68,0.3)",
                background:
                  "rgba(239,68,68,0.05)",
                borderRadius: "6px",
              }}
            >
              <strong
                style={{
                  display: "block",
                  color: "#ef4444",
                  fontSize: "10px",
                }}
              >
                CROSS-ACCOUNT ACCESS OBSERVED
              </strong>

              <small
                style={{
                  display: "block",
                  marginTop: "6px",
                  color: "#8994a3",
                }}
              >
                Analyst verification is required
                before treating this observation
                as a confirmed vulnerability.
              </small>
            </div>
          )}

          <div className="risk-list">
            {(result.checks || []).map(
              (check, index) => (
                <div
                  key={`${check.name}-${index}`}
                  style={{
                    padding: "12px 0",
                    borderBottom:
                      "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <strong
                      style={{
                        fontSize: "11px",
                      }}
                    >
                      {check.name}
                    </strong>

                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: "700",
                        letterSpacing: "1px",
                        color: statusColor(
                          check.status
                        ),
                      }}
                    >
                      {check.status}
                    </span>
                  </div>

                  <small
                    style={{
                      display: "block",
                      marginTop: "5px",
                      color: "#778493",
                      lineHeight: "1.5",
                    }}
                  >
                    {check.details}
                  </small>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default AccessControlScanner;
