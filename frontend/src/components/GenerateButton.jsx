import React from 'react'

function GenerateButton({ onGenerate, isProcessing }) {
  return (
    <div className="generate-row">
      <button className="generate-btn" onClick={onGenerate} disabled={isProcessing}>
        <span className="btn-icon">⚡</span>
        Generate Unit Test Cases
        {isProcessing && <div className="spinner"></div>}
      </button>
    </div>
  )
}

export default GenerateButton
