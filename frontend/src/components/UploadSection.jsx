import React from 'react'
import './UploadSection.css'
import LanguageSelector from './LanguageSelector'
import FileUpload from './FileUpload'
import CodeEditor from './CodeEditor'
import Configuration from './Configuration'
import GenerateButton from './GenerateButton'

function UploadSection({
  activeLanguage,
  onLanguageChange,
  uploadedFile,
  onFileUpload,
  onRemoveFile,
  code,
  onCodeChange,
  sampleCode,
  onGenerate,
  isProcessing
}) {
  return (
    <section className="upload-section">
      <div className="wrapper">
        <div className="upload-card">
          <div className="upload-card-header">
            <div className="upload-card-title">
              <div className="step-badge">1</div>
              <h2>Upload Source File</h2>
            </div>
            <LanguageSelector
              activeLanguage={activeLanguage}
              onLanguageChange={onLanguageChange}
            />
          </div>

          <div className="upload-body">
            <FileUpload
              onFileUpload={onFileUpload}
              uploadedFile={uploadedFile}
              onRemoveFile={onRemoveFile}
            />

            <CodeEditor
              code={code}
              onCodeChange={onCodeChange}
              sampleCode={sampleCode}
            />
          </div>

          <Configuration />

          <GenerateButton
            onGenerate={onGenerate}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </section>
  )
}

export default UploadSection
