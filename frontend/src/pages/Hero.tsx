import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import demoVideo from '../assets/AI_Unit_Test_Generator_Video_Demo.mp4';

// Icons
const IconLightning = () => <span className="text-2xl">⚡</span>;
const IconClose = () => <span className="text-xl">✕</span>;

export default function Hero() {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="relative min-h-screen text-text font-sans">
      {/* Orbs */}
      <div className="orb orb-1 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,229,255,0.07),transparent_70%)] top-[-100px] right-[-100px]" />
      <div className="orb orb-2 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(124,58,237,0.08),transparent_70%)] bottom-[100px] left-[-100px] [animation-delay:-4s]" />

      {/* Nav */}
      <Navbar />

      {/* Hero */}
      <section className="flex-1 py-8 text-center">
        <div className="wrapper max-w-[1280px] mx-auto px-6 relative z-[1] h-full justify-center">
          <div className="inline-flex items-center gap-2 px-[14px] py-[6px] bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.2)] rounded-full text-xs font-semibold text-accent mb-6 tracking-[1px] uppercase animate-fadeUp">
            <span className="text-[8px] animate-pulse">●</span> AI-Powered Testing Intelligence
          </div>
          <h1 className="text-[clamp(40px,5vw,60px)] font-extrabold leading-[1.05] animate-fadeUp [animation-delay:0.1s]">
            <span className="block text-text">Generate Unit Tests</span>
            <span className="block text-accent">From Source Code.</span>
            <span className="block text-text-dim">Instantly.</span>
          </h1>
          <p className="text-[16px] text-text-dim mt-4 max-w-[500px] mx-auto leading-[1.6] animate-fadeUp [animation-delay:0.2s]">
            Upload your source file and our AI analyzes every function, edge case, and boundary condition to produce comprehensive, human-readable test suites.
          </p>
          <div className="flex justify-center gap-8 mt-8 animate-fadeUp [animation-delay:0.3s]">
            {[
              { num: '98%', label: 'Coverage Rate' },
              { num: '<3s', label: 'Generation Time' },
              { num: '12+', label: 'Languages' },
              { num: '500K+', label: 'Tests Generated' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-[28px] font-extrabold text-accent">{stat.num}</div>
                <div className="text-[12px] text-text-dim mt-0.5 uppercase tracking-[0.5px]">{stat.label}</div>
              </div>
            ))}
          </div>
          
          {/* Hero Buttons */}
          <div className="flex justify-center gap-4 mt-8 animate-fadeUp [animation-delay:0.4s]">
            <button
              onClick={() => navigate('/upload')}
              className="px-8 py-4 bg-accent text-bg border-none rounded-xl text-[16px] font-bold cursor-pointer font-sans tracking-[0.3px] transition-all duration-200 hover:bg-[#33eaff] hover:-translate-y-[1px] shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <IconLightning />
              Try TestGenie
            </button>
            <button
              onClick={() => setShowVideo(true)}
              className="px-8 py-4 bg-transparent text-accent border-2 border-accent rounded-xl text-[16px] font-bold cursor-pointer font-sans tracking-[0.3px] transition-all duration-200 hover:bg-accent hover:text-bg hover:-translate-y-[1px] flex items-center gap-2"
            >
              <span className="text-xl">▶</span>
              Watch Video
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-[13px] text-text-faint">
        <div className="wrapper">
          <strong className="text-text-dim">TestGenie</strong> — AI Unit Test Generator &nbsp;·&nbsp; Powered by Claude &nbsp;·&nbsp; 2026
        </div>
      </footer>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeUp">
          <div className="relative w-full max-w-4xl mx-4">
            {/* Close Button */}
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-12 right-0 text-text-dim hover:text-text transition-colors text-xl"
            >
              <IconClose />
            </button>
            
            {/* Video Container */}
            <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl">
              <div className="relative aspect-video">
                {/* Placeholder for video - replace with actual video URL */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent2/20">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center text-3xl text-bg mb-4 mx-auto">
                      ▶
                    </div>
                    <h3 className="text-xl font-bold text-text mb-2">TestGenie Demo Video</h3>
                    <p className="text-text-dim">See how TestGenie generates comprehensive unit tests in seconds</p>
                  </div>
                </div>
                
                {/* When you have a real video, uncomment and use this: */}
                <video
                  src={demoVideo}
                  className="absolute inset-0 w-full h-full"
                  controls
                  autoPlay
                  playsInline
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
