import { useState } from "react";

function SecurityScanner({ onFindingsReceived }) {
  const [target, setTarget] = useState("http://localhost:3000");
  const [authorized, setAuthorized] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const runScan = async () => {
    if (!authorized) {
      setError("Please confirm that you are authorized to test this target.");
      return;
    }

    setScanning(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/scan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            target,
            authorized: true,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Assessment failed.");
        return;
      }

      setResult(data);

      if (onFindingsReceived) {
        onFindingsReceived(data.findings || []);
      }
    } catch (err) {
      console.error(err);

      setError(
        "Could not connect to the WebShield Security Engine."
      );
    } finally {
      setScanning(false);
    }
  };

  return (
    <section className="panel security-scanner">
      <p className="section-label">
        WEBSHIELD SECURITY ENGINE
      </p>

      <h3>Run Security Assessment</h3>

      <div style={{ marginTop: "20px" }}>
        <label>
          Target URL
        </label>

        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="http://localhost:3000"
          style={{
            width: "100%",
            marginTop: "8px",
            padding: "12px",
          }}
        />
      </div>

      <label
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "16px",
          alignItems: "center",
        }}
      >
        <input
          type="checkbox"
          checked={authorized}
          onChange={(e) =>
            setAuthorized(e.target.checked)
          }
        />

        I confirm that I own this target or have
        authorization to perform security testing.
      </label>

      <button
        className="new-assessment"
        style={{ marginTop: "20px" }}
        onClick={runScan}
        disabled={scanning}
      >
        {scanning
          ? "ASSESSMENT RUNNING..."
          : "RUN SECURITY ASSESSMENT"}
      </button>

      {error && (
        <p style={{ marginTop: "15px" }}>
          {error}
        </p>
      )}

      {result && (
        <div style={{ marginTop: "25px" }}>
          <p className="section-label">
            ASSESSMENT RESULTS
          </p>

          <h3>
            {result.total_findings} Potential Findings
          </h3>

          <div className="risk-list">
            {result.checks.map((check, index) => (
              <div
                className="risk-heading"
                key={index}
                style={{
                  marginTop: "15px",
                }}
              >
                <span>
                  {check.name}
                </span>

                <strong>
                  {check.status}
                </strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default SecurityScanner;
