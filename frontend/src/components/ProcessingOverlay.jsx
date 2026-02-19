import React from 'react'

function ProcessingOverlay({ currentStep }) {
  const steps = [
    { id: 'step1', text: 'Parsing source code structure' },
    { id: 'step2', text: 'Identifying functions & methods' },
    { id: 'step3', text: 'Analyzing edge cases' },
    { id: 'step4', text: 'Generating test assertions' },
    { id: 'step5', text: 'Formatting readable output' }
  ]

  return (
    <div className="processing-overlay show">
      <div className="processing-card">
        <span className="processing-icon">⚙️</span>
        <div className="processing-title">Analyzing Code</div>
        <div className="processing-sub">
          Our AI is reading your source file and generating comprehensive test cases...
        </div>
        <div className="progress-bar-outer">
          <div className="progress-bar-inner"></div>
        </div>
        <div className="processing-steps">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`proc-step ${index + 1 < currentStep ? 'done' : index + 1 === currentStep ? 'active' : ''}`}
            >
              <span className="proc-step-icon">
                {index + 1 < currentStep ? '✅' : index + 1 === currentStep ? '⟳' : '○'}
              </span>
              {step.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProcessingOverlay
