import React from 'react';
import { STEP_GUIDES } from '../constants';
import { SimulationStep } from '../types';
import { Lightbulb, Target, ArrowRight } from 'lucide-react';

interface Props {
  step: SimulationStep;
  onClose: () => void;
}

const LearningGuide: React.FC<Props> = ({ step, onClose }) => {
  const guide = STEP_GUIDES[step];

  if (!guide) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm border-4 border-black shadow-[10px_10px_0px_0px_#000] animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4f46e5] p-6 text-white text-center border-b-4 border-black">
          <span className="inline-block bg-white text-black text-xs font-black px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] mb-3">
            STEP GUIDE
          </span>
          <h2 className="text-2xl font-black mb-1 uppercase tracking-tight">{guide.title}</h2>
          <p className="text-white/80 text-sm font-bold font-mono">{guide.concept}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-[#fecaca] p-2 border-2 border-black text-black shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-black mb-1 uppercase bg-[#fecaca] inline-block px-1">Goal</h3>
              <p className="text-sm font-bold text-gray-700 leading-snug">{guide.goal}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-[#fef08a] p-2 border-2 border-black text-black shrink-0">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-black mb-1 uppercase bg-[#fef08a] inline-block px-1">Description</h3>
              <p className="text-sm font-bold text-gray-700 leading-snug">{guide.description}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t-4 border-black">
          <button 
            onClick={onClose}
            className="w-full bg-black text-white font-black py-4 border-2 border-black shadow-[4px_4px_0px_0px_#71717a] hover:bg-gray-800 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            START MISSION
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningGuide;
