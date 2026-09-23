import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TimelineEntry, TimelineTag, TimelineEntryType } from '../../types';
import { 
  Pin, Search, Send, PenTool, Sparkles, 
  Trash2, AlertTriangle, Lightbulb, CheckCircle2, 
  Layers, ExternalLink, HelpCircle 
} from 'lucide-react';

interface WorkspaceTimelineProps {
  projectId: string;
}

export const WorkspaceTimeline: React.FC<WorkspaceTimelineProps> = ({ projectId }) => {
  const { 
    projectTimeline, 
    createTimelineEntry, 
    deleteTimelineEntry, 
    togglePinTimelineEntry,
    createBoard,
    openBoardModal,
    addToast
  } = useApp();

  const [content, setContent] = useState('');
  const [tag, setTag] = useState<TimelineTag>('Progress');
  const [type, setType] = useState<TimelineEntryType>('log');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('All');
  const [showSlashHelp, setShowSlashHelp] = useState(false);

  const tags: TimelineTag[] = ['Progress', 'Blocker', 'Idea', 'Decision'];

  // Handle slash commands (/progress, /blocker, /idea, /decision)
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    if (val.startsWith('/progress')) {
      setTag('Progress');
      setContent(val.replace('/progress', '').trimStart());
    } else if (val.startsWith('/blocker')) {
      setTag('Blocker');
      setContent(val.replace('/blocker', '').trimStart());
    } else if (val.startsWith('/idea')) {
      setTag('Idea');
      setContent(val.replace('/idea', '').trimStart());
    } else if (val.startsWith('/decision')) {
      setTag('Decision');
      setContent(val.replace('/decision', '').trimStart());
    }
  };

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // First line or short preview as title
    const lines = content.trim().split('\n');
    const title = lines[0].substring(0, 60);

    createTimelineEntry({
      projectId,
      title,
      content: content.trim(),
      type,
      tag,
      pinned: false,
    });

    setContent('');
  };

  // Quick launch drawing canvas linked to timeline
  const handleDrawNote = () => {
    const newBoard = createBoard(projectId, `Drawing Log: ${new Date().toLocaleDateString()}`);
    createTimelineEntry({
      projectId,
      title: `Drawing Note: Flow Diagram`,
      content: `Visual canvas note created for architecture & user flow planning.`,
      type: 'drawing',
      tag: 'Decision',
      pinned: false,
      boardId: newBoard.id,
    });
    openBoardModal(newBoard);
  };

  const filteredTimeline = projectTimeline.filter((entry) => {
    const matchesSearch = 
      searchQuery.trim() === '' ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTagFilter === 'All' || entry.tag === selectedTagFilter;

    return matchesSearch && matchesTag;
  });

  const getTagBadge = (t: TimelineTag) => {
    switch (t) {
      case 'Progress':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">● Progress</span>;
      case 'Blocker':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">▲ Blocker</span>;
      case 'Idea':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">★ Idea</span>;
      case 'Decision':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">◆ Decision</span>;
    }
  };

  return (
    <div id="project-timeline-view" className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Left 2 Cols: Timeline History */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search & Tag Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-2xl">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-neutral-500" />
            <input
              id="timeline-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, decisions, blockers..."
              className="w-full bg-transparent text-xs text-white placeholder:text-neutral-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {['All', ...tags].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTagFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedTagFilter === t
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Vertical Timeline */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-neutral-800">
          {filteredTimeline.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-neutral-800 rounded-2xl text-xs text-neutral-500">
              No notes found. Post your first progress update or drawing note on the right!
            </div>
          ) : (
            filteredTimeline.map((entry) => (
              <div 
                key={entry.id}
                id={`timeline-entry-${entry.id}`}
                className="relative group animate-in fade-in duration-150"
              >
                {/* Timeline node dot */}
                <div className={`absolute -left-[27px] top-3 w-3 h-3 rounded-full border-2 border-neutral-950 ${
                  entry.tag === 'Progress' ? 'bg-emerald-400' :
                  entry.tag === 'Blocker' ? 'bg-rose-400' :
                  entry.tag === 'Idea' ? 'bg-amber-400' : 'bg-indigo-400'
                }`} />

                {/* Entry Card */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  entry.pinned 
                    ? 'bg-neutral-900/90 border-amber-500/40 shadow-md shadow-amber-500/5' 
                    : 'bg-neutral-950/70 border-neutral-800/80 hover:border-neutral-700'
                }`}>
                  <div className="flex items-start justify-between gap-3 pb-2 border-b border-neutral-800/60">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTagBadge(entry.tag)}
                      <span className="text-[11px] font-mono text-neutral-400">
                        {new Date(entry.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {entry.type === 'drawing' && (
                        <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 text-[10px] font-mono">
                          🎨 Drawing
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => togglePinTimelineEntry(entry.id)}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          entry.pinned ? 'text-amber-400 bg-amber-500/10' : 'text-neutral-500 hover:text-white hover:bg-neutral-800'
                        }`}
                        title={entry.pinned ? 'Unpin note' : 'Pin note to top'}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteTimelineEntry(entry.id)}
                        className="p-1 text-neutral-500 hover:text-rose-400 rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Note Body */}
                  <div className="pt-2 text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </div>

                  {/* Drawing Note Visual Thumbnail Preview */}
                  {entry.type === 'drawing' && entry.boardId && (
                    <div className="mt-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-neutral-300">
                        <Layers className="w-4 h-4 text-teal-400" />
                        <span>Interactive Board Attached</span>
                      </div>
                      <button
                        onClick={() => {
                          // Look up board
                          const targetBoard = {
                            id: entry.boardId!,
                            projectId,
                            name: entry.title,
                            elements: [],
                            connections: [],
                            updatedAt: new Date().toISOString(),
                          };
                          openBoardModal(targetBoard);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-neutral-950 font-semibold text-[11px] rounded-lg hover:bg-amber-400 transition-colors"
                      >
                        <span>Open Canvas</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Sticky Quick Post Box (Requested in Flow 4) */}
      <div className="lg:sticky lg:top-20 space-y-4">
        <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Log Quick Builder Update</span>
            </h4>
            <button
              onClick={() => setShowSlashHelp(!showSlashHelp)}
              className="text-neutral-500 hover:text-neutral-300 text-[11px] flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Commands</span>
            </button>
          </div>

          {showSlashHelp && (
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
              <div>Type <kbd className="text-amber-300 font-mono">/progress</kbd> to tag as Progress</div>
              <div>Type <kbd className="text-rose-300 font-mono">/blocker</kbd> to tag as Blocker</div>
              <div>Type <kbd className="text-amber-300 font-mono">/idea</kbd> to tag as Idea</div>
              <div>Type <kbd className="text-indigo-300 font-mono">/decision</kbd> to tag as Decision</div>
            </div>
          )}

          <form onSubmit={handlePost} className="space-y-3">
            <textarea
              id="timeline-post-input"
              rows={4}
              required
              value={content}
              onChange={handleContentChange}
              placeholder="What did you just build, fix, or decide? e.g. Fixed auth bug, designed v1 user flows..."
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
            />

            {/* Tag Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5">Update Tag</label>
              <div className="grid grid-cols-2 gap-1.5">
                {tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag(t)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      tag === t
                        ? t === 'Progress'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                          : t === 'Blocker'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                          : t === 'Idea'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
              {/* Draw Diagram Icon Button (Flow 4) */}
              <button
                id="timeline-draw-diagram-btn"
                type="button"
                onClick={handleDrawNote}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-teal-400 border border-neutral-800 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                title="Create a new visual drawing note"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Draw Diagram</span>
              </button>

              <button
                id="timeline-post-btn"
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>Post</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
