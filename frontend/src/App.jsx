import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import UploadSection from './components/UploadSection'
import ResultsSection from './components/ResultsSection'
import ProcessingOverlay from './components/ProcessingOverlay'
import Footer from './components/Footer'

function App() {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [code, setCode] = useState('')
  const [testCases, setTestCases] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeLanguage, setActiveLanguage] = useState('Python')
  const [currentStep, setCurrentStep] = useState(1)

  const sampleCode = `def calculate_discount(price: float, percent: float) -> float:
    """Calculate discounted price."""
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
    """Divide two numbers."""
    if denominator == 0:
        raise ZeroDivisionError("Cannot divide by zero")
    return numerator / denominator`

  useEffect(() => {
    setTimeout(() => setCode(sampleCode), 400)
  }, [])

  const handleFileUpload = (file) => {
    setUploadedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setCode(e.target.result)
    reader.readAsText(file)
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
  }

  const generateTestCases = async () => {
    if (!code.trim()) {
      alert('Please upload a file or paste code first')
      return
    }

    setIsProcessing(true)
    setCurrentStep(1)

    for (let i = 1; i <= 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setCurrentStep(i)
    }

    const generatedCases = [
      {
        id: 'TC-001',
        name: 'Valid discount calculation',
        category: 'happy_path',
        function_name: 'calculate_discount',
        description: 'Verifies that a 20% discount on $100 returns correct value of $80.00.',
        input: 'price=100.0, percent=20',
        expected_output: '80.0',
        priority: 'high',
        test_code: `def test_valid_discount():
    result = calculate_discount(100.0, 20)
    assert result == 80.0, f"Expected 80.0, got {result}"`,
        tags: ['happy_path']
      },
      {
        id: 'TC-002',
        name: 'Zero percent discount',
        category: 'edge_case',
        function_name: 'calculate_discount',
        description: 'Ensures a 0% discount returns the original price unchanged.',
        input: 'price=50.0, percent=0',
        expected_output: '50.0',
        priority: 'medium',
        test_code: `def test_zero_percent_discount():
    result = calculate_discount(50.0, 0)
    assert result == 50.0`,
        tags: ['edge_case', 'boundary']
      }
    ]

    setTestCases(generatedCases)
    setIsProcessing(false)
    setShowResults(true)
  }

  return (
    <div className="app">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <Navbar />
      <Hero />
      <UploadSection 
        activeLanguage={activeLanguage}
        onLanguageChange={setActiveLanguage}
        uploadedFile={uploadedFile}
        onFileUpload={handleFileUpload}
        onRemoveFile={handleRemoveFile}
        code={code}
        onCodeChange={setCode}
        sampleCode={sampleCode}
        onGenerate={generateTestCases}
        isProcessing={isProcessing}
      />

      {showResults && (
        <ResultsSection testCases={testCases} />
      )}

      {isProcessing && (
        <ProcessingOverlay currentStep={currentStep} />
      )}

      <Footer />
    </div>
  )
}

export default App
