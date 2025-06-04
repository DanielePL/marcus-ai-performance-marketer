// client/src/components/MarcusIntro.jsx
import React, { useState, useEffect } from 'react';

const MarcusIntro = ({ onIntroComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [glitchActive, setGlitchActive] = useState(true);
  const [textVisible, setTextVisible] = useState(false);

  const introText = "HALLO, ICH BIN MARCUS";
  const subText = "DEIN PERFORMANCE MARKETER";

  useEffect(() => {
    const sequence = async () => {
      // Schritt 1: Glitch Start
      setTimeout(() => setTextVisible(true), 500);

      // Schritt 2: Text erscheint verzerrt
      setTimeout(() => setCurrentStep(1), 1000);

      // Schritt 3: Glitch intensiviert sich
      setTimeout(() => setCurrentStep(2), 2000);

      // Schritt 4: System "stabilisiert" sich
      setTimeout(() => {
        setCurrentStep(3);
        setGlitchActive(false);
      }, 3500);

      // Schritt 5: Crystal clear
      setTimeout(() => setCurrentStep(4), 4500);

      // Schritt 6: Transition zum Hauptinterface
      setTimeout(() => {
        if (onIntroComplete) onIntroComplete();
      }, 6000);
    };

    sequence();
  }, [onIntroComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
      {/* Scanlines Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="scanlines"></div>
      </div>

      {/* Matrix Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="matrix-bg"></div>
      </div>

      {/* Main Content */}
      <div className="text-center relative z-10">
        {/* System Boot Text */}
        {currentStep >= 0 && (
          <div className="mb-8 text-green-400 font-mono text-sm opacity-60">
            <div className="typing-effect">MARCUS_AI_SYSTEM_V2.1</div>
            <div className="typing-effect delay-1">INITIALIZING...</div>
            <div className="typing-effect delay-2">LOADING PERFORMANCE_ENGINE.EXE</div>
          </div>
        )}

        {/* Main Intro Text */}
        {textVisible && (
          <div className="relative">
            {/* Background Glow */}
            <div className="absolute inset-0 blur-xl bg-cyan-400 opacity-30 animate-pulse"></div>

            {/* Main Text */}
            <h1 className={`
              text-6xl md:text-8xl font-bold text-cyan-400 relative z-10
              font-mono tracking-wider
              ${currentStep === 0 ? 'opacity-0' : ''}
              ${currentStep === 1 ? 'glitch-text opacity-80 blur-sm' : ''}
              ${currentStep === 2 ? 'glitch-text-intense opacity-60 blur-md' : ''}
              ${currentStep === 3 ? 'opacity-90 blur-sm' : ''}
              ${currentStep === 4 ? 'opacity-100 blur-none text-shadow-glow' : ''}
              transition-all duration-1000
            `}>
              {introText}
            </h1>

            {/* Sub Text */}
            {currentStep >= 3 && (
              <h2 className={`
                text-2xl md:text-4xl font-semibold text-blue-300 mt-4
                font-mono tracking-widest
                ${currentStep === 3 ? 'opacity-0 blur-sm' : ''}
                ${currentStep === 4 ? 'opacity-100 blur-none' : ''}
                transition-all duration-1500 delay-500
              `}>
                {subText}
              </h2>
            )}
          </div>
        )}

        {/* Status Indicators */}
        {currentStep >= 2 && (
          <div className="mt-12 space-y-2 text-green-400 font-mono text-sm">
            <div className="flex justify-center items-center space-x-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>NEURAL_NETWORKS: ONLINE</span>
            </div>
            <div className="flex justify-center items-center space-x-4">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              <span>GOOGLE_ADS_API: CONNECTED</span>
            </div>
            <div className="flex justify-center items-center space-x-4">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              <span>META_ADS_API: CONNECTED</span>
            </div>
            <div className="flex justify-center items-center space-x-4">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
              <span>OPENAI_INTEGRATION: ACTIVE</span>
            </div>
          </div>
        )}

        {/* Ready Indicator */}
        {currentStep === 4 && (
          <div className="mt-8 text-green-400 font-mono text-lg animate-pulse">
            <span className="text-cyan-400">►</span> SYSTEM READY
          </div>
        )}
      </div>

      {/* Glitch Overlay */}
      {glitchActive && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="glitch-overlay"></div>
        </div>
      )}

      <style jsx>{`
        /* Scanlines Effect */
        .scanlines {
          background: linear-gradient(
            transparent 0%,
            rgba(0, 255, 255, 0.03) 50%,
            transparent 100%
          );
          background-size: 100% 4px;
          animation: scanlines 0.1s linear infinite;
        }

        @keyframes scanlines {
          0% { background-position: 0 0; }
          100% { background-position: 0 4px; }
        }

        /* Matrix Background */
        .matrix-bg {
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 50%);
          animation: matrix 8s ease-in-out infinite;
        }

        @keyframes matrix {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }

        /* Glitch Text Effects */
        .glitch-text {
          position: relative;
          animation: glitch 0.3s infinite;
        }

        .glitch-text::before,
        .glitch-text::after {
          content: 'HALLO, ICH BIN MARCUS';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .glitch-text::before {
          color: #ff0040;
          z-index: -1;
          animation: glitch-1 0.3s infinite;
        }

        .glitch-text::after {
          color: #00ff40;
          z-index: -2;
          animation: glitch-2 0.3s infinite;
        }

        .glitch-text-intense {
          animation: glitch-intense 0.1s infinite;
        }

        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }

        @keyframes glitch-1 {
          0% { transform: translate(0); }
          20% { transform: translate(-4px, 4px); }
          40% { transform: translate(-4px, -4px); }
          60% { transform: translate(4px, 4px); }
          80% { transform: translate(4px, -4px); }
          100% { transform: translate(0); }
        }

        @keyframes glitch-2 {
          0% { transform: translate(0); }
          20% { transform: translate(4px, -4px); }
          40% { transform: translate(4px, 4px); }
          60% { transform: translate(-4px, -4px); }
          80% { transform: translate(-4px, 4px); }
          100% { transform: translate(0); }
        }

        @keyframes glitch-intense {
          0% { transform: translate(0) scale(1); filter: hue-rotate(0deg); }
          10% { transform: translate(-5px, 5px) scale(1.01); filter: hue-rotate(90deg); }
          20% { transform: translate(-5px, -5px) scale(0.99); filter: hue-rotate(180deg); }
          30% { transform: translate(5px, 5px) scale(1.01); filter: hue-rotate(270deg); }
          40% { transform: translate(5px, -5px) scale(0.99); filter: hue-rotate(360deg); }
          50% { transform: translate(-3px, 3px) scale(1); filter: hue-rotate(180deg); }
          60% { transform: translate(-3px, -3px) scale(1.02); filter: hue-rotate(90deg); }
          70% { transform: translate(3px, 3px) scale(0.98); filter: hue-rotate(270deg); }
          80% { transform: translate(3px, -3px) scale(1.01); filter: hue-rotate(0deg); }
          90% { transform: translate(-1px, 1px) scale(1); filter: hue-rotate(45deg); }
          100% { transform: translate(0) scale(1); filter: hue-rotate(0deg); }
        }

        /* Text Shadow Glow */
        .text-shadow-glow {
          text-shadow: 
            0 0 10px rgba(34, 211, 238, 0.8),
            0 0 20px rgba(34, 211, 238, 0.6),
            0 0 40px rgba(34, 211, 238, 0.4),
            0 0 80px rgba(34, 211, 238, 0.2);
        }

        /* Typing Effect */
        .typing-effect {
          overflow: hidden;
          white-space: nowrap;
          animation: typing 2s steps(40, end), blink-caret 0.75s step-end infinite;
        }

        .delay-1 {
          animation-delay: 0.5s;
        }

        .delay-2 {
          animation-delay: 1s;
        }

        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }

        @keyframes blink-caret {
          from, to { border-color: transparent; }
          50% { border-color: #00ff00; }
        }

        /* Glitch Overlay */
        .glitch-overlay {
          background: 
            linear-gradient(90deg, transparent, rgba(255, 0, 100, 0.03), transparent),
            linear-gradient(180deg, transparent, rgba(0, 255, 100, 0.03), transparent);
          animation: overlay-glitch 0.1s infinite;
        }

        @keyframes overlay-glitch {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-2px, 1px) scale(1.001); }
          66% { transform: translate(1px, -1px) scale(0.999); }
          100% { transform: translate(0, 0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default MarcusIntro;