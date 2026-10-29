import { useState } from "react";

function RateLimitScanner({ onFindingsReceived }) {
  const [loginUrl, setLoginUrl] = useState(
    "http://localhost:3000/rest/user/login"
  );

  const [username, setUsername] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const runRateLimitTest = async () => {
    if (!authorized) {
      setError(
        "Please confirm that the target is authorized for security testing."
      );
      return;
    }

    if (!username.trim()) {
      setError(
        "Enter the email address of your authorized lab account."
      );
      return;
    }

    setTesting(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/rate-limit-test",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            login_url: loginUrl,
            username: username,
            authorized: true,
            attempts: 5,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        setError(
          data.message ||
            "Rate-limit assessment failed."
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
        onFindingsReceived(data.findings);
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
    const value = String(status).toUpperCase();

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

  return (
    <section
      className="panel"
      style={{
        marginTop: "20px",
      }}
    >
      <p className="section-label">
        AUTHENTICATION RATE-LIMIT SECURITY
      </p>

      <h3>
        Controlled Rate-Limit Assessment
      </h3>

      <p
        style={{
          marginTop: "8px",
          fontSize: "11px",
          color: "#7f8b99",
          lineHeight: "1.6",
        }}
      >
        Performs a maximum of five controlled failed
        authentication requests to observe basic
        throttling behavior.
      </p>

      {/* LOGIN ENDPOINT */}

      <div
        style={{
          marginTop: "20px",
        }}
      >
        <label>
          Login Endpoint
        </label>

        <input
          type="text"
          value={loginUrl}
          onChange={(event) =>
            setLoginUrl(event.target.value)
          }
          style={{
            width: "100%",
            marginTop: "7px",
            padding: "12px",
          }}
        />
      </div>

      {/* AUTHORIZED ACCOUNT */}

      <div
        style={{
          marginTop: "14px",
        }}
      >
        <label>
          Authorized Lab Account Email
        </label>

        <input
          type="email"
          value={username}
          onChange={(event) =>
            setUsername(event.target.value)
          }
          placeholder="webshield.lab@test.com"
          autoComplete="off"
          style={{
            width: "100%",
            marginTop: "7px",
            padding: "12px",
          }}
        />
      </div>

      {/* TEST LIMIT */}

      <div
        style={{
          marginTop: "14px",
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
            letterSpacing: "1px",
            color: "#697483",
          }}
        >
          CONTROLLED REQUEST BOUNDARY
        </span>

        <strong
          style={{
            display: "block",
            marginTop: "5px",
          }}
        >
          Maximum 5 failed requests
        </strong>
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

        I confirm that this account and target are
        authorized for security testing.
      </label>

      {/* BUTTON */}

      <button
        type="button"
        className="new-assessment"
        disabled={testing}
        onClick={runRateLimitTest}
        style={{
          marginTop: "20px",
        }}
      >
        {testing
          ? "RATE-LIMIT TEST RUNNING..."
          : "RUN RATE-LIMIT TEST"}
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
            RATE-LIMIT TEST RESULTS
          </p>

          <div
            style={{
              display: "flex",
              gap: "28px",
              marginTop: "12px",
              marginBottom: "18px",
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
                ATTEMPTS SENT
              </span>

              <strong>
                {result.attempts_sent || 0}
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
                HTTP 429
              </span>

              <strong>
                {result.http_429_count || 0}
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
                THROTTLING
              </span>

              <strong
                style={{
                  color: result.throttling_detected
                    ? "#22c55e"
                    : "#f59e0b",
                }}
              >
                {result.throttling_detected
                  ? "DETECTED"
                  : "NOT OBSERVED"}
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

          {/* STATUS CODES */}

          <div
            style={{
              marginBottom: "18px",
            }}
          >
            <span
              style={{
                fontSize: "8px",
                letterSpacing: "1px",
                color: "#697483",
              }}
            >
              RESPONSE STATUS CODES
            </span>

            <div
              style={{
                display: "flex",
                gap: "7px",
                marginTop: "8px",
                flexWrap: "wrap",
              }}
            >
              {(result.status_codes || []).map(
                (code, index) => (
                  <span
                    key={`${code}-${index}`}
                    style={{
                      padding: "5px 8px",
                      border:
                        "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "5px",
                      fontSize: "9px",
                      fontWeight: "700",
                    }}
                  >
                    HTTP {code}
                  </span>
                )
              )}
            </div>
          </div>

          {/* CHECKS */}

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

export default RateLimitScanner;
