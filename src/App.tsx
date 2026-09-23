/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { ConfirmModal } from './components/common/ConfirmModal';
import { CommandPalette } from './components/common/CommandPalette';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { ProjectModal } from './components/projects/ProjectModal';
import { TaskModal } from './components/tasks/TaskModal';
import { TaskDetailSheet } from './components/tasks/TaskDetailSheet';
import { InfiniteCanvasModal } from './components/canvas/InfiniteCanvasModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProjectDetailView } from './components/projects/ProjectDetailView';
import { AllBoardsView } from './components/boards/AllBoardsView';
import { WeeklyReviewView } from './components/review/WeeklyReviewView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { FilesView } from './components/files/FilesView';
import { SettingsModal } from './components/settings/SettingsModal';
import { WelcomeSplash } from './components/common/WelcomeSplash';

const AppContent: React.FC = () => {
  const { 
    currentView, 
    user, 
    activeBoard, 
    closeBoardModal, 
    isDarkMode 
  } = useApp();

  const [showSplash, setShowSplash] = useState(true);

  return (
    <div 
      id="build-diary-root" 
      className={`min-h-screen flex flex-col antialiased transition-colors ${
        isDarkMode 
          ? 'bg-[#09090b] text-neutral-100 selection:bg-amber-500 selection:text-neutral-950' 
          : 'bg-[#fbfbfa] text-neutral-900 selection:bg-amber-400 selection:text-neutral-950'
      }`}
    >
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Application Canvas */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Top Header */}
          <Header />

          {/* Dynamic Content View Area */}
          <main 
            id="main-view-container"
            className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
          >
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'project-detail' && <ProjectDetailView />}
            {currentView === 'all-boards' && <AllBoardsView />}
            {currentView === 'weekly-review' && <WeeklyReviewView />}
            {currentView === 'analytics' && <AnalyticsView />}
            {currentView === 'files' && <FilesView />}
            {currentView === 'settings' && <SettingsModal />}
          </main>
        </div>
      </div>

      {/* Global Modals & Slide-out Overlays */}
      {showSplash && <WelcomeSplash onFinish={() => setShowSplash(false)} />}
      {!showSplash && <OnboardingModal />}
      <ProjectModal />
      <TaskModal />
      <TaskDetailSheet />
      <CommandPalette />
      <ConfirmModal />
      <ToastContainer />

      {/* Full-Screen Infinite Canvas / User Flow Editor */}
      {activeBoard && (
        <InfiniteCanvasModal 
          board={activeBoard} 
          onClose={closeBoardModal} 
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
