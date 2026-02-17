import React from 'react'

function CodeEditor({ code, onCodeChange, sampleCode }) {
  return (
    <div className="code-panel">
      <div className="code-panel-header">
        <div className="code-panel-dots">
          <div className="dot dot-r"></div>
          <div className="dot dot-y"></div>
          <div className="dot dot-g"></div>
        </div>
        <span className="code-panel-name">paste-or-type.py</span>
        <div className="code-panel-actions">
          <button className="code-action-btn" title="Clear" onClick={() => onCodeChange('')}>⊘</button>
          <button className="code-action-btn" title="Load sample" onClick={() => onCodeChange(sampleCode)}>⊕</button>
        </div>
      </div>
      <textarea 
        className="code-textarea"
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        placeholder="# Or paste your code directly here..."
      />
    </div>
  )
}

export default CodeEditor
