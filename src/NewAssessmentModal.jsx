import { useState } from "react";

function NewAssessmentModal({
  open,
  onClose,
  onCreated,
}) {
  const [form, setForm] = useState({
    assessmentName: "",
    targetName: "",
    targetUrl: "",
    environment: "Local Lab",
    testingOs: "Kali Linux",
    method: "Manual + Automated",
  });

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newAssessment = {
      id: `ASM-${Date.now()}`,

      assessmentName:
        form.assessmentName.trim(),

      targetName:
        form.targetName.trim(),

      targetUrl:
        form.targetUrl.trim(),

      environment:
        form.environment,

      testingOs:
        form.testingOs,

      method:
        form.method,

      status: "Active",

      createdAt:
        new Date().toISOString(),
    };

    localStorage.setItem(
      "webshieldCurrentAssessment",
      JSON.stringify(newAssessment)
    );

    if (onCreated) {
      onCreated(newAssessment);
    }

    setForm({
      assessmentName: "",
      targetName: "",
      targetUrl: "",
      environment: "Local Lab",
      testingOs: "Kali Linux",
      method: "Manual + Automated",
    });
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="assessment-modal">
        <div className="modal-header">
          <div>
            <p className="section-label">
              NEW SECURITY ASSESSMENT
            </p>

            <h2>Create Assessment</h2>
          </div>

          <button
            className="close-modal"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Assessment Name

            <input
              type="text"
              name="assessmentName"
              value={form.assessmentName}
              onChange={handleChange}
              placeholder="Juice Shop Security Assessment"
              required
            />
          </label>

          <label>
            Target Name

            <input
              type="text"
              name="targetName"
              value={form.targetName}
              onChange={handleChange}
              placeholder="OWASP Juice Shop"
              required
            />
          </label>

          <label>
            Target URL

            <input
              type="url"
              name="targetUrl"
              value={form.targetUrl}
              onChange={handleChange}
              placeholder="http://localhost:3000"
              required
            />
          </label>

          <div className="form-grid">
            <label>
              Environment

              <select
                name="environment"
                value={form.environment}
                onChange={handleChange}
              >
                <option value="Local Lab">
                  Local Lab
                </option>

                <option value="Virtual Machine">
                  Virtual Machine
                </option>

                <option value="Authorized Test Environment">
                  Authorized Test Environment
                </option>
              </select>
            </label>

            <label>
              Testing OS

              <select
                name="testingOs"
                value={form.testingOs}
                onChange={handleChange}
              >
                <option value="Kali Linux">
                  Kali Linux
                </option>

                <option value="Linux">
                  Linux
                </option>

                <option value="Windows">
                  Windows
                </option>
              </select>
            </label>
          </div>

          <label>
            Testing Method

            <select
              name="method"
              value={form.method}
              onChange={handleChange}
            >
              <option value="Manual + Automated">
                Manual + Automated
              </option>

              <option value="Manual Testing">
                Manual Testing
              </option>

              <option value="Automated Testing">
                Automated Testing
              </option>
            </select>
          </label>

          <div className="authorized-note">
            ⚠ Only assess applications that you
            own or have explicit permission to
            security test.
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
              CREATE ASSESSMENT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewAssessmentModal;
