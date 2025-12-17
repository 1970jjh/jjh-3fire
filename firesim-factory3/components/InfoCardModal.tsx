import React, { useState, useMemo } from 'react';
import { INFO_CARD_IMAGES } from '../constants';
import { X, FileSearch, ZoomIn, Grid, PenTool, Trash2, Plus } from 'lucide-react';

interface Props {
  teamId: number;
  totalTeams: number;
  onClose: () => void;
  notes: string[];
  onAddNote: (note: string) => void;
  onDeleteNote: (index: number) => void;
}

const InfoCardModal: React.FC<Props> = ({ teamId, totalTeams, onClose, notes, onAddNote, onDeleteNote }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");

  const teamImages = useMemo(() => {
    const totalImages = INFO_CARD_IMAGES.length;
    const baseCount = Math.floor(totalImages / totalTeams);
    const remainder = totalImages % totalTeams;
    let startIndex = 0;
    for (let i = 1; i < teamId; i++) {
        const countForPrevTeam = baseCount + (i <= remainder ? 1 : 0);
        startIndex += countForPrevTeam;
    }
    const myCount = baseCount + (teamId <= remainder ? 1 : 0);
    const endIndex = startIndex + myCount;
    return INFO_CARD_IMAGES.slice(startIndex, endIndex);
  }, [teamId, totalTeams]);

  const getLabel = (url: string) => {
    try {
        const filename = url.split('/').pop() || '';
        return filename.split('.')[0];
    } catch (e) {
        return '';
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
        onAddNote(newNote.trim());
        setNewNote("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
       <div className="bg-white w-full max-w-md sm:max-w-lg md:max-w-5xl max-h-[95vh] border-4 border-black shadow-[8px_8px_0px_0px_#000] flex flex-col animate-in zoom-in-95 duration-300">
          
          {/* Header */}
          <div className="bg-black p-4 flex justify-between items-center text-white shrink-0 border-b-4 border-black">
             <div className="flex items-center gap-3">
                <div className="bg-[#fbbf24] p-1 border border-white text-black">
                    <FileSearch className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-black text-xl uppercase tracking-wider">Team {teamId} Intel</h2>
                    <span className="text-xs font-mono text-gray-400 block">Total Cards: {teamImages.length}</span>
                </div>
             </div>
             <button onClick={onClose} className="bg-white text-black p-1 hover:bg-[#fbbf24] transition-colors border-2 border-white">
                <X className="w-6 h-6" />
             </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white scrollbar-hide">
             {/* Evidence Grid */}
             <div className="flex items-center gap-2 mb-6 border-b-2 border-black pb-2">
                <Grid className="w-5 h-5" />
                <span className="font-black text-lg uppercase">Evidence Grid</span>
             </div>

             {teamImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 text-gray-400 mb-8">
                    <FileSearch className="w-12 h-12 mb-2 opacity-50" />
                    <p className="font-bold">NO DATA FOUND</p>
                </div>
             ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 mb-8">
                    {teamImages.map((src, idx) => {
                        const label = getLabel(src);
                        return (
                            <div 
                                key={idx}
                                onClick={() => setSelectedImage(src)}
                                className="aspect-[3/4] group relative cursor-pointer border-2 border-black bg-gray-100 hover:shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 transition-all"
                            >
                                <img 
                                    src={src} 
                                    alt={`Info Card ${label}`} 
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                                    loading="lazy"
                                />
                                <div className="absolute top-0 right-0 bg-black text-white text-[10px] font-mono font-bold px-1.5 py-0.5 border-l-2 border-b-2 border-black">
                                    {label}
                                </div>
                            </div>
                        );
                    })}
                </div>
             )}

            {/* Private Notes Section */}
            <div className="bg-gray-50 border-t-4 border-black -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 sm:py-6 pb-2">
                <div className="flex items-center gap-2 mb-4">
                    <PenTool className="w-5 h-5" />
                    <span className="font-black text-base sm:text-lg uppercase">Private Notes</span>
                </div>

                <form onSubmit={handleAddSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
                    <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="단서나 아이디어를 기록..."
                        className="w-full sm:flex-1 p-2 sm:p-3 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] font-bold text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!newNote.trim()}
                        className="bg-black text-white px-4 py-2 border-2 border-black hover:bg-gray-800 disabled:opacity-50 font-black shadow-[4px_4px_0px_0px_#71717a] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="sm:hidden">추가</span>
                    </button>
                </form>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {notes.length === 0 ? (
                        <p className="text-gray-400 font-bold text-xs text-center py-4 italic">No notes recorded yet.</p>
                    ) : (
                        notes.map((note, idx) => (
                            <div key={idx} className="bg-white border-2 border-black p-3 flex justify-between items-center group shadow-[2px_2px_0px_0px_#ccc]">
                                <span className="text-sm font-bold text-gray-800 break-all">{note}</span>
                                <button 
                                    onClick={() => onDeleteNote(idx)}
                                    className="text-gray-400 hover:text-red-600 transition-colors p-1 opacity-50 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

          </div>
          
          <div className="bg-[#fbbf24] p-3 border-t-4 border-black text-center font-bold text-sm shrink-0">
             ⚠️ TOP SECRET: FOR TEAM {teamId} EYES ONLY
          </div>
       </div>

       {/* Full Screen Lightbox */}
       {selectedImage && (
           <div 
             className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
             onClick={() => setSelectedImage(null)}
           >
               <button 
                  className="absolute top-4 right-4 bg-white text-black p-2 border-2 border-black hover:bg-[#fbbf24]"
                  onClick={() => setSelectedImage(null)}
               >
                   <X className="w-8 h-8" />
               </button>
               
               <div className="relative max-w-full max-h-full p-2 bg-white border-2 border-black shadow-[0px_0px_50px_rgba(255,255,255,0.2)]">
                   <img 
                      src={selectedImage} 
                      alt="Full view" 
                      className="max-w-full max-h-[85vh] object-contain"
                      onClick={(e) => e.stopPropagation()} 
                   />
                   <div className="mt-2 text-center bg-black text-white font-mono py-1">
                       EVIDENCE: {getLabel(selectedImage)}
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default InfoCardModal;