import React from 'react';
import { useApi } from '../hooks/useApi';
import { useToast, useFileUpload, useDragDrop, useExpandedCards, useScrollTo } from '../hooks/useUI';
import { formatSize, copyToClipboard, getCategoryColor, getPriorityColor } from '../utils';
import { FILE_EXTENSIONS, COVERAGE_DEPTH_OPTIONS, MAX_TESTS_OPTIONS, TEST_FRAMEWORK_OPTIONS, PLACEHOLDER_CODE } from '../constants';
import type { TestCase, TestStats } from '../types';

// Icons
const IconUpload = () => <span className="text-6xl mb-4 block filter grayscale-[0.5] transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110">📁</span>;
const IconFile = () => <span className="text-4xl">📄</span>;
const IconClear = () => <span className="text-2xl">⊘</span>;
const IconRemove = () => <span>✕</span>;
const IconLightning = () => <span className="text-2xl">⚡</span>;

export default function TestGenie() {
  const [coverageDepth, setCoverageDepth] = React.useState<'minimal' | 'standard' | 'deep' | 'security'>('standard');
  const [maxTests, setMaxTests] = React.useState(10);
  const [showResults, setShowResults] = React.useState(false);
  const [generatedCases, setGeneratedCases] = React.useState<TestCase[]>([]);

  // Custom hooks
  const { triggerToast, showToast, toastMessage } = useToast();
  const { 
    uploadedFile, 
    code, 
    setCode, 
    fileInputRef, 
    processFile,
    clearFile 
  } = useFileUpload();
  const { dragOver, handleDragOver, handleDragLeave, handleDrop } = useDragDrop(processFile);
  const { expandedCards, toggleCard } = useExpandedCards();
  const { resultsRef, scrollToResults } = useScrollTo();

  // API hook
  const { generateFromText, generateFromFile, isProcessing, apiResponse, error } = useApi();

  // Stats for summary
  const stats: TestStats = {
    total: generatedCases.length,
    happy: generatedCases.filter(c => c.category === 'happy_path').length,
    edge: generatedCases.filter(c => c.category === 'edge_case').length,
    neg: generatedCases.filter(c => c.category === 'negative').length,
    boundary: generatedCases.filter(c => c.category === 'boundary').length,
  };

  // Generation handler
  const handleGenerate = async () => {
    if (!code.trim() && !uploadedFile) {
      triggerToast('⚠ Please upload a file or paste code first');
      return;
    }

    let response;
    
    if (uploadedFile) {
      response = await generateFromFile(uploadedFile, coverageDepth);
    } else {
      response = await generateFromText({
        source_code: code,
        coverage_depth: coverageDepth,
        max_tests: maxTests,
      });
    }

    if (response && response.success) {
      setGeneratedCases(response.test_cases);
      setShowResults(true);
      triggerToast(`✓ ${response.total_tests} test cases generated successfully`);
      scrollToResults();
    } else {
      triggerToast(`❌ Error: ${error || 'Failed to generate tests'}`);
    }
  };

  const copyAll = async () => {
    const allCode = generatedCases.map(c => c.test_code).join('\n\n');
    const success = await copyToClipboard(allCode);
    if (success) {
      triggerToast('✓ All test code copied to clipboard');
    }
  };

  return (
    <div className="relative min-h-screen text-text font-sans">
      {/* Orbs */}
      <div className="orb orb-1 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,229,255,0.07),transparent_70%)] top-[-100px] right-[-100px]" />
      <div className="orb orb-2 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(124,58,237,0.08),transparent_70%)] bottom-[100px] left-[-100px] [animation-delay:-4s]" />

      {/* Nav */}
      <nav className="sticky top-0 z-[100] bg-[rgba(10,12,16,0.85)] backdrop-blur-[20px] border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 bg-gradient-to-br from-accent to-accent2 rounded-lg flex items-center justify-center text-lg">⚙</div>
            <span className="text-2xl font-extrabold text-text">Test<span className="text-accent">Genie</span></span>
          </a>
          <div className="flex gap-1">
            {['Generator', 'History', 'Templates', 'Docs'].map(item => (
              <button key={item} className={`nav-pill ${item === 'Generator' ? 'active' : ''}`}>{item}</button>
            ))}
          </div>
          <button className="px-[18px] py-2 bg-accent text-bg border-none rounded-lg text-[15px] font-bold cursor-pointer font-sans tracking-[0.3px] transition-all duration-200 hover:bg-[#33eaff] hover:-translate-y-[1px]">
            → API Access
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 pb-[60px] text-center">
        <div className="wrapper max-w-[1280px] mx-auto px-6 relative z-[1]">
          <div className="inline-flex items-center gap-2 px-[14px] py-[6px] bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.2)] rounded-full text-xs font-semibold text-accent mb-7 tracking-[1px] uppercase animate-fadeUp">
            <span className="text-[8px] animate-pulse">●</span> AI-Powered Testing Intelligence
          </div>
          <h1 className="text-[clamp(48px,6vw,84px)] font-extrabold leading-[1.05] animate-fadeUp [animation-delay:0.1s]">
            <span className="block text-text">Generate Unit Tests</span>
            <span className="block text-accent">From Source Code.</span>
            <span className="block text-text-dim">Instantly.</span>
          </h1>
          <p className="text-[19px] text-text-dim mt-5 max-w-[580px] mx-auto leading-[1.7] animate-fadeUp [animation-delay:0.2s]">
            Upload your source file and our AI analyzes every function, edge case, and boundary condition to produce comprehensive, human-readable test suites.
          </p>
          <div className="flex justify-center gap-10 mt-11 animate-fadeUp [animation-delay:0.3s]">
            {[
              { num: '98%', label: 'Coverage Rate' },
              { num: '<3s', label: 'Generation Time' },
              { num: '12+', label: 'Languages' },
              { num: '500K+', label: 'Tests Generated' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-[32px] font-extrabold text-accent">{stat.num}</div>
                <div className="text-[13px] text-text-dim mt-0.5 uppercase tracking-[0.5px]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-5 pb-[60px]">
        <div className="wrapper max-w-[1280px] mx-auto px-6 relative z-[1]">
          <div className="bg-surface border border-border rounded-[20px] overflow-hidden animate-fadeUp [animation-delay:0.4s]">

            {/* Header */}
            <div className="p-6 px-8 border-b border-border flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-gradient-to-br from-accent to-accent2 rounded-full flex items-center justify-center text-xs font-extrabold text-bg">1</div>
                <h2 className="text-lg font-bold">Upload Source File</h2>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Drop Zone */}
              <div>
                {!uploadedFile ? (
                  <div
                    className={`border-2 border-dashed rounded-xl py-12 px-6 text-center cursor-pointer transition-all duration-300 bg-surface2 relative overflow-hidden group
                      ${dragOver ? 'border-accent border-solid' : 'border-border-bright hover:border-accent hover:border-solid'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--glow),transparent_60%)] transition-opacity duration-300 ${dragOver ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                    <IconUpload />
                    <div className="text-base font-bold mb-1.5">Drop your source file here</div>
                    <div className="text-[13px] text-text-dim">or click to browse your computer</div>
                    <div className="flex justify-center gap-1.5 mt-4 flex-wrap">
                      {FILE_EXTENSIONS.map(ext => (
                        <span key={ext} className="font-mono text-[10px] px-2 py-0.5 bg-bg border border-border rounded text-text-dim">{ext}</span>
                      ))}
                    </div>
                    <input 
                      ref={fileInputRef} 
                      type="file" 
                      className="hidden" 
                      accept={FILE_EXTENSIONS.join(',')} 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          processFile(e.target.files[0]);
                        }
                      }} 
                    />
                  </div>
                ) : (
                  <div className="bg-bg border border-border rounded-xl p-4 flex items-center gap-3 animate-fadeUp">
                    <IconFile />
                    <div>
                      <div className="font-mono text-[13px]">{uploadedFile.name}</div>
                      <div className="text-[11px] text-text-dim mt-0.5">{formatSize(uploadedFile.size)}</div>
                    </div>
                    <button 
                      className="ml-auto bg-transparent border-none text-text-dim cursor-pointer text-base p-1 hover:text-red-400 transition-colors" 
                      onClick={clearFile}
                    >
                      <IconRemove />
                    </button>
                  </div>
                )}
              </div>

              {/* Code Editor */}
              <div className="bg-surface2 border border-border rounded-xl overflow-hidden flex flex-col h-[300px]">
                <div className="py-3 px-4 border-b border-border flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="font-mono text-[11px] text-text-dim">paste-or-type.py</span>
                  <div className="flex gap-2">
                    <button 
                      className="w-7 h-7 bg-transparent border border-border rounded-md text-text-dim cursor-pointer flex items-center justify-center text-xs hover:bg-bg hover:text-text hover:border-border-bright" 
                      title="Clear" 
                      onClick={() => setCode('')}
                    >
                      <IconClear />
                    </button>
                  </div>
                </div>
                <textarea
                  className="flex-1 bg-transparent border-none outline-none resize-none p-4 font-mono text-[12.5px] text-text leading-relaxed placeholder:text-text-faint"
                  placeholder={PLACEHOLDER_CODE}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            </div>

            {/* Config */}
            <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-text-dim uppercase tracking-[0.5px] mb-2">Coverage Depth</label>
                <select 
                  className="w-full bg-surface2 border border-border rounded-lg py-2.5 px-3 text-text text-[13px] font-sans outline-none cursor-pointer appearance-none focus:border-accent bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22><polyline points=%226 9 12 15 18%22/></svg>')] bg-no-repeat bg-[right_12px_center]"
                  value={coverageDepth}
                  onChange={(e) => setCoverageDepth(e.target.value as any)}
                >
                  {COVERAGE_DEPTH_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-dim uppercase tracking-[0.5px] mb-2">Max Tests</label>
                <select 
                  className="w-full bg-surface2 border border-border rounded-lg py-2.5 px-3 text-text text-[13px] font-sans outline-none cursor-pointer appearance-none focus:border-accent bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22><polyline points=%226 9 12 15 18%22/></svg>')] bg-no-repeat bg-[right_12px_center]"
                  value={maxTests}
                  onChange={(e) => setMaxTests(Number(e.target.value))}
                >
                  {MAX_TESTS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-dim uppercase tracking-[0.5px] mb-2">Test Framework</label>
                <select className="w-full bg-surface2 border border-border rounded-lg py-2.5 px-3 text-text text-[13px] font-sans outline-none cursor-pointer appearance-none focus:border-accent bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22><polyline points=%226 9 12 15 18%22/></svg>')] bg-no-repeat bg-[right_12px_center]">
                  {TEST_FRAMEWORK_OPTIONS.map(option => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <div className="px-8 pb-8">
              <button
                className={`btn-primary ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
                onClick={handleGenerate}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[rgba(10,12,16,0.3)] border-t-bg rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <IconLightning /> Generate Unit Test Cases
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {showResults && apiResponse && (
        <section className="pb-20 animate-fadeUp px-6" ref={resultsRef}>
          <div className="max-w-[1280px] mx-auto">

            {/* Summary Bar */}
            <div className="bg-surface border border-border rounded-2xl p-5 px-7 mb-6 flex items-center gap-6 flex-wrap">
              <div className="text-sm font-bold flex-1 flex items-center gap-2">
                <div className="w-2 h-2 bg-accent3 rounded-full shadow-[0_0_8px_var(--accent3)]" />
                Generated {stats.total} test cases for <code className="font-mono text-[13px] text-accent ml-1">{apiResponse.file_name || uploadedFile?.name || 'source_code'}</code>
              </div>
              <div className="flex gap-2.5 flex-wrap">
                <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[rgba(0,229,255,0.1)] text-accent border border-[rgba(0,229,255,0.2)] flex items-center gap-1.5">⚡ {stats.total} Tests</div>
                {stats.happy > 0 && <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[rgba(16,185,129,0.1)] text-accent3 border border-[rgba(16,185,129,0.2)] flex items-center gap-1.5">✓ {stats.happy} Happy Path</div>}
                {stats.edge > 0 && <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[rgba(245,158,11,0.1)] text-warn border border-[rgba(245,158,11,0.2)] flex items-center gap-1.5">⚠ {stats.edge} Edge Cases</div>}
                {stats.neg > 0 && <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[rgba(124,58,237,0.1)] text-[#a78bfa] border border-[rgba(124,58,237,0.2)] flex items-center gap-1.5">✦ {stats.neg} Negative</div>}
              </div>
              <div className="flex gap-2 ml-auto">
                <button onClick={copyAll} className="px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer font-sans transition-all duration-200 bg-transparent border border-border-bright text-text-dim hover:bg-surface2 hover:text-text hover:border-accent flex items-center gap-1.5">
                  ⎘ Copy All
                </button>
              </div>
            </div>

            {/* API Response Metadata */}
            <div className="bg-surface border border-border rounded-2xl p-5 px-7 mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">Language:</span>
                  <span className="px-2 py-1 rounded bg-[rgba(0,229,255,0.1)] text-accent text-[11px] font-mono font-semibold">{apiResponse.detected_language}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">Framework:</span>
                  <span className="px-2 py-1 rounded bg-[rgba(16,185,129,0.1)] text-accent3 text-[11px] font-mono font-semibold">{apiResponse.recommended_framework}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">Tool:</span>
                  <span className="px-2 py-1 rounded bg-[rgba(245,158,11,0.1)] text-warn text-[11px] font-mono font-semibold">{apiResponse.recommended_tool}</span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">Time:</span>
                  <span className="text-[11px] font-mono text-text-dim">{apiResponse.generation_time_ms}ms</span>
                </div>
              </div>
            </div>

            {/* Test Cases List */}
            <div className="flex flex-col gap-4">
              {generatedCases.map((tc) => {
                const isOpen = expandedCards.has(tc.id);
                const typeStyle = getCategoryColor(tc.category);

                return (
                  <div key={tc.id} className={`bg-surface border border-border rounded-2xl overflow-hidden transition-all duration-200 hover:border-border-bright hover:shadow-lg ${isOpen ? 'border-border-bright' : ''}`}>
                    <div
                      className="p-[18px] px-6 flex items-center gap-4 cursor-pointer hover:bg-[rgba(255,255,255,0.02)] select-none"
                      onClick={() => toggleCard(tc.id)}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-[11px] font-semibold border ${typeStyle}`}>
                        {tc.id}
                      </div>
                      <div className="flex-1">
                        <div className="text-[18px] font-bold leading-tight">{tc.name}</div>
                        <div className="text-xs text-text-dim mt-1 font-mono">fn: {tc.function_name} &nbsp;·&nbsp; {tc.category.replace('_', ' ')}</div>
                      </div>
                      <div className="flex gap-1.5 flex-wrap ml-auto">
                        {tc.tags.map(tag => (
                          <span key={tag} className={`px-2 py-[3px] rounded bg-[rgba(16,185,129,0.1)] text-accent3 text-[10px] font-semibold uppercase tracking-wider ${tag === 'negative' ? 'bg-[rgba(239,68,68,0.1)] text-[#f87171]' : (tag === 'edge_case' ? 'bg-[rgba(245,158,11,0.1)] text-warn' : '')}`}>
                            {tag.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                      <span className={`text-text-dim text-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                    </div>

                    {isOpen && (
                      <div className="border-t border-border p-6 animate-fadeUp">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-text-dim mb-2 block">Description</label>
                            <div className="bg-surface2 border border-border rounded-lg p-3 text-[16px] leading-relaxed text-text">{tc.description}</div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-text-dim mb-2 block">Input</label>
                            <div className="bg-surface2 border border-border rounded-lg p-3 text-[13px] leading-relaxed text-text font-mono text-accent">{tc.input}</div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-text-dim mb-2 block">Expected Output</label>
                            <div className="bg-surface2 border border-border rounded-lg p-3 text-[13px] leading-relaxed text-text flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-[rgba(16,185,129,0.1)] text-accent3 border border-[rgba(16,185,129,0.2)]">{tc.expected_output}</span>
                              <div className="ml-auto flex items-center gap-2">
                                <div className="flex gap-[3px]">
                                  <div className="w-2 h-2 rounded-[2px] bg-[#f87171]" />
                                  <div className={`w-2 h-2 rounded-[2px] ${getPriorityColor(tc.priority)}`} />
                                  <div className={`w-2 h-2 rounded-[2px] ${getPriorityColor(tc.priority)}`} />
                                </div>
                                <span className="text-[11px] text-text-dim">{tc.priority.toUpperCase()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-text-dim mb-2 block">Test Code</label>
                            <div className="bg-bg border border-border rounded-lg p-4 font-mono text-xs leading-[1.8] text-[#a3e4d7] overflow-x-auto whitespace-pre relative group">
                              {tc.test_code}
                              <div className="absolute top-2 right-3 text-[10px] text-text-faint uppercase font-sans tracking-widest">PYTEST</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-[rgba(10,12,16,0.85)] backdrop-blur-sm z-[200] flex flex-col items-center justify-center gap-6 animate-fadeUp">
          <div className="bg-surface border border-border rounded-[20px] p-12 px-16 text-center max-w-[400px]">
            <span className="text-[56px] mb-5 block animate-[rotateSlow_3s_linear_infinite]">⚙️</span>
            <div className="text-[22px] font-extrabold mb-2">Analyzing Code</div>
            <div className="text-sm text-text-dim mb-7">Our AI is reading your source file and generating comprehensive test cases...</div>
            <div className="h-1 bg-border rounded-full overflow-hidden w-full relative">
              <div className="h-full bg-gradient-to-r from-accent to-accent2 rounded-full absolute left-0 top-0 w-0 animate-progress" />
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`fixed bottom-6 right-6 z-[300] bg-surface border border-accent3 rounded-xl py-3 px-5 text-[13px] font-semibold text-accent3 flex items-center gap-2 transform transition-all duration-300 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        {toastMessage}
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-[13px] text-text-faint">
        <div className="wrapper">
          <strong className="text-text-dim">TestGenie</strong> — AI Unit Test Generator &nbsp;·&nbsp; Powered by Claude &nbsp;·&nbsp; ©️ 2026
        </div>
      </footer>
    </div>
  );
}
