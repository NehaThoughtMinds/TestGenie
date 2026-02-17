import React, { useState, useRef } from 'react';

// Icons
const IconUpload = () => <span className="text-5xl mb-4 block filter grayscale-[0.5] transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110">📁</span>;
const IconFile = () => <span className="text-3xl">📄</span>;
const IconClear = () => <span className="text-xl">⊘</span>;
const IconSample = () => <span className="text-xl">⊕</span>;
const IconRemove = () => <span>✕</span>;
const IconLightning = () => <span className="text-xl">⚡</span>;

// Sample Data
const SAMPLE_CODE = `def calculate_discount(price: float, percent: float) -> float:
    """Calculate discounted price.
    
    Args:
        price: Original price (must be >= 0)
        percent: Discount percentage (0-100)
    
    Returns:
        Discounted price
        
    Raises:
        ValueError: If percent is out of [0, 100] range
        TypeError: If inputs are not numeric
    """
    if not isinstance(price, (int, float)) or not isinstance(percent, (int, float)):
        raise TypeError("Price and percent must be numeric")
    if price < 0:
        raise ValueError("Price cannot be negative")
    if percent < 0 or percent > 100:
        raise ValueError("Percent must be between 0 and 100")
    return round(price * (1 - percent / 100), 2)


def add_numbers(a: float, b: float) -> float:
    """Add two numbers together."""
    return a + b


def divide(numerator: float, denominator: float) -> float:
    """Divide two numbers.
    
    Raises:
        ZeroDivisionError: If denominator is zero
    """
    if denominator == 0:
        raise ZeroDivisionError("Cannot divide by zero")
    return numerator / denominator`;

const SAMPLE_TEST_CASES = [
    {
        id: 'TC-001', name: 'Valid discount calculation',
        category: 'happy_path', function_name: 'calculate_discount',
        description: 'Verifies that a 20% discount on $100 returns the correct value of $80.00.',
        input: 'price=100.0, percent=20', expected_output: '80.0',
        priority: 'high',
        test_code: `def test_valid_discount():\n    result = calculate_discount(100.0, 20)\n    assert result == 80.0, f"Expected 80.0, got {result}"`,
        tags: ['happy_path']
    },
    {
        id: 'TC-002', name: 'Zero percent discount',
        category: 'edge_case', function_name: 'calculate_discount',
        description: 'Ensures a 0% discount returns the original price unchanged.',
        input: 'price=50.0, percent=0', expected_output: '50.0',
        priority: 'medium',
        test_code: `def test_zero_percent_discount():\n    result = calculate_discount(50.0, 0)\n    assert result == 50.0`,
        tags: ['edge_case', 'boundary']
    },
    {
        id: 'TC-003', name: 'Full 100% discount',
        category: 'edge_case', function_name: 'calculate_discount',
        description: 'Confirms that a full 100% discount returns zero.',
        input: 'price=75.0, percent=100', expected_output: '0.0',
        priority: 'medium',
        test_code: `def test_full_discount():\n    result = calculate_discount(75.0, 100)\n    assert result == 0.0`,
        tags: ['edge_case', 'boundary']
    },
    {
        id: 'TC-004', name: 'Invalid negative percent raises ValueError',
        category: 'negative', function_name: 'calculate_discount',
        description: 'Verifies that providing a negative discount percent raises a ValueError.',
        input: 'price=100.0, percent=-10', expected_output: 'raises ValueError',
        priority: 'high',
        test_code: `import pytest\n\ndef test_negative_percent():\n    with pytest.raises(ValueError, match="Percent must be between"):\n        calculate_discount(100.0, -10)`,
        tags: ['negative']
    },
    {
        id: 'TC-005', name: 'Percent over 100 raises ValueError',
        category: 'negative', function_name: 'calculate_discount',
        description: 'Ensures passing percent > 100 raises a descriptive ValueError.',
        input: 'price=100.0, percent=110', expected_output: 'raises ValueError',
        priority: 'high',
        test_code: `def test_percent_over_100():\n    with pytest.raises(ValueError):\n        calculate_discount(100.0, 110)`,
        tags: ['negative', 'boundary']
    },
    {
        id: 'TC-006', name: 'Division by zero raises ZeroDivisionError',
        category: 'negative', function_name: 'divide',
        description: 'Confirms that dividing by zero raises a ZeroDivisionError with the correct message.',
        input: 'numerator=10, denominator=0', expected_output: 'raises ZeroDivisionError',
        priority: 'high',
        test_code: `def test_divide_by_zero():\n    with pytest.raises(ZeroDivisionError, match="Cannot divide by zero"):\n        divide(10, 0)`,
        tags: ['negative', 'edge_case']
    },
    {
        id: 'TC-007', name: 'Normal addition returns correct sum',
        category: 'happy_path', function_name: 'add_numbers',
        description: 'Verifies that adding 3 and 7 returns 10 as expected.',
        input: 'a=3, b=7', expected_output: '10',
        priority: 'medium',
        test_code: `def test_add_positive_numbers():\n    assert add_numbers(3, 7) == 10`,
        tags: ['happy_path']
    },
    {
        id: 'TC-008', name: 'Non-numeric input raises TypeError',
        category: 'negative', function_name: 'calculate_discount',
        description: 'Checks that passing a string as price raises a TypeError.',
        input: "price='abc', percent=10", expected_output: 'raises TypeError',
        priority: 'medium',
        test_code: `def test_non_numeric_price():\n    with pytest.raises(TypeError, match="must be numeric"):\n        calculate_discount("abc", 10)`,
        tags: ['negative']
    }
];

