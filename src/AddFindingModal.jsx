import { useState } from "react";

function AddFindingModal({
  open,
  onClose,
  onCreated,
  assessment,
  existingCount,
}) {
  const [form, setForm] = useState({
    title: "",
    category: "A02 - Security Misconfiguration",
    severity: "LOW",
    affectedUrl: "",
    description: "",
    impact: "",
    recommendation: "",
    status: "OPEN",
  });

  const [evidence, setEvidence] = useState(null);
  const [evidenceName, setEvidenceName] = useState("");

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Convert screenshot into a smaller image
  // so it can temporarily be saved in localStorage
  const handleEvidence = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    setEvidenceName(file.name);

    const reader = new FileReader();

    reader.onload = (event) => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");

        const maxWidth = 1200;

        let width = image.width;
        let height = image.height;

        if (width > maxWidth) {
          height = Math.round(
            height * (maxWidth / width)
          );

          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(
          image,
          0,
          0,
          width,
          height
        );

        const compressedImage =
          canvas.toDataURL(
            "image/jpeg",
            0.72
          );

        setEvidence(compressedImage);
      };

      image.src = event.target.result;
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finding = {
      id: `VULN-${String(
        existingCount + 1
      ).padStart(3, "0")}`,

      assessmentId:
        assessment?.id || null,

      targetName:
        assessment?.targetName || "",

      targetUrl:
        assessment?.targetUrl || "",

      title:
        form.title.trim(),

      category:
        form.category,

      severity:
        form.severity,

      affectedUrl:
        form.affectedUrl.trim(),

      description:
        form.description.trim(),

      impact:
        form.impact.trim(),

      recommendation:
        form.recommendation.trim(),

      status:
        form.status,

      evidence:
        evidence,

      evidenceName:
        evidenceName,

      evidenceSource:
        evidence ? "Burp Suite" : "",

      createdAt:
        new Date().toISOString(),
    };

    onCreated(finding);

    setForm({
      title: "",
      category:
        "A02 - Security Misconfiguration",
      severity: "LOW",
      affectedUrl: "",
      description: "",
      impact: "",
      recommendation: "",
      status: "OPEN",
    });

    setEvidence(null);
    setEvidenceName("");

    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="assessment-modal finding-modal">
        <div className="modal-header">
          <div>
            <p className="section-label">
              SECURITY FINDING
            </p>

            <h2>
              Add Vulnerability
            </h2>
          </div>

          <button
            type="button"
            className="close-modal"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <label>
            Vulnerability Title

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Missing Content Security Policy Header"
              required
            />
          </label>

          <div className="form-grid">
            <label>
              OWASP Category

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option>
                  A01 - Broken Access Control
                </option>

                <option>
                  A02 - Security Misconfiguration
                </option>

                <option>
                  A03 - Software Supply Chain Failures
                </option>

                <option>
                  A04 - Cryptographic Failures
                </option>

                <option>
                  A05 - Injection
                </option>

                <option>
                  A06 - Insecure Design
                </option>

                <option>
                  A07 - Authentication Failures
                </option>

                <option>
                  A08 - Software or Data Integrity Failures
                </option>

                <option>
                  A09 - Security Logging and Alerting Failures
                </option>

                <option>
                  A10 - Mishandling of Exceptional Conditions
                </option>

                <option>
                  Session Security
                </option>

                <option>
                  Other
                </option>
              </select>
            </label>

            <label>
              Severity

              <select
                name="severity"
                value={form.severity}
                onChange={handleChange}
              >
                <option>
                  CRITICAL
                </option>

                <option>
                  HIGH
                </option>

                <option>
                  MEDIUM
                </option>

                <option>
                  LOW
                </option>

                <option>
                  INFORMATIONAL
                </option>
              </select>
            </label>
          </div>

          <label>
            Affected URL / Component

            <input
              type="text"
              name="affectedUrl"
              value={
                form.affectedUrl
              }
              onChange={
                handleChange
              }
              placeholder={
                assessment?.targetUrl ||
                "http://localhost:3000"
              }
            />
          </label>

          <label>
            Description

            <textarea
              name="description"
              value={
                form.description
              }
              onChange={
                handleChange
              }
              rows="3"
              required
            />
          </label>

          <label>
            Security Impact

            <textarea
              name="impact"
              value={form.impact}
              onChange={
                handleChange
              }
              rows="3"
              required
            />
          </label>

          <label>
            Recommendation

            <textarea
              name="recommendation"
              value={
                form.recommendation
              }
              onChange={
                handleChange
              }
              rows="3"
              required
            />
          </label>

          {/* EVIDENCE */}

          <label>
            Evidence Screenshot

            <input
              type="file"
              accept="image/*"
              onChange={
                handleEvidence
              }
            />
          </label>

          {evidence && (
            <div className="evidence-preview">
              <div className="evidence-preview-header">
                <span>
                  EVIDENCE PREVIEW
                </span>

                <strong>
                  {evidenceName}
                </strong>
              </div>

              <img
                src={evidence}
                alt="Security evidence"
              />
            </div>
          )}

          <label>
            Status

            <select
              name="status"
              value={form.status}
              onChange={
                handleChange
              }
            >
              <option>
                OPEN
              </option>

              <option>
                RETESTING
              </option>

              <option>
                RESOLVED
              </option>
            </select>
          </label>

          <div className="authorized-note">
            Add only findings confirmed during your authorized security lab assessment.
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              CANCEL
            </button>

            <button
              type="submit"
              className="create-button"
            >
              SAVE FINDING
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddFindingModal;
