import React from 'react'
import { useEffect } from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import AuditMenus from './components/AuditMenus';
import CallQueues from './components/CallQueues';
import CreateMenus from './components/CreateMenus';
import ExtensionAudit from './components/ExtensionAudit';
import ExtensionDeleter from './components/ExtensionDeleter';
import NotificationAudit from './components/NotificationAudit';
import Sidebar from './components/Sidebar';
import Token from './components/Token';

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
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