type TestCase = typeof SAMPLE_TEST_CASES[0];

export default function TestForge() {
    const [activeLang, setActiveLang] = useState('Python');
    const [dragOver, setDragOver] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [code, setCode] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [generatedCases, setGeneratedCases] = useState<TestCase[]>([]);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Stats for summary
    const stats = {
        total: generatedCases.length,
        happy: generatedCases.filter(c => c.category === 'happy_path').length,
        edge: generatedCases.filter(c => c.category === 'edge_case').length,
        neg: generatedCases.filter(c => c.category === 'negative').length,
        boundary: generatedCases.filter(c => c.category === 'boundary').length,
    };

    // Toast helper
    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2800);
    };

    // File handling
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
    };

    const processFile = (file: File) => {
        setUploadedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setCode(e.target?.result as string);
        reader.readAsText(file);
    };

    const clearFile = () => {
        setUploadedFile(null);
        setCode('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Generation
    const handleGenerate = () => {
        if (!code.trim() && !uploadedFile) {
            triggerToast('⚠ Please upload a file or paste code first');
            return;
        }

        setIsProcessing(true);
        setShowResults(false);

        // Simulate processing delay
        setTimeout(() => {
            setGeneratedCases(SAMPLE_TEST_CASES);
            setIsProcessing(false);
            setShowResults(true);
            triggerToast('✓ ' + SAMPLE_TEST_CASES.length + ' test cases generated successfully');

            // Scroll to results
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }, 2800);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    };

    const toggleCard = (id: string) => {
        const newSet = new Set(expandedCards);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedCards(newSet);
    };

    const copyAll = () => {
        const allCode = generatedCases.map(c => c.test_code).join('\n\n');
        navigator.clipboard.writeText(allCode).then(() => triggerToast('✓ All test code copied to clipboard'));
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
                        <span className="text-xl font-extrabold text-text">Test<span className="text-accent">Forge</span></span>
                    </a>
                    <div className="flex gap-1">
                        {['Generator', 'History', 'Templates', 'Docs'].map(item => (
                            <button key={item} className={`nav-pill ${item === 'Generator' ? 'active' : ''}`}>{item}</button>
                        ))}
                    </div>
                    <button className="px-[18px] py-2 bg-accent text-bg border-none rounded-lg text-[13px] font-bold cursor-pointer font-sans tracking-[0.3px] transition-all duration-200 hover:bg-[#33eaff] hover:-translate-y-[1px]">
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
                    <h1 className="text-[clamp(42px,6vw,76px)] font-extrabold leading-[1.05] animate-fadeUp [animation-delay:0.1s]">
                        <span className="block text-text">Generate Unit Tests</span>
                        <span className="block text-accent">From Source Code.</span>
                        <span className="block text-text-dim">Instantly.</span>
                    </h1>
                    <p className="text-[17px] text-text-dim mt-5 max-w-[580px] mx-auto leading-[1.7] animate-fadeUp [animation-delay:0.2s]">
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
                                <div className="text-[28px] font-extrabold text-accent">{stat.num}</div>
                                <div className="text-xs text-text-dim mt-0.5 uppercase tracking-[0.5px]">{stat.label}</div>
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
                            <div className="flex gap-1.5 flex-wrap">
                                {['Python', 'JavaScript', 'TypeScript', 'Java', 'C#', 'Go', 'Rust'].map(lang => (
                                    <span
                                        key={lang}
                                        onClick={() => setActiveLang(lang)}
                                        className={`px-3 py-1 rounded-full text-[11px] font-mono font-medium border cursor-pointer transition-all duration-200 
                      ${activeLang === lang
                                                ? 'bg-[rgba(0,229,255,0.1)] border-[rgba(0,229,255,0.3)] text-accent'
                                                : 'bg-surface2 border-border text-text-dim hover:bg-[rgba(0,229,255,0.1)] hover:border-[rgba(0,229,255,0.3)] hover:text-accent'
                                            }`}
                                    >
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Drop Zone */}
                            <div>
                                {!uploadedFile ? (
                                    <div
                                        className={`border-2 border-dashed rounded-xl py-12 px-6 text-center cursor-pointer transition-all duration-300 bg-surface2 relative overflow-hidden group
                      ${dragOver ? 'border-accent border-solid' : 'border-border-bright hover:border-accent hover:border-solid'}
                    `}
                                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--glow),transparent_60%)] transition-opacity duration-300 ${dragOver ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                        <IconUpload />
                                        <div className="text-base font-bold mb-1.5">Drop your source file here</div>
                                        <div className="text-[13px] text-text-dim">or click to browse your computer</div>
                                        <div className="flex justify-center gap-1.5 mt-4 flex-wrap">
                                            {['.py', '.js', '.ts', '.java', '.cs', '.go', '.rs'].map(ext => (
                                                <span key={ext} className="font-mono text-[10px] px-2 py-0.5 bg-bg border border-border rounded text-text-dim">{ext}</span>
                                            ))}
                                        </div>
                                        <input ref={fileInputRef} type="file" className="hidden" accept=".py,.js,.ts,.java,.cs,.go,.rs,.cpp,.rb,.php,.swift,.kt" onChange={handleFileChange} />
                                    </div>
                                ) : (
                                    <div className="bg-bg border border-border rounded-xl p-4 flex items-center gap-3 animate-fadeUp">
                                        <IconFile />
                                        <div>
                                            <div className="font-mono text-[13px]">{uploadedFile.name}</div>
                                            <div className="text-[11px] text-text-dim mt-0.5">{formatSize(uploadedFile.size)}</div>
                                        </div>
                                        <button className="ml-auto bg-transparent border-none text-text-dim cursor-pointer text-base p-1 hover:text-red-400 transition-colors" onClick={clearFile}>
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
                                        <button className="w-7 h-7 bg-transparent border border-border rounded-md text-text-dim cursor-pointer flex items-center justify-center text-xs hover:bg-bg hover:text-text hover:border-border-bright" title="Clear" onClick={() => setCode('')}>
                                            <IconClear />
                                        </button>
                                        <button className="w-7 h-7 bg-transparent border border-border rounded-md text-text-dim cursor-pointer flex items-center justify-center text-xs hover:bg-bg hover:text-text hover:border-border-bright" title="Load sample" onClick={() => setCode(SAMPLE_CODE)}>
                                            <IconSample />
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    className="flex-1 bg-transparent border-none outline-none resize-none p-4 font-mono text-[12.5px] text-text leading-relaxed placeholder:text-text-faint"
                                    placeholder={`# Or paste your code directly here...
# Example:
def calculate_discount(price, percent):
    if percent < 0 or percent > 100:
        raise ValueError('Invalid percent')
    return price * (1 - percent / 100)`}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Config */}
                        <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: 'Test Framework', options: ['pytest (Python)', 'unittest (Python)', 'Jest (JS)', 'Mocha (JS)', 'JUnit (Java)'] },
                                { label: 'Coverage Depth', options: ['Standard — Happy + Edge', 'Deep — Full boundary analysis', 'Minimal — Happy path', 'Security — Injection'] },
                                { label: 'Output Style', options: ['Human Readable + Code', 'Code Only', 'Specification Only', 'BDD'] }
                            ].map((conf, i) => (
                                <div key={i}>
                                    <label className="block text-[11px] font-semibold text-text-dim uppercase tracking-[0.5px] mb-2">{conf.label}</label>
                                    <select className="w-full bg-surface2 border border-border rounded-lg py-2.5 px-3 text-text text-[13px] font-sans outline-none cursor-pointer appearance-none focus:border-accent bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-no-repeat bg-[right_12px_center]">
                                        {conf.options.map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>

                        {/* Generate Button */}
                        <div className="px-8 pb-8">
                            <button
                                className={`btn-primary ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
                                onClick={handleGenerate}
                                disabled={isProcessing}
                            >
                                {!isProcessing ? (
                                    <>
                                        <IconLightning /> Generate Unit Test Cases
                                    </>
                                ) : (
                                    <>
                                        <div className="w-5 h-5 border-2 border-[rgba(10,12,16,0.3)] border-t-bg rounded-full animate-spin" />
                                        Generating...
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </section>

            {/* Results Section */}
            {showResults && (
                <section className="pb-20 animate-fadeUp px-6" ref={resultsRef}>
                    <div className="max-w-[1280px] mx-auto">

                        {/* Summary Bar */}
                        <div className="bg-surface border border-border rounded-2xl p-5 px-7 mb-6 flex items-center gap-6 flex-wrap">
                            <div className="text-sm font-bold flex-1 flex items-center gap-2">
                                <div className="w-2 h-2 bg-accent3 rounded-full shadow-[0_0_8px_var(--accent3)]" />
                                Generated {stats.total} test cases for <code className="font-mono text-[13px] text-accent ml-1">{uploadedFile?.name || 'math_utils.py'}</code>
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

                        {/* Test Cases List */}
                        <div className="flex flex-col gap-4">
                            {generatedCases.map((tc) => {
                                const isOpen = expandedCards.has(tc.id);

                                const catColorCheck = {
                                    happy_path: 'bg-[rgba(16,185,129,0.1)] text-accent3 border-[rgba(16,185,129,0.2)]',
                                    edge_case: 'bg-[rgba(245,158,11,0.1)] text-warn border-[rgba(245,158,11,0.2)]',
                                    negative: 'bg-[rgba(239,68,68,0.1)] text-[#f87171] border-[rgba(239,68,68,0.2)]',
                                    boundary: 'bg-[rgba(124,58,237,0.1)] text-[#a78bfa] border-[rgba(124,58,237,0.2)]'
                                };

                                const typeStyle = catColorCheck[tc.category as keyof typeof catColorCheck] || catColorCheck.happy_path;

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
                                                <div className="text-[15px] font-bold leading-tight">{tc.name}</div>
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
                                                        <div className="bg-surface2 border border-border rounded-lg p-3 text-[13px] leading-relaxed text-text">{tc.description}</div>
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
                                                                    <div className={`w-2 h-2 rounded-[2px] ${tc.priority === 'high' ? 'bg-[#f87171]' : (tc.priority === 'medium' ? 'bg-warn' : 'bg-border')}`} />
                                                                    <div className={`w-2 h-2 rounded-[2px] ${tc.priority === 'high' ? 'bg-[#f87171]' : 'bg-border'}`} />
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
                    <strong className="text-text-dim">TestForge</strong> — AI Unit Test Generator &nbsp;·&nbsp; Powered by Claude &nbsp;·&nbsp; ©️ 2026
                </div>
            </footer>
        </div>
    );
}
