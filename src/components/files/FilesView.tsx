import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttachmentItem } from '../../types';
import { 
  FileText, ExternalLink, Github, Figma, 
  Plus, Trash2, Link as LinkIcon, Upload, Check 
} from 'lucide-react';

interface FilesViewProps {
  projectId?: string;
}

export const FilesView: React.FC<FilesViewProps> = ({ projectId }) => {
  const { 
    attachments, 
    projectAttachments, 
    addAttachment, 
    deleteAttachment, 
    projects 
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<AttachmentItem['type']>('link');
  const [targetProjId, setTargetProjId] = useState(projectId || projects[0]?.id || 'general');

  const items = projectId ? projectAttachments : attachments;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || !targetProjId) return;

    addAttachment(targetProjId, name.trim(), type, url.trim(), 'External');
    setName('');
    setUrl('');
    setModalOpen(false);
  };

  const getIcon = (t: AttachmentItem['type']) => {
    switch (t) {
      case 'github':
        return <Github className="w-5 h-5 text-purple-400" />;
      case 'figma':
        return <Figma className="w-5 h-5 text-rose-400" />;
      case 'file':
        return <FileText className="w-5 h-5 text-blue-400" />;
      default:
        return <LinkIcon className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div id="files-repository-view" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Project Files & Integrations
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Centralized visual grid for Figma boards, GitHub repositories, specs, and external resources.
          </p>
        </div>

        <button
          id="add-file-link-btn"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold border border-neutral-700/60 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-400" />
          <span>Add Link / Asset</span>
        </button>
      </div>

      {/* Grid of Files */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-dashed border-neutral-800 rounded-3xl text-xs text-neutral-500">
            No attached assets yet. Click "+ Add Link / Asset" to link GitHub, Figma, or design specs.
          </div>
        ) : (
          items.map((item) => {
            const project = projects.find((p) => p.id === item.projectId);
            return (
              <div
                key={item.id}
                id={`attachment-card-${item.id}`}
                className="group p-4 bg-neutral-950/70 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl transition-all shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                      {getIcon(item.type)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        {item.name}
                      </h4>
                      <span className="text-[11px] text-neutral-500 font-mono capitalize">
                        {item.type} {item.size ? `• ${item.size}` : ''}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteAttachment(item.id)}
                    className="p-1 text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-neutral-800 transition-colors"
                    title="Remove asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-4 border-t border-neutral-800/60 mt-4 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500 font-medium truncate max-w-[140px]">
                    {project?.name || 'Project'}
                  </span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div 
          id="add-attachment-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white">Add Asset or Integration Link</h3>
            <p className="text-xs text-neutral-400">
              Attach repositories, Figma files, cloud drives, or API documentation.
            </p>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Design Tokens in Figma, Client GitHub Repo"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AttachmentItem['type'])}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="github">GitHub</option>
                    <option value="figma">Figma</option>
                    <option value="file">File / Spec</option>
                    <option value="link">External Link</option>
                  </select>
                </div>

                {!projectId && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">Project</label>
                    <select
                      value={targetProjId}
                      onChange={(e) => setTargetProjId(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                    >
                      {projects.length === 0 && (
                        <option value="general">General Resources</option>
                      )}
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">URL / Link *</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
