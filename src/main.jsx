import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

async function loadPublicDemo() {
  try {
    // ---------------------------------------------
    // CHECK EXISTING FINDINGS
    // ---------------------------------------------
    let hasFindings = false;

    const savedFindings = localStorage.getItem(
      "webshieldFindings"
    );

    if (savedFindings) {
      try {
        const parsedFindings = JSON.parse(savedFindings);

        hasFindings =
          Array.isArray(parsedFindings) &&
          parsedFindings.length > 0;
      } catch {
        hasFindings = false;
      }
    }

    // ---------------------------------------------
    // NEW VISITOR -> LOAD PUBLIC 14 FINDINGS
    // ---------------------------------------------
    if (!hasFindings) {
      const findingsResponse = await fetch(
        `${import.meta.env.BASE_URL}demo-findings.json`
      );

      if (findingsResponse.ok) {
        const demoFindings =
          await findingsResponse.json();

        localStorage.setItem(
          "webshieldFindings",
          JSON.stringify(demoFindings)
        );
      } else {
        console.error(
          "Could not load public findings:",
          findingsResponse.status
        );
      }
    }

    // ---------------------------------------------
    // CHECK EXISTING ASSESSMENT
    // ---------------------------------------------
    let hasAssessment = false;

    const savedAssessment = localStorage.getItem(
      "webshieldCurrentAssessment"
    );

    if (savedAssessment) {
      try {
        const parsedAssessment =
          JSON.parse(savedAssessment);

        hasAssessment =
          parsedAssessment &&
          typeof parsedAssessment === "object";
      } catch {
        hasAssessment = false;
      }
    }

    // ---------------------------------------------
    // NEW VISITOR -> LOAD PUBLIC ASSESSMENT
    // ---------------------------------------------
    if (!hasAssessment) {
      const assessmentResponse = await fetch(
        `${import.meta.env.BASE_URL}demo-assessment.json`
      );

      if (assessmentResponse.ok) {
        const demoAssessment =
          await assessmentResponse.json();

        localStorage.setItem(
          "webshieldCurrentAssessment",
          JSON.stringify(demoAssessment)
        );
      } else {
        console.error(
          "Could not load public assessment:",
          assessmentResponse.status
        );
      }
    }
  } catch (error) {
    console.error(
      "Could not initialize WebShield demo:",
      error
    );
  }
}

async function startWebShield() {
  await loadPublicDemo();

  createRoot(
    document.getElementById("root")
  ).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

startWebShield();
