/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CyberProvider, useCyber } from './context/CyberContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { ChatView } from './components/ChatView.tsx';
import { ScannerView } from './components/ScannerView.tsx';
import { DomainIntelView } from './components/DomainIntelView.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { KnowledgeView } from './components/KnowledgeView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { AboutView } from './components/AboutView.tsx';
import { PrintReportModal } from './components/PrintReportModal.tsx';

function MainLayout() {
  const { activeTab } = useCyber();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080B12] text-[#F3F4F6]">
      {/* Collapsible Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 flex overflow-hidden relative">
          {activeTab === 'chat' && <ChatView />}
          {activeTab === 'scanner' && <ScannerView />}
          {activeTab === 'domain' && <DomainIntelView />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'knowledge' && <KnowledgeView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'about' && <AboutView />}
        </main>
      </div>

      {/* Audit Report Printable Modal */}
      <PrintReportModal />
    </div>
  );
}

export default function App() {
  return (
    <CyberProvider>
      <MainLayout />
    </CyberProvider>
  );
}
