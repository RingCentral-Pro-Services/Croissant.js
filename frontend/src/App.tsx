import React from 'react'
import { useEffect } from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import AuditMenus from './components/pages/IVR/AuditMenus';
import CallQueues from './components/pages/Call Queues/CallQueues';
import CreateMenus from './components/pages/IVR/CreateMenus';
import ExtensionAudit from './components/pages/Account Dump/ExtensionAudit';
import ExtensionDeleter from './components/pages/Delete Extensions/ExtensionDeleter';
import NotificationAudit from './components/pages/Notifications/NotificationAudit';
import Sidebar from './components/shared/Sidebar';
import Token from './components/shared/Token';
import EditSites from './components/pages/Edit Sites/EditSites';
import ExtensionEditor from './components/pages/Extension Editor/ExtensionEditor';

function App() {

  useEffect(() => {
    document.title = "Croissant"
  }, [])

  return (
    <Router>
      <div className="App">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path='/token' element={<Token />} />
            <Route path='/' element={<CreateMenus />} />
            <Route path='/auditmenus' element={<AuditMenus />} />
            <Route path='/accountdump' element={<ExtensionAudit />} />
            <Route path='/notificationsaudit' element={<NotificationAudit />} />
            <Route path='/callqueues' element={<CallQueues />} />
            <Route path='/deleteextensions' element={<ExtensionDeleter />} />
            {/* <Route path='/generateprompts' element={<PromptGeneration />} /> */}
            <Route path='/editsites' element={<EditSites />} />
            <Route path='/editextensions' element={<ExtensionEditor />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
