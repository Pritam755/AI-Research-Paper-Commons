import { useState, useEffect } from "react";
import { 
  Search, 
  FileText, 
  Printer, 
  Download, 
  Menu, 
  BookOpen, 
  Hash, 
  Globe,
  Maximize2,
  Minimize2,
  Clock
} from "lucide-react";
import Markdown from "react-markdown";
import { PRE_AUTHORED_PAPERS } from "./data/papers";
import { ResearchPaper, PaperCategory } from "./types";

// Helper to calculate total word count of a research paper
export function getPaperWordCount(paper: ResearchPaper): number {
  let totalText = "";
  totalText += paper.title + " ";
  totalText += paper.abstract + " ";
  if (paper.sections) {
    paper.sections.forEach((sec) => {
      totalText += sec.title + " " + sec.content + " ";
    });
  }
  if (paper.references) {
    totalText += paper.references.join(" ") + " ";
  }
  
  const words = totalText.trim().split(/\s+/);
  return words.length > 0 && words[0] !== "" ? words.length : 0;
}

// Helper to calculate estimated reading time (assuming standard 200 words per minute)
export function getReadingTimeMinutes(wordCount: number): number {
  const wordsPerMinute = 200;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export default function App() {
  // Papers state
  const [papers, setPapers] = useState<ResearchPaper[]>(PRE_AUTHORED_PAPERS);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper>(PRE_AUTHORED_PAPERS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PaperCategory>("All");

  // UI state
  const [layoutColumns, setLayoutColumns] = useState<1 | 2>(1);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "extra-large">("normal");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [printNotice, setPrintNotice] = useState(false);

  // Adjust sidebar default state based on screen size on mount
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter papers
  const filteredPapers = papers.filter((paper) => {
    const matchesSearch = 
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      paper.abstract.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === "All") return matchesSearch;
    return paper.category === selectedCategory && matchesSearch;
  });

  // Action: Print/Save PDF
  const handlePrintPDF = () => {
    setPrintNotice(true);
    try {
      window.focus();
      window.print();
    } catch (err) {
      console.error("Print failed:", err);
    }
  };

  // Action: Download Raw Markdown
  const handleDownloadMarkdown = () => {
    let md = `# ${selectedPaper.title}\n\n`;
    md += `**Authors:** ${selectedPaper.authors.join(", ")}\n`;
    md += `**Affiliation:** ${selectedPaper.affiliations.join(" • ")}\n`;
    md += `**Date:** ${selectedPaper.date} | **DOI:** ${selectedPaper.doi}\n\n`;
    md += `## Abstract\n${selectedPaper.abstract}\n\n`;
    
    selectedPaper.sections.forEach((sec) => {
      md += `## ${sec.title}\n${sec.content}\n\n`;
    });
    
    md += `## References\n`;
    selectedPaper.references.forEach((ref, idx) => {
      md += `${idx + 1}. ${ref}\n`;
    });
    
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${selectedPaper.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format Font Size classes
  const getFontSizeClass = () => {
    if (fontSize === "large") return "text-[17px] leading-relaxed";
    if (fontSize === "extra-large") return "text-[19px] leading-loose";
    return "text-[15px] leading-relaxed";
  };

  return (
    <div className="min-h-screen bg-[#Faf7f2] flex flex-col font-sans text-[#232220]">
      
      {/* 1. Header (Screen-only) */}
      <header className="bg-[#f0eae1] border-b border-[#e3dcd1] h-16 flex items-center justify-between px-4 sticky top-0 z-30 no-print">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-[#706a60] hover:bg-[#e6dfd5] rounded-md transition-colors"
            title="Toggle Library Sidebar"
            id="toggle-sidebar-btn"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#cc5a37] rounded-sm flex items-center justify-center text-[#fbfaf7] font-serif font-bold text-lg tracking-wider shadow-sm">
              Ω
            </div>
            <div>
              <span className="font-serif font-bold tracking-tight text-[#191919] text-lg">OSII Commons</span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 bg-[#eef5f0] text-[#2d5a37] text-[10px] font-mono border border-[#cedece] rounded font-bold uppercase">
                Copyright-Free
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a 
            href="https://creativecommons.org/licenses/by/4.0/" 
            target="_blank" 
            rel="noreferrer"
            className="hidden md:flex items-center gap-1 text-xs text-[#706a60] hover:text-[#232220] transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>CC BY-4.0 License</span>
          </a>
        </div>
      </header>

      {/* 2. Primary Workspace Panel */}
      <div className="flex-1 flex overflow-hidden relative no-print">
        
        {/* LEFT PANEL: Library Sidebar */}
        <aside 
          className={`fixed inset-y-16 left-0 z-40 lg:static lg:translate-x-0 transition-transform duration-300 bg-[#FAF8F5] border-r border-[#e3dcd1] w-80 flex-shrink-0 flex flex-col ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          id="library-sidebar"
        >
          {/* Search bar */}
          <div className="p-4 border-b border-[#e3dcd1]">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#9c9589]">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, author, abstract..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#fbfaf7] border border-[#e3dcd1] rounded-sm text-xs focus:outline-none focus:border-[#cc5a37] focus:bg-white transition-all text-[#232220]"
                id="search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9c9589] hover:text-[#232220] text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="px-4 py-2 bg-[#f0eae1]/50 border-b border-[#e3dcd1] flex flex-nowrap items-center gap-1 overflow-x-auto text-[11px] font-mono" id="category-tabs-container">
            {(["All", "Architecture", "Optimization", "Alignment"] as PaperCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded-sm whitespace-nowrap transition-all border ${
                  selectedCategory === cat 
                    ? "bg-[#cc5a37] text-white border-[#cc5a37] font-bold shadow-xs" 
                    : "bg-white text-[#706a60] border-[#e3dcd1] hover:border-[#cc5a37]/50 hover:text-[#cc5a37]"
                }`}
                id={`cat-tab-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Paper list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredPapers.length === 0 ? (
              <div className="p-6 text-center text-[#9c9589] text-xs">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No research papers found matching your filters.</p>
              </div>
            ) : (
              filteredPapers.map((paper) => (
                <div
                  key={paper.id}
                  onClick={() => setSelectedPaper(paper)}
                  className={`p-3 rounded-sm border cursor-pointer text-left transition-all ${
                    selectedPaper.id === paper.id
                      ? "bg-[#2e2b29] text-[#fbfaf7] border-[#2e2b29] shadow-md animate-fade-in"
                      : "bg-[#fbfaf7] text-[#232220] hover:bg-[#efebe4] border-[#e8e4db] hover:border-[#cc5a37]/40 shadow-xs"
                  }`}
                  id={`paper-card-${paper.id}`}
                >
                  <div className="flex justify-between items-center gap-1 mb-1">
                    <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-semibold tracking-wider uppercase ${
                      selectedPaper.id === paper.id
                        ? "bg-[#48423f] text-[#efebe4]"
                        : "bg-[#efebe4] text-[#706a60] border border-[#e3dcd1]"
                    }`}>
                      {paper.category}
                    </span>
                    <span className={`flex items-center gap-1 text-[10px] font-mono font-medium ${
                      selectedPaper.id === paper.id ? "text-[#f3dfd9]" : "text-[#706a60]"
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>{getReadingTimeMinutes(getPaperWordCount(paper))} min read</span>
                    </span>
                  </div>
                  <h3 className="text-[12px] font-semibold leading-tight font-serif line-clamp-2 mb-1.5">
                    {paper.title}
                  </h3>
                  <p className={`text-[10px] line-clamp-1 mb-1 ${selectedPaper.id === paper.id ? 'text-[#efebe4]/80' : 'text-[#706a60]'}`}>
                    {paper.authors.join(", ")}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-dotted border-[#e3dcd1] text-[9px] font-mono">
                    <span className={selectedPaper.id === paper.id ? 'text-[#9c9589]' : 'text-[#9c9589]'}>
                      {paper.date}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Hash className="w-2.5 h-2.5" />
                      {paper.doi.split('.').pop() || "osii"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>


        </aside>

        {/* CENTER PANEL: Academic Paper Reader */}
        <main className="flex-1 overflow-y-auto flex flex-col bg-[#FAF7F2]/90 p-4 lg:p-6">
          
          {/* Reader toolbar */}
          <div className="max-w-4xl w-full mx-auto mb-4 bg-[#faf8f5] border border-[#e3dcd1] px-4 py-2.5 rounded shadow-[0_2px_8px_rgba(49,46,43,0.03)] flex flex-wrap items-center justify-between gap-4">
            {/* Left toolbar settings */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Category indicator */}
              <div className="flex items-center gap-1 text-[#706a60] text-xs">
                <BookOpen className="w-4 h-4 text-[#9c9589]" />
                <span className="font-mono text-[11px] font-bold text-[#706a60] bg-[#efebe4] px-2 py-0.5 rounded uppercase border border-[#e3dcd1]/50">
                  {selectedPaper.category}
                </span>
              </div>

              {/* Reading time indicator */}
              <div className="flex items-center gap-1 text-[#706a60] text-xs" id="reader-header-reading-time">
                <Clock className="w-4 h-4 text-[#9c9589]" />
                <span className="font-mono text-[11px] font-bold text-[#706a60] bg-[#efebe4] px-2 py-0.5 rounded uppercase border border-[#e3dcd1]/50">
                  {getReadingTimeMinutes(getPaperWordCount(selectedPaper))} min read
                </span>
              </div>

              {/* Layout columns toggle */}
              <div className="flex items-center border border-[#e3dcd1] rounded p-0.5 bg-[#fbfaf7]">
                <button
                  onClick={() => setLayoutColumns(1)}
                  className={`px-2 py-1 rounded-sm text-[10px] font-mono transition-all cursor-pointer ${
                    layoutColumns === 1 
                      ? "bg-[#2e2b29] text-[#fbfaf7] shadow-xs font-bold" 
                      : "text-[#706a60] hover:text-[#232220]"
                  }`}
                  title="Single Column Layout"
                  id="layout-1-col-btn"
                >
                  <Minimize2 className="w-3 h-3 inline mr-1" />
                  1-Col
                </button>
                <button
                  onClick={() => setLayoutColumns(2)}
                  className={`px-2 py-1 rounded-sm text-[10px] font-mono transition-all cursor-pointer ${
                    layoutColumns === 2 
                      ? "bg-[#2e2b29] text-[#fbfaf7] shadow-xs font-bold" 
                      : "text-[#706a60] hover:text-[#232220]"
                  }`}
                  title="Double Column Layout"
                  id="layout-2-col-btn"
                >
                  <Maximize2 className="w-3 h-3 inline mr-1" />
                  2-Col
                </button>
              </div>

              {/* Font size control */}
              <div className="flex items-center gap-1 border border-[#e3dcd1] rounded p-0.5 bg-[#fbfaf7]">
                <button
                  onClick={() => setFontSize("normal")}
                  className={`w-6 h-5 rounded-sm flex items-center justify-center text-xs font-medium cursor-pointer ${
                    fontSize === "normal" ? "bg-[#2e2b29] text-[#fbfaf7] shadow-xs font-bold" : "text-[#9c9589] hover:text-[#232220]"
                  }`}
                  title="Normal Text Size"
                  id="font-normal-btn"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize("large")}
                  className={`w-6 h-5 rounded-sm flex items-center justify-center text-sm font-medium cursor-pointer ${
                    fontSize === "large" ? "bg-[#2e2b29] text-[#fbfaf7] shadow-xs font-bold" : "text-[#9c9589] hover:text-[#232220]"
                  }`}
                  title="Large Text Size"
                  id="font-large-btn"
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSize("extra-large")}
                  className={`w-6 h-5 rounded-sm flex items-center justify-center text-base font-medium cursor-pointer ${
                    fontSize === "extra-large" ? "bg-[#2e2b29] text-[#fbfaf7] shadow-xs font-bold" : "text-[#9c9589] hover:text-[#232220]"
                  }`}
                  title="Extra Large Text Size"
                  id="font-xlarge-btn"
                >
                  A++
                </button>
              </div>
            </div>

            {/* Right toolbar actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintPDF}
                className="flex items-center gap-1 px-3 py-1 bg-[#cc5a37] text-white rounded-sm text-xs font-mono font-medium hover:bg-[#b24828] transition-colors shadow-xs cursor-pointer border border-[#b24828]"
                title="Print PDF / Save as PDF"
                id="download-pdf-btn"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>


            </div>
          </div>

          {/* Main Academic Container (LaTeX/arXiv-style Manuscript Sheet) */}
          <div className="flex-1 relative p-4">
            
            {/* PRINT NOTICE BANNER */}
            {printNotice && (
              <div className="mx-auto max-w-4xl mb-6 bg-[#fdf9f3] border border-[#e6dfd1] text-[#704815] rounded p-4 text-xs shadow-xs animate-fade-in no-print flex items-start gap-2.5">
                <span className="text-base">ℹ️</span>
                <div className="flex-1">
                  <p className="font-bold mb-1 font-mono text-[#cc5a37]">Preparing print/PDF layout...</p>
                  <p className="leading-relaxed">
                    A print dialog has been requested. To save as PDF, select <strong className="font-semibold">"Save as PDF"</strong> or <strong className="font-semibold">"Microsoft Print to PDF"</strong> as your printer destination.
                  </p>
                  <p className="mt-1.5 text-[#9c9589] leading-relaxed">
                    <em>If the print dialog does not open, gets blocked, or prints empty due to browser security inside the sandbox frame:</em> please click the <strong className="font-semibold">"Open in New Tab"</strong> button at the top-right corner of the preview area, and then try clicking <strong className="font-semibold">Download PDF</strong> there.
                  </p>
                </div>
                <button 
                  onClick={() => setPrintNotice(false)} 
                  className="font-mono text-[10px] text-[#cc5a37] hover:text-[#b24828] font-bold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}


            {/* Scientific Manuscript Sheet */}
            <div className="bg-white shadow-[0_6px_36px_rgba(49,46,43,0.05)] border border-[#eae3d5] rounded-sm p-8 md:p-14 max-w-4xl mx-auto min-h-[800px] flex flex-col justify-between select-text selection:bg-[#f2e6d6] selection:text-[#232220]">
              
              {/* Document Header */}
              <div>
                <div className="text-center mb-10 border-b border-[#eae3d5] pb-8">
                  <span className="text-[10px] tracking-widest font-mono text-[#9c9589] uppercase mb-4 block">
                    Preprint Repository • Open Access Commons • CC BY-4.0
                  </span>
                  
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#191919] tracking-tight leading-tight mb-4 max-w-3xl mx-auto">
                    {selectedPaper.title}
                  </h1>
                  
                  <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-sm font-medium text-[#48423f] mb-2 font-serif">
                    {selectedPaper.authors.map((author, index) => (
                      <span key={author}>
                        {author}
                        {index < selectedPaper.authors.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-xs text-[#706a60] italic mb-4 max-w-2xl mx-auto leading-relaxed">
                    {selectedPaper.affiliations.join(" • ")}
                  </div>
                  
                  <div className="flex items-center justify-center gap-x-4 flex-wrap text-[10px] font-mono text-[#706a60] bg-[#faf8f5] border border-[#e3dcd1] rounded px-3 py-1.5 w-fit mx-auto">
                    <span>Repository Date: {selectedPaper.date}</span>
                    <span className="hidden sm:inline-block text-[#e3dcd1]">|</span>
                    <span>DOI: {selectedPaper.doi}</span>
                    <span className="hidden sm:inline-block text-[#e3dcd1]">|</span>
                    <span className="flex items-center gap-1 text-[#706a60]">
                      <Clock className="w-3 h-3 text-[#9c9589]" />
                      <span>{getReadingTimeMinutes(getPaperWordCount(selectedPaper))} min read ({getPaperWordCount(selectedPaper).toLocaleString()} words)</span>
                    </span>
                    <span className="hidden sm:inline-block text-[#e3dcd1]">|</span>
                    <span className="text-[#2d5a37] font-bold">Public Domain / CC BY-4.0</span>
                  </div>
                </div>

                {/* Abstract Box */}
                <div className="mb-10 p-5 bg-[#faf8f5] rounded-sm border-l-3 border-[#cc5a37] italic text-sm">
                  <h2 className="font-sans font-bold not-italic text-xs tracking-wider uppercase text-[#312e2b] mb-2">
                    Abstract
                  </h2>
                  <p className="text-[#48423f] leading-relaxed text-justify font-serif">
                    {selectedPaper.abstract}
                  </p>
                </div>

                {/* Main Content Sections */}
                <div className={`${layoutColumns === 2 ? "academic-columns" : ""} ${getFontSizeClass()} text-justify leading-relaxed`}>
                  {selectedPaper.sections.map((section, idx) => (
                    <div key={idx} className="mb-8 print-break-inside-avoid">
                      <h2 className="text-base md:text-lg font-bold font-serif text-[#191919] mb-3 border-b border-[#eae3d5] pb-1 mt-8">
                        {section.title}
                      </h2>
                      <div className="markdown-body text-[#232220] whitespace-pre-wrap">
                        <Markdown
                          components={{
                            h1: ({children}) => <h3 className="text-base font-bold font-serif mt-5 mb-2 text-[#191919]">{children}</h3>,
                            h2: ({children}) => <h4 className="text-sm font-semibold font-serif mt-4 mb-1.5 text-[#312e2b]">{children}</h4>,
                            p: ({children}) => <p className="mb-4 leading-relaxed text-[#232220] text-justify font-serif text-base">{children}</p>,
                            ul: ({children}) => <ul className="list-disc pl-5 mb-4 space-y-1 text-[#48423f] text-sm font-serif">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-[#48423f] text-sm font-serif">{children}</ol>,
                            li: ({children}) => <li className="mb-0.5">{children}</li>,
                            code: ({children}) => <code className="bg-[#fcfaf7] border border-[#e8e4db] text-[#b54f31] px-1 py-0.2 rounded text-[11px] font-mono font-medium">{children}</code>,
                            pre: ({children}) => <pre className="bg-[#2e2b29] text-[#fbfaf7] p-4 rounded-sm overflow-x-auto my-4 text-[11px] font-mono leading-relaxed shadow-sm">{children}</pre>,
                            table: ({children}) => <div className="overflow-x-auto my-4 border border-[#e3dcd1] rounded-sm"><table className="min-w-full divide-y divide-[#e3dcd1] text-[11px] text-left">{children}</table></div>,
                            th: ({children}) => <th className="bg-[#faf8f5] px-3 py-1.5 font-semibold text-[#312e2b] uppercase tracking-wider border-b border-[#e3dcd1] font-sans">{children}</th>,
                            td: ({children}) => <td className="px-3 py-1.5 border-b border-[#f0eae1] text-[#706a60] font-mono">{children}</td>,
                          }}
                        >
                          {section.content}
                        </Markdown>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document References Block */}
              <div className="mt-12 pt-8 border-t border-[#eae3d5] print-break-inside-avoid">
                <h2 className="text-sm font-bold font-sans text-[#191919] uppercase tracking-wider mb-4">
                  References & Literature Cited
                </h2>
                <ol className="list-decimal pl-5 space-y-2 text-xs font-sans text-[#706a60] leading-relaxed">
                  {selectedPaper.references.map((ref, idx) => (
                    <li key={idx} className="pl-1">
                      {ref}
                    </li>
                  ))}
                </ol>
              </div>

            </div>
          </div>
        </main>



      </div>

      {/* 3. PRINT-ONLY COMPONENT (Triggered via window.print(), Hidden on screen) */}
      <div id="academic-paper-print-container" className="hidden">
        
        {/* Academic Preprint Header */}
        <div className="text-center mb-8 border-b-2 border-black pb-6">
          <span className="text-[8pt] tracking-widest font-mono block uppercase mb-3">
            Preprint Repository • Open Access Commons • CC BY-4.0
          </span>
          <h1 className="text-2xl font-serif font-bold text-black mb-4">
            {selectedPaper.title}
          </h1>
          <div className="text-sm font-semibold mb-2">
            {selectedPaper.authors.join(", ")}
          </div>
          <div className="text-xs italic text-gray-700 mb-4">
            {selectedPaper.affiliations.join(" • ")}
          </div>
          <div className="text-[8pt] font-mono text-gray-500">
            Repository Date: {selectedPaper.date} | DOI: {selectedPaper.doi} | Estimated Reading Time: {getReadingTimeMinutes(getPaperWordCount(selectedPaper))} min read ({getPaperWordCount(selectedPaper).toLocaleString()} words)
          </div>
        </div>

        {/* Print Abstract */}
        <div className="mb-8 p-4 bg-gray-100 rounded-sm italic text-xs leading-relaxed border-l-4 border-gray-400">
          <h2 className="font-sans font-bold not-italic text-[9pt] uppercase tracking-wider mb-2">Abstract</h2>
          <p>{selectedPaper.abstract}</p>
        </div>

        {/* Print Columns */}
        <div className={`${layoutColumns === 2 ? "print-academic-columns" : ""} font-serif text-[10pt] text-justify leading-relaxed`}>
          {selectedPaper.sections.map((section, idx) => (
            <div key={idx} className="mb-6 print-break-inside-avoid">
              <h2 className="text-[12pt] font-bold font-sans text-black mb-3 border-b border-black pb-1 mt-4 uppercase tracking-wide">
                {section.title}
              </h2>
              <div className="markdown-body whitespace-pre-wrap">
                <Markdown
                  components={{
                    h1: ({children}) => <h3 className="text-[11pt] font-bold font-sans mt-3 mb-1">{children}</h3>,
                    h2: ({children}) => <h4 className="text-[10pt] font-semibold font-sans mt-2 mb-1">{children}</h4>,
                    p: ({children}) => <p className="mb-2 leading-relaxed text-justify">{children}</p>,
                    ul: ({children}) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                    li: ({children}) => <li className="mb-0.5">{children}</li>,
                    code: ({children}) => <code className="bg-gray-100 border border-gray-200 px-1 py-0.2 rounded text-[8.5pt] font-mono">{children}</code>,
                    pre: ({children}) => <pre className="bg-gray-100 border border-gray-200 p-2 rounded-sm overflow-x-auto my-2 text-[8pt] font-mono leading-tight">{children}</pre>,
                    table: ({children}) => <div className="my-3 border border-black"><table className="min-w-full divide-y divide-black text-[8.5pt] text-left">{children}</table></div>,
                    th: ({children}) => <th className="bg-gray-50 px-2 py-1 font-semibold border-b border-black">{children}</th>,
                    td: ({children}) => <td className="px-2 py-1 border-b border-gray-200 font-mono">{children}</td>,
                  }}
                >
                  {section.content}
                </Markdown>
              </div>
            </div>
          ))}
        </div>

        {/* Print References */}
        <div className="mt-8 border-t border-black pt-6 print-break-inside-avoid">
          <h2 className="text-[10pt] font-bold font-sans uppercase tracking-wider mb-3">References</h2>
          <ol className="list-decimal pl-5 space-y-1 text-[8pt] text-gray-800 leading-normal">
            {selectedPaper.references.map((ref, idx) => (
              <li key={idx}>
                {ref}
              </li>
            ))}
          </ol>
        </div>

      </div>

      {/* Screen-only simple footer */}
      <footer className="bg-[#faf8f5] border-t border-[#e3dcd1] py-4 px-4 text-center text-[10px] text-[#9c9589] no-print">
        <p>© 2026 Open Science Initiative for Intelligence. Published globally under Creative Commons Licenses (CC BY 4.0 / CC0). Open access preprint library hosted completely without restrictions, tracking, or login credentials.</p>
      </footer>

    </div>
  );
}
