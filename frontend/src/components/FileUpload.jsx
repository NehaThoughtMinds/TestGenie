import React from 'react'

function FileUpload({ onFileUpload, uploadedFile, onRemoveFile }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      onFileUpload(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file) {
      onFileUpload(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div>
      <div 
        className="drop-zone"
        onClick={() => document.getElementById('fileInput').click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <span className="drop-icon">📁</span>
        <div className="drop-title">Drop your source file here</div>
        <div className="drop-sub">or click to browse your computer</div>
        <div className="drop-formats">
          {['.py', '.js', '.ts', '.java', '.cs', '.go', '.rs', '.cpp'].map(format => (
            <span key={format} className="format-tag">{format}</span>
          ))}
        </div>
        <input 
          type="file" 
          id="fileInput"
          accept=".py,.js,.ts,.java,.cs,.go,.rs,.cpp,.rb,.php,.swift,.kt"
          onChange={handleFileChange}
        />
      </div>
      {uploadedFile && (
        <div className="upload-preview show">
          <span className="upload-file-icon">📄</span>
          <div>
            <div className="upload-file-name">{uploadedFile.name}</div>
            <div className="upload-file-size">
              {(uploadedFile.size / 1024).toFixed(1)} KB
            </div>
          </div>
          <button className="upload-remove" onClick={onRemoveFile}>✕</button>
        </div>
      )}
    </div>
  )
}

export default FileUpload
