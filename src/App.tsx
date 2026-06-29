import { useState, useEffect, useRef } from "react";
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
  Clock,
  Sun,
  Moon,
  Palette
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

const themeStyles = {
  light: {
    bg: "bg-[#Faf7f2] text-[#232220]",
    header: "bg-[#f0eae1] border-[#e3dcd1] text-[#232220]",
    headerBtn: "text-[#706a60] hover:bg-[#e6dfd5]",
    logoBg: "bg-[#cc5a37] text-[#fbfaf7]",
    logoText: "text-[#191919]",
    badge: "bg-[#eef5f0] text-[#2d5a37] border-[#cedece]",
    aside: "bg-[#FAF8F5] border-[#e3dcd1]",
    searchBorder: "border-[#e3dcd1]",
    searchIcon: "text-[#9c9589]",
    searchInput: "bg-[#fbfaf7] border-[#e3dcd1] text-[#232220] focus:border-[#cc5a37]",
    searchClear: "text-[#9c9589] hover:text-[#232220]",
    tabsBg: "bg-[#f0eae1]/50 border-[#e3dcd1]",
    tabActive: "bg-[#cc5a37] text-white border-[#cc5a37]",
    tabInactive: "bg-white text-[#706a60] border-[#e3dcd1] hover:border-[#cc5a37]/50 hover:text-[#cc5a37]",
    cardSelected: "bg-[#2e2b29] text-[#fbfaf7] border-[#2e2b29]",
    cardUnselected: "bg-[#fbfaf7] text-[#232220] hover:bg-[#efebe4] border-[#e8e4db] hover:border-[#cc5a37]/40",
    cardBadgeSelected: "bg-[#48423f] text-[#efebe4]",
    cardBadgeUnselected: "bg-[#efebe4] text-[#706a60] border border-[#e3dcd1]",
    cardMetaSelected: "text-[#f3dfd9]",
    cardMetaUnselected: "text-[#706a60]",
    cardAuthorsSelected: "text-[#efebe4]/80",
    cardAuthorsUnselected: "text-[#706a60]",
    cardBorderSelected: "border-[#e3dcd1]",
    cardBorderUnselected: "border-[#e3dcd1]",
    mainBg: "bg-[#FAF7F2]/90",
    toolbarBg: "bg-[#faf8f5] border-[#e3dcd1]",
    toolbarIndicator: "text-[#706a60] bg-[#efebe4] border-[#e3dcd1]/50",
    toolbarIndicatorIcon: "text-[#9c9589]",
    toolbarBtnGroup: "border-[#e3dcd1] bg-[#fbfaf7]",
    toolbarBtnActive: "bg-[#2e2b29] text-[#fbfaf7]",
    toolbarBtnInactive: "text-[#706a60] hover:text-[#232220]",
    toolbarActionBtn: "bg-[#cc5a37] text-white hover:bg-[#b24828] border-[#b24828]",
    manuscriptBg: "bg-white border-[#eae3d5] text-[#232220]",
    manuscriptHeaderBorder: "border-[#eae3d5]",
    manuscriptSub: "text-[#9c9589]",
    manuscriptTitle: "text-[#191919]",
    manuscriptAuthors: "text-[#48423f]",
    manuscriptAffils: "text-[#706a60]",
    manuscriptMetaBg: "text-[#706a60] bg-[#faf8f5] border-[#e3dcd1]",
    manuscriptAbstract: "bg-[#faf8f5] border-[#cc5a37] text-[#48423f] border-l-3",
    manuscriptHeaderText: "text-[#312e2b]",
    manuscriptH2: "text-[#191919] border-[#eae3d5]",
    manuscriptH3: "text-[#191919]",
    manuscriptH4: "text-[#312e2b]",
    manuscriptP: "text-[#232220]",
    manuscriptList: "text-[#48423f]",
    manuscriptCode: "bg-[#fcfaf7] border-[#e8e4db] text-[#b54f31]",
    manuscriptPre: "bg-[#2e2b29] text-[#fbfaf7] shadow-sm",
    manuscriptTableBorder: "border-[#e3dcd1]",
    manuscriptTh: "bg-[#faf8f5] text-[#312e2b] border-[#e3dcd1]",
    manuscriptTd: "border-[#f0eae1] text-[#706a60]",
    manuscriptRefsBorder: "border-[#eae3d5]",
    manuscriptRefsTitle: "text-[#191919]",
    manuscriptRefsList: "text-[#706a60]",
    footerBg: "bg-[#faf8f5] border-[#e3dcd1] text-[#9c9589]",
    noticeBg: "bg-[#fdf9f3] border-[#e6dfd1] text-[#704815]",
    noticeTitle: "text-[#cc5a37]",
    noticeText: "text-[#9c9589]",
    noticeBtn: "text-[#cc5a37] hover:text-[#b24828]",
    progressBarBg: "bg-[#e3dcd1]/30",
  },
  sepia: {
    bg: "bg-[#f4ecd8] text-[#433422]",
    header: "bg-[#e8ddc4] border-[#dfd2b5] text-[#433422]",
    headerBtn: "text-[#7a654d] hover:bg-[#dfd2b5]",
    logoBg: "bg-[#b05030] text-[#fbf9f4]",
    logoText: "text-[#2a1e12]",
    badge: "bg-[#e8f0e8] text-[#24522a] border-[#cedbcd]",
    aside: "bg-[#FAF5E6] border-[#dfd2b5]",
    searchBorder: "border-[#dfd2b5]",
    searchIcon: "text-[#9e8870]",
    searchInput: "bg-[#fdfbf7] border-[#dfd2b5] text-[#433422] focus:border-[#b05030]",
    searchClear: "text-[#9e8870] hover:text-[#433422]",
    tabsBg: "bg-[#e8ddc4]/50 border-[#dfd2b5]",
    tabActive: "bg-[#b05030] text-white border-[#b05030]",
    tabInactive: "bg-white text-[#7a654d] border-[#dfd2b5] hover:border-[#b05030]/50 hover:text-[#b05030]",
    cardSelected: "bg-[#433c35] text-[#fcf9f2] border-[#433c35]",
    cardUnselected: "bg-[#fbf9f4] text-[#433422] hover:bg-[#eee4cb] border-[#e6decc] hover:border-[#b05030]/40",
    cardBadgeSelected: "bg-[#59524a] text-[#fcf9f2]",
    cardBadgeUnselected: "bg-[#eee4cb] text-[#7a654d] border border-[#dfd2b5]",
    cardMetaSelected: "text-[#f5ded7]",
    cardMetaUnselected: "text-[#7a654d]",
    cardAuthorsSelected: "text-[#fcf9f2]/80",
    cardAuthorsUnselected: "text-[#7a654d]",
    cardBorderSelected: "border-[#dfd2b5]",
    cardBorderUnselected: "border-[#dfd2b5]",
    mainBg: "bg-[#f4ecd8]/90",
    toolbarBg: "bg-[#FAF5E6] border-[#dfd2b5]",
    toolbarIndicator: "text-[#7a654d] bg-[#eee4cb] border-[#dfd2b5]/50",
    toolbarIndicatorIcon: "text-[#9e8870]",
    toolbarBtnGroup: "border-[#dfd2b5] bg-[#fdfbf7]",
    toolbarBtnActive: "bg-[#433c35] text-[#fcf9f2]",
    toolbarBtnInactive: "text-[#7a654d] hover:text-[#433422]",
    toolbarActionBtn: "bg-[#b05030] text-white hover:bg-[#943f23] border-[#943f23]",
    manuscriptBg: "bg-[#fdf6e3] border-[#e6deb3] text-[#433422]",
    manuscriptHeaderBorder: "border-[#e6deb3]",
    manuscriptSub: "text-[#9e8870]",
    manuscriptTitle: "text-[#2a1e12]",
    manuscriptAuthors: "text-[#594d3f]",
    manuscriptAffils: "text-[#7a654d]",
    manuscriptMetaBg: "text-[#7a654d] bg-[#fdfbf7] border-[#dfd2b5]",
    manuscriptAbstract: "bg-[#FAF5E6] border-[#b05030] text-[#594d3f] border-l-3",
    manuscriptHeaderText: "text-[#433c35]",
    manuscriptH2: "text-[#2a1e12] border-[#e6deb3]",
    manuscriptH3: "text-[#2a1e12]",
    manuscriptH4: "text-[#433c35]",
    manuscriptP: "text-[#433422]",
    manuscriptList: "text-[#594d3f]",
    manuscriptCode: "bg-[#FAF5E6] border-[#ebdcb9] text-[#a03d1e]",
    manuscriptPre: "bg-[#433c35] text-[#fcf9f2] shadow-sm",
    manuscriptTableBorder: "border-[#dfd2b5]",
    manuscriptTh: "bg-[#FAF5E6] text-[#433c35] border-[#dfd2b5]",
    manuscriptTd: "border-[#eee4cb] text-[#7a654d]",
    manuscriptRefsBorder: "border-[#e6deb3]",
    manuscriptRefsTitle: "text-[#2a1e12]",
    manuscriptRefsList: "text-[#7a654d]",
    footerBg: "bg-[#FAF5E6] border-[#dfd2b5] text-[#9e8870]",
    noticeBg: "bg-[#fdf9f0] border-[#ebdcb9] text-[#7a581e]",
    noticeTitle: "text-[#b05030]",
    noticeText: "text-[#9e8870]",
    noticeBtn: "text-[#b05030] hover:text-[#943f23]",
    progressBarBg: "bg-[#dfd2b5]/30",
  },
  dark: {
    bg: "bg-[#181816] text-[#e3dfd5]",
    header: "bg-[#22211f] border-[#383633] text-[#e3dfd5]",
    headerBtn: "text-[#a39e93] hover:bg-[#2d2c29]",
    logoBg: "bg-[#cc5a37] text-[#181816]",
    logoText: "text-[#fbfaf7]",
    badge: "bg-[#202d23] text-[#a2cfa9] border-[#2c3d2e]",
    aside: "bg-[#1e1e1c] border-[#383633]",
    searchBorder: "border-[#383633]",
    searchIcon: "text-[#706c64]",
    searchInput: "bg-[#181816] border-[#383633] text-[#e3dfd5] focus:border-[#cc5a37]",
    searchClear: "text-[#706c64] hover:text-[#e3dfd5]",
    tabsBg: "bg-[#22211f]/50 border-[#383633]",
    tabActive: "bg-[#cc5a37] text-[#181816] border-[#cc5a37] font-bold",
    tabInactive: "bg-[#1e1e1c] text-[#a39e93] border-[#383633] hover:border-[#cc5a37]/50 hover:text-[#cc5a37]",
    cardSelected: "bg-[#cc5a37] text-[#181816] border-[#cc5a37]",
    cardUnselected: "bg-[#22211f] text-[#e3dfd5] hover:bg-[#2d2c29] border-[#2d2c29] hover:border-[#cc5a37]/40",
    cardBadgeSelected: "bg-[#b04825] text-[#ffffff]",
    cardBadgeUnselected: "bg-[#2d2c29] text-[#a39e93] border border-[#383633]",
    cardMetaSelected: "text-[#2d2c29]",
    cardMetaUnselected: "text-[#a39e93]",
    cardAuthorsSelected: "text-[#181816]/90",
    cardAuthorsUnselected: "text-[#a39e93]",
    cardBorderSelected: "border-[#cc5a37]",
    cardBorderUnselected: "border-[#383633]",
    mainBg: "bg-[#121211]/95",
    toolbarBg: "bg-[#1e1e1c] border-[#383633]",
    toolbarIndicator: "text-[#a39e93] bg-[#22211f] border-[#383633]/50",
    toolbarIndicatorIcon: "text-[#706c64]",
    toolbarBtnGroup: "border-[#383633] bg-[#181816]",
    toolbarBtnActive: "bg-[#cc5a37] text-[#181816]",
    toolbarBtnInactive: "text-[#a39e93] hover:text-[#e3dfd5]",
    toolbarActionBtn: "bg-[#cc5a37] text-[#181816] hover:bg-[#e06b48] border-[#cc5a37] font-bold",
    manuscriptBg: "bg-[#1e1e1c] border-[#2e2d2a] text-[#e3dfd5]",
    manuscriptHeaderBorder: "border-[#2e2d2a]",
    manuscriptSub: "text-[#706c64]",
    manuscriptTitle: "text-[#fbfaf7]",
    manuscriptAuthors: "text-[#c2beb4]",
    manuscriptAffils: "text-[#a39e93]",
    manuscriptMetaBg: "text-[#a39e93] bg-[#181816] border-[#2d2c29]",
    manuscriptAbstract: "bg-[#181816] border-[#cc5a37] text-[#c2beb4] border-l-3",
    manuscriptHeaderText: "text-[#e3dfd5]",
    manuscriptH2: "text-[#fbfaf7] border-[#2e2d2a]",
    manuscriptH3: "text-[#fbfaf7]",
    manuscriptH4: "text-[#e3dfd5]",
    manuscriptP: "text-[#e3dfd5]",
    manuscriptList: "text-[#c2beb4]",
    manuscriptCode: "bg-[#181816] border-[#2d2c29] text-[#e07b5a]",
    manuscriptPre: "bg-[#121211] text-[#e3dfd5] shadow-inner border border-[#2d2c29]",
    manuscriptTableBorder: "border-[#383633]",
    manuscriptTh: "bg-[#181816] text-[#fbfaf7] border-[#383633]",
    manuscriptTd: "border-[#22211f] text-[#a39e93]",
    manuscriptRefsBorder: "border-[#2e2d2a]",
    manuscriptRefsTitle: "text-[#fbfaf7]",
    manuscriptRefsList: "text-[#a39e93]",
    footerBg: "bg-[#181816] border-[#2e2d2a] text-[#706c64]",
    noticeBg: "bg-[#2c2214] border-[#443521] text-[#e5b367]",
    noticeTitle: "text-[#cc5a37]",
    noticeText: "text-[#706c64]",
    noticeBtn: "text-[#cc5a37] hover:text-[#e06b48]",
    progressBarBg: "bg-[#383633]/50",
  }
};

