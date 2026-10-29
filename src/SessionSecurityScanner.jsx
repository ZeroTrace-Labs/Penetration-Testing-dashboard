import { useState } from "react";

function SessionSecurityScanner({ onFindingsReceived }) {
  const [loginUrl, setLoginUrl] = useState(
    "http://localhost:3000/rest/user/login"
  );

  const [protectedUrl, setProtectedUrl] = useState(
    "http://localhost:3000/rest/user/whoami"
  );

  const [logoutUrl, setLogoutUrl] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [authorized, setAuthorized] = useState(false);

  const [testing, setTesting] = useState(false);

  const [result, setResult] = useState(null);

  const [error, setError] = useState("");

  const runSessionTest = async () => {
    if (!authorized) {
      setError(
        "Please confirm that this is an authorized test account."
      );
      return;
    }

    if (!username || !password) {
      setError(
        "Enter the credentials for your authorized test account."
      );
      return;
    }

    setTesting(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/session-test",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            login_url: loginUrl,
            protected_url: protectedUrl,
            username,
            password,
            authorized: true,
            logout_url:
              logoutUrl.trim() !== ""
                ? logoutUrl
                : null,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        setError(
          data.message ||
            "Authentication assessment failed."
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
        AUTHENTICATION & SESSION SECURITY
      </p>

      <h3>
        Authenticated Security Assessment
      </h3>

      <p
        style={{
          marginTop: "8px",
          fontSize: "11px",
          color: "#7f8b99",
          lineHeight: "1.6",
        }}
      >
        Test authentication and protected resource
        access using an explicitly authorized lab
        account.
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

      {/* PROTECTED ENDPOINT */}

      <div
        style={{
          marginTop: "14px",
        }}
      >
        <label>
          Protected Endpoint
        </label>

        <input
          type="text"
          value={protectedUrl}
          onChange={(event) =>
            setProtectedUrl(
              event.target.value
            )
          }
          style={{
            width: "100%",
            marginTop: "7px",
            padding: "12px",
          }}
        />
      </div>

      {/* LOGOUT */}

      <div
        style={{
          marginTop: "14px",
        }}
      >
        <label>
          Logout Endpoint
          <span
            style={{
              marginLeft: "7px",
              fontSize: "9px",
              color: "#697483",
            }}
          >
            OPTIONAL
          </span>
        </label>

        <input
          type="text"
          value={logoutUrl}
          onChange={(event) =>
            setLogoutUrl(event.target.value)
          }
          placeholder="Leave empty if no server-side logout endpoint exists"
          style={{
            width: "100%",
            marginTop: "7px",
            padding: "12px",
          }}
        />
      </div>

      {/* EMAIL */}

      <div
        style={{
          marginTop: "14px",
        }}
      >
        <label>
          Authorized Test Account Email
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

      {/* PASSWORD */}

      <div
        style={{
          marginTop: "14px",
        }}
      >
        <label>
          Test Account Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          placeholder="Test account password"
          autoComplete="new-password"
          style={{
            width: "100%",
            marginTop: "7px",
            padding: "12px",
          }}
        />
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

        I confirm that this account and target
        are authorized for security testing.
      </label>

      {/* BUTTON */}

      <button
        type="button"
        className="new-assessment"
        disabled={testing}
        onClick={runSessionTest}
        style={{
          marginTop: "20px",
        }}
      >
        {testing
          ? "AUTHENTICATION TEST RUNNING..."
          : "RUN AUTHENTICATION TEST"}
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
            SESSION TEST RESULTS
          </p>

          <div
            style={{
              display: "flex",
              gap: "25px",
              marginTop: "12px",
              marginBottom: "18px",
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
                TOKEN DETECTED
              </span>

              <strong
                style={{
                  color: result.token_detected
                    ? "#22c55e"
                    : "#f59e0b",
                }}
              >
                {result.token_detected
                  ? "YES"
                  : "NO"}
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
                COOKIES DETECTED
              </span>

              <strong>
                {result.cookies_detected
                  ? "YES"
                  : "NO"}
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

export default SessionSecurityScanner;
