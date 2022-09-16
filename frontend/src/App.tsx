import React from 'react'
import { useEffect } from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import AuditMenus from './components/AuditMenus';
import CreateMenus from './components/CreateMenus';
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
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