export default function App() {
  // Papers state
  const [papers, setPapers] = useState<ResearchPaper[]>(PRE_AUTHORED_PAPERS);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper>(PRE_AUTHORED_PAPERS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PaperCategory>("All");
  const [theme, setTheme] = useState<"light" | "sepia" | "dark">("light");

  const s = themeStyles[theme];

  // UI state
  const [layoutColumns, setLayoutColumns] = useState<1 | 2>(1);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "extra-large">("normal");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [printNotice, setPrintNotice] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll progress of the main reader container
  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = mainEl;
      const totalScroll = scrollHeight - clientHeight;
      if (totalScroll <= 0) {
        setScrollProgress(0);
      } else {
        const progress = (scrollTop / totalScroll) * 100;
        setScrollProgress(progress);
      }
    };

    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    // Run once initially to set the state
    handleScroll();

    return () => {
      mainEl.removeEventListener("scroll", handleScroll);
    };
  }, [selectedPaper]);

  // Reset scroll position on paper change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    setScrollProgress(0);
  }, [selectedPaper]);

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

  // Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid navigating if the user is currently typing in an input
      const activeEl = document.activeElement;
      if (
        activeEl?.tagName === "INPUT" ||
        activeEl?.tagName === "TEXTAREA" ||
        (activeEl && "isContentEditable" in activeEl && (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const currentIndex = filteredPapers.findIndex((p) => p.id === selectedPaper.id);
        if (currentIndex !== -1 && currentIndex < filteredPapers.length - 1) {
          const nextPaper = filteredPapers[currentIndex + 1];
          setSelectedPaper(nextPaper);
          const element = document.getElementById(`paper-card-${nextPaper.id}`);
          element?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const currentIndex = filteredPapers.findIndex((p) => p.id === selectedPaper.id);
        if (currentIndex > 0) {
          const prevPaper = filteredPapers[currentIndex - 1];
          setSelectedPaper(prevPaper);
          const element = document.getElementById(`paper-card-${prevPaper.id}`);
          element?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredPapers, selectedPaper]);

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
    <div className={`min-h-screen ${s.bg} flex flex-col font-sans transition-colors duration-200`}>
      
      {/* 1. Header (Screen-only) */}
      <header className={`${s.header} border-b h-16 flex items-center justify-between px-4 sticky top-0 z-30 no-print transition-colors duration-200`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 ${s.headerBtn} rounded-md transition-colors`}
            title="Toggle Library Sidebar"
            id="toggle-sidebar-btn"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${s.logoBg} rounded-sm flex items-center justify-center font-serif font-bold text-lg tracking-wider shadow-sm transition-colors duration-200`}>
              Ω
            </div>
            <div>
              <span className={`font-serif font-bold tracking-tight ${s.logoText} text-lg transition-colors duration-200`}>OSII Commons</span>
              <span className={`hidden sm:inline-block ml-2 px-1.5 py-0.5 ${s.badge} text-[10px] font-mono border rounded font-bold uppercase transition-colors duration-200`}>
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
            className={`hidden md:flex items-center gap-1 text-xs ${s.headerBtn} transition-colors`}
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
          className={`fixed inset-y-16 left-0 z-40 lg:static lg:translate-x-0 transition-transform duration-300 ${s.aside} border-r w-80 flex-shrink-0 flex flex-col ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          id="library-sidebar"
        >
          {/* Search bar */}
          <div className={`p-4 border-b ${s.searchBorder}`}>
            <div className="relative">
              <span className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${s.searchIcon}`}>
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, author, abstract..."
                className={`w-full pl-9 pr-3 py-1.5 ${s.searchInput} rounded-sm text-xs focus:outline-none focus:bg-transparent transition-all`}
                id="search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${s.searchClear} text-xs`}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className={`px-4 py-2 ${s.tabsBg} border-b flex flex-nowrap items-center gap-1 overflow-x-auto text-[11px] font-mono`} id="category-tabs-container">
            {(["All", "Architecture", "Optimization", "Alignment"] as PaperCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded-sm whitespace-nowrap transition-all border cursor-pointer ${
                  selectedCategory === cat 
                    ? `${s.tabActive} font-bold shadow-xs` 
                    : `${s.tabInactive}`
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
                      ? `${s.cardSelected} shadow-md animate-fade-in`
                      : `${s.cardUnselected} shadow-xs`
                  }`}
                  id={`paper-card-${paper.id}`}
                >
                  <div className="flex justify-between items-center gap-1 mb-1">
                    <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-semibold tracking-wider uppercase ${
                      selectedPaper.id === paper.id
                        ? `${s.cardBadgeSelected}`
                        : `${s.cardBadgeUnselected}`
                    }`}>
                      {paper.category}
                    </span>
                    <span className={`flex items-center gap-1 text-[10px] font-mono font-medium ${
                      selectedPaper.id === paper.id ? `${s.cardMetaSelected}` : `${s.cardMetaUnselected}`
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>{getReadingTimeMinutes(getPaperWordCount(paper))} min read</span>
                    </span>
                  </div>
                  <h3 className="text-[12px] font-semibold leading-tight font-serif line-clamp-2 mb-1.5">
                    {paper.title}
                  </h3>
                  <p className={`text-[10px] line-clamp-1 mb-1 ${selectedPaper.id === paper.id ? `${s.cardAuthorsSelected}` : `${s.cardAuthorsUnselected}`}`}>
                    {paper.authors.join(", ")}
                  </p>
                  <div className={`flex items-center justify-between mt-2 pt-1 border-t border-dotted ${selectedPaper.id === paper.id ? s.cardBorderSelected : s.cardBorderUnselected} text-[9px] font-mono`}>
                    <span className={selectedPaper.id === paper.id ? 'opacity-85' : 'opacity-70'}>
                      {paper.date}
                    </span>
                    <span className="flex items-center gap-0.5 opacity-80">
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
        <main ref={mainRef} className={`flex-1 overflow-y-auto flex flex-col ${s.mainBg} p-4 lg:p-6 relative transition-colors duration-200`}>
          
          {/* Thin sticky scroll progress bar */}
          <div className={`sticky top-0 left-0 right-0 z-50 -mx-4 lg:-mx-6 -mt-4 lg:-mt-6 mb-4 h-1 ${s.progressBarBg} no-print`}>
            <div 
              className="h-full bg-[#cc5a37] transition-all duration-75 ease-out rounded-r-xs"
              style={{ width: `${scrollProgress}%` }}
              id="scroll-progress-bar"
            />
          </div>
          
          {/* Reader toolbar */}
          <div className={`max-w-4xl w-full mx-auto mb-4 ${s.toolbarBg} px-4 py-2.5 rounded shadow-[0_2px_8px_rgba(49,46,43,0.03)] flex flex-wrap items-center justify-between gap-4 transition-colors duration-200`}>
            {/* Left toolbar settings */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Category indicator */}
              <div className="flex items-center gap-1 text-xs">
                <BookOpen className={`w-4 h-4 ${s.toolbarIndicatorIcon}`} />
                <span className={`font-mono text-[11px] font-bold ${s.toolbarIndicator} px-2 py-0.5 rounded uppercase border`}>
                  {selectedPaper.category}
                </span>
              </div>

              {/* Reading time indicator */}
              <div className="flex items-center gap-1 text-xs" id="reader-header-reading-time">
                <Clock className={`w-4 h-4 ${s.toolbarIndicatorIcon}`} />
                <span className={`font-mono text-[11px] font-bold ${s.toolbarIndicator} px-2 py-0.5 rounded uppercase border`}>
                  {getReadingTimeMinutes(getPaperWordCount(selectedPaper))} min read
                </span>
              </div>

              {/* Layout columns toggle */}
              <div className={`flex items-center border ${s.toolbarBtnGroup} rounded p-0.5`}>
                <button
                  onClick={() => setLayoutColumns(1)}
                  className={`px-2 py-1 rounded-sm text-[10px] font-mono transition-all cursor-pointer ${
                    layoutColumns === 1 
                      ? `${s.toolbarBtnActive} shadow-xs font-bold` 
                      : `${s.toolbarBtnInactive}`
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
                      ? `${s.toolbarBtnActive} shadow-xs font-bold` 
                      : `${s.toolbarBtnInactive}`
                  }`}
                  title="Double Column Layout"
                  id="layout-2-col-btn"
                >
                  <Maximize2 className="w-3 h-3 inline mr-1" />
                  2-Col
                </button>
              </div>

              {/* Font size control */}
              <div className={`flex items-center gap-1 border ${s.toolbarBtnGroup} rounded p-0.5`}>
                <button
                  onClick={() => setFontSize("normal")}
                  className={`w-6 h-5 rounded-sm flex items-center justify-center text-xs font-medium cursor-pointer ${
                    fontSize === "normal" ? `${s.toolbarBtnActive} shadow-xs font-bold` : `${s.toolbarBtnInactive}`
                  }`}
                  title="Normal Text Size"
                  id="font-normal-btn"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize("large")}
                  className={`w-6 h-5 rounded-sm flex items-center justify-center text-sm font-medium cursor-pointer ${
                    fontSize === "large" ? `${s.toolbarBtnActive} shadow-xs font-bold` : `${s.toolbarBtnInactive}`
                  }`}
                  title="Large Text Size"
                  id="font-large-btn"
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSize("extra-large")}
                  className={`w-6 h-5 rounded-sm flex items-center justify-center text-base font-medium cursor-pointer ${
                    fontSize === "extra-large" ? `${s.toolbarBtnActive} shadow-xs font-bold` : `${s.toolbarBtnInactive}`
                  }`}
                  title="Extra Large Text Size"
                  id="font-xlarge-btn"
                >
                  A++
                </button>
              </div>

              {/* Theme selection toggle */}
              <div className={`flex items-center gap-1 border ${s.toolbarBtnGroup} rounded p-0.5`} id="theme-toggle-group">
                <button
                  onClick={() => setTheme("light")}
                  className={`px-2 py-1 rounded-sm text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
                    theme === "light" 
                      ? "bg-[#cc5a37] text-white shadow-xs font-bold" 
                      : `${s.toolbarBtnInactive}`
                  }`}
                  title="Light Theme"
                  id="theme-light-btn"
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Light</span>
                </button>
                <button
                  onClick={() => setTheme("sepia")}
                  className={`px-2 py-1 rounded-sm text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
                    theme === "sepia" 
                      ? "bg-[#b05030] text-white shadow-xs font-bold" 
                      : `${s.toolbarBtnInactive}`
                  }`}
                  title="Sepia Theme"
                  id="theme-sepia-btn"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sepia</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`px-2 py-1 rounded-sm text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
                    theme === "dark" 
                      ? "bg-[#e06b48] text-[#181816] shadow-xs font-bold" 
                      : `${s.toolbarBtnInactive}`
                  }`}
                  title="Dark Theme"
                  id="theme-dark-btn"
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dark</span>
                </button>
              </div>
            </div>

            {/* Right toolbar actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintPDF}
                className={`flex items-center gap-1 px-3 py-1 ${s.toolbarActionBtn} rounded-sm text-xs font-mono font-medium transition-colors shadow-xs cursor-pointer border`}
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
              <div className={`mx-auto max-w-4xl mb-6 ${s.noticeBg} border rounded p-4 text-xs shadow-xs animate-fade-in no-print flex items-start gap-2.5`}>
                <span className="text-base">ℹ️</span>
                <div className="flex-1">
                  <p className={`font-bold mb-1 font-mono ${s.noticeTitle}`}>Preparing print/PDF layout...</p>
                  <p className="leading-relaxed">
                    A print dialog has been requested. To save as PDF, select <strong className="font-semibold">"Save as PDF"</strong> or <strong className="font-semibold">"Microsoft Print to PDF"</strong> as your printer destination.
                  </p>
                  <p className={`mt-1.5 ${s.noticeText} leading-relaxed`}>
                    <em>If the print dialog does not open, gets blocked, or prints empty due to browser security inside the sandbox frame:</em> please click the <strong className="font-semibold">"Open in New Tab"</strong> button at the top-right corner of the preview area, and then try clicking <strong className="font-semibold">Download PDF</strong> there.
                  </p>
                </div>
                <button 
                  onClick={() => setPrintNotice(false)} 
                  className={`font-mono text-[10px] ${s.noticeBtn} font-bold cursor-pointer`}
                >
                  Dismiss
                </button>
              </div>
            )}


            {/* Scientific Manuscript Sheet */}
            <div className={`${s.manuscriptBg} shadow-[0_6px_36px_rgba(49,46,43,0.05)] border rounded-sm p-8 md:p-14 max-w-4xl mx-auto min-h-[800px] flex flex-col justify-between select-text selection:bg-[#cc5a37]/10 selection:text-current transition-colors duration-200`}>
              
              {/* Document Header */}
              <div>
                <div className={`text-center mb-10 border-b ${s.manuscriptHeaderBorder} pb-8`}>
                  <span className={`text-[10px] tracking-widest font-mono ${s.manuscriptSub} uppercase mb-4 block`}>
                    Preprint Repository • Open Access Commons • CC BY-4.0
                  </span>
                  
                  <h1 className={`text-2xl md:text-3xl font-serif font-bold ${s.manuscriptTitle} tracking-tight leading-tight mb-4 max-w-3xl mx-auto`}>
                    {selectedPaper.title}
                  </h1>
                  
                  <div className={`flex flex-wrap justify-center gap-x-2 gap-y-1 text-sm font-medium ${s.manuscriptAuthors} mb-2 font-serif`}>
                    {selectedPaper.authors.map((author, index) => (
                      <span key={author}>
                        {author}
                        {index < selectedPaper.authors.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                  
                  <div className={`text-xs ${s.manuscriptAffils} italic mb-4 max-w-2xl mx-auto leading-relaxed`}>
                    {selectedPaper.affiliations.join(" • ")}
                  </div>
                  
                  <div className={`flex items-center justify-center gap-x-4 flex-wrap text-[10px] font-mono ${s.manuscriptMetaBg} rounded px-3 py-1.5 w-fit mx-auto transition-colors duration-200`}>
                    <span>Repository Date: {selectedPaper.date}</span>
                    <span className="hidden sm:inline-block opacity-40">|</span>
                    <span>DOI: {selectedPaper.doi}</span>
                    <span className="hidden sm:inline-block opacity-40">|</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 opacity-60" />
                      <span>{getReadingTimeMinutes(getPaperWordCount(selectedPaper))} min read ({getPaperWordCount(selectedPaper).toLocaleString()} words)</span>
                    </span>
                    <span className="hidden sm:inline-block opacity-40">|</span>
                    <span className="font-bold">Public Domain / CC BY-4.0</span>
                  </div>
                </div>

                {/* Abstract Box */}
                <div className={`mb-10 p-5 ${s.manuscriptAbstract} italic text-sm transition-colors duration-200`}>
                  <h2 className={`font-sans font-bold not-italic text-xs tracking-wider uppercase ${s.manuscriptHeaderText} mb-2`}>
                    Abstract
                  </h2>
                  <p className="leading-relaxed text-justify font-serif">
                    {selectedPaper.abstract}
                  </p>
                </div>

                {/* Main Content Sections */}
                <div className={`${layoutColumns === 2 ? "academic-columns" : ""} ${getFontSizeClass()} text-justify leading-relaxed`}>
                  {selectedPaper.sections.map((section, idx) => (
                    <div key={idx} className="mb-8 print-break-inside-avoid">
                      <h2 className={`text-base md:text-lg font-bold font-serif ${s.manuscriptH2} mb-3 border-b pb-1 mt-8`}>
                        {section.title}
                      </h2>
                      <div className={`markdown-body ${s.manuscriptP} whitespace-pre-wrap`}>
                        <Markdown
                          components={{
                            h1: ({children}) => <h3 className={`text-base font-bold font-serif mt-5 mb-2 ${s.manuscriptH3}`}>{children}</h3>,
                            h2: ({children}) => <h4 className={`text-sm font-semibold font-serif mt-4 mb-1.5 ${s.manuscriptH4}`}>{children}</h4>,
                            p: ({children}) => <p className={`mb-4 leading-relaxed text-justify font-serif text-base ${s.manuscriptP}`}>{children}</p>,
                            ul: ({children}) => <ul className={`list-disc pl-5 mb-4 space-y-1 text-sm font-serif ${s.manuscriptList}`}>{children}</ul>,
                            ol: ({children}) => <ol className={`list-decimal pl-5 mb-4 space-y-1 text-sm font-serif ${s.manuscriptList}`}>{children}</ol>,
                            li: ({children}) => <li className="mb-0.5">{children}</li>,
                            code: ({children}) => <code className={`${s.manuscriptCode} px-1 py-0.2 rounded text-[11px] font-mono font-medium`}>{children}</code>,
                            pre: ({children}) => <pre className={`${s.manuscriptPre} p-4 rounded-sm overflow-x-auto my-4 text-[11px] font-mono leading-relaxed`}>{children}</pre>,
                            table: ({children}) => <div className={`overflow-x-auto my-4 border ${s.manuscriptTableBorder} rounded-sm`}><table className={`min-w-full divide-y ${s.manuscriptTableBorder} text-[11px] text-left`}>{children}</table></div>,
                            th: ({children}) => <th className={`${s.manuscriptTh} px-3 py-1.5 font-semibold uppercase tracking-wider border-b font-sans`}>{children}</th>,
                            td: ({children}) => <td className={`px-3 py-1.5 border-b ${s.manuscriptTd} font-mono`}>{children}</td>,
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
              <div className={`mt-12 pt-8 border-t ${s.manuscriptRefsBorder} print-break-inside-avoid`}>
                <h2 className={`text-sm font-bold font-sans ${s.manuscriptRefsTitle} uppercase tracking-wider mb-4`}>
                  References & Literature Cited
                </h2>
                <ol className={`list-decimal pl-5 space-y-2 text-xs font-sans ${s.manuscriptRefsList} leading-relaxed`}>
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
      <footer className={`${s.footerBg} border-t py-4 px-4 text-center text-[10px] no-print transition-colors duration-200`}>
        <p>© 2026 Open Science Initiative for Intelligence. Published globally under Creative Commons Licenses (CC BY 4.0 / CC0). Open access preprint library hosted completely without restrictions, tracking, or login credentials.</p>
      </footer>

    </div>
  );
}
