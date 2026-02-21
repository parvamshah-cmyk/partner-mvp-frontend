import React from "react";
import "./StepIndicator.css";

function StepIndicator({ stepInfo }) {
  if (!stepInfo) return null;

  const totalSteps = 4; // birthInfo, appearance, personality, career
  let completedSteps;
  if (stepInfo.phase === "birth") {
    completedSteps = 0;
  } else {
    completedSteps = stepInfo.stepNumber;
  }

  return (
    <div className="step-blocks">
      {[...Array(totalSteps)].map((_, i) => (
        <div
          key={i}
          className={`step-block ${i < completedSteps ? "filled" : ""}`}
        />
      ))}
    </div>
  );
}

export default StepIndicator;
