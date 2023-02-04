import React, { Suspense } from 'react'
import { useEffect } from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import CreateMenus from './components/pages/IVR/CreateMenus';
import ExtensionAudit from './components/pages/Account Dump/ExtensionAudit';
import ExtensionDeleter from './components/pages/Delete Extensions/ExtensionDeleter';
import NotificationAudit from './components/pages/Notifications/NotificationAudit';
import Sidebar from './components/shared/Sidebar';
import Token from './components/shared/Token';
import EditSites from './components/pages/Edit Sites/EditSites';
import ExtensionEditor from './components/pages/Extension Editor/ExtensionEditor';
import CallQueueTemplates from './components/pages/Call Queues/CallQueueTemplates';
import CreateCallQueues from './components/pages/Call Queues/CreateCallQueues';
import Deskphones from './components/pages/Deskphones/Deskphones';
import CustomRules from './components/pages/Custom Rules/CustomRules';
import ManipulateCustomRules from './components/pages/Custom Rules/ManipulateCustomRules';
import Loading from './components/shared/Loading';
import Intercom from './components/pages/Intercom/Intercom';
import ExtensionUpload from './components/pages/Extension Upload/ExtensionUpload';
import CallMonitoring from './components/pages/Call Monitoring/CallMonitoring';
import PagingGroups from './components/pages/Paging Groups/PagingGroups';
import Sites from './components/pages/Sites/Sites';
import BulkAssign from './components/pages/Phone Numbers/Bulk Assign/BulkAssign';
import LocationUpdates from './components/pages/Automatic Location Updates/LocationUpdates';

const AuditMenus = React.lazy(() => import('./components/pages/IVR/AuditMenus'));
const CallQueues = React.lazy(() => import('./components/pages/Call Queues/CallQueues'));

function App() {

  useEffect(() => {
    document.title = "Croissant"
  }, [])

  return (
    <Router>
      <div className="App">
        <Sidebar />
        <div className="content">
          <Suspense fallback={<Loading/>}>
            <Routes>
              <Route path='/token' element={<Token />} />
              <Route path='/' element={<CreateMenus />} />
              <Route path='/auditmenus' element={<AuditMenus />} />
              <Route path='/accountdump' element={<ExtensionAudit />} />
              <Route path='/notificationsaudit' element={<NotificationAudit />} />
              <Route path='/callqueues' element={<CallQueues />} />
              <Route path='/auditcallqueues' element={<CallQueues />} />
              <Route path='/createcallqueues' element={<CreateCallQueues />} />
              <Route path='/callqueuetemplates' element={<CallQueueTemplates />} />
              <Route path='/deleteextensions' element={<ExtensionDeleter />} />
              {/* <Route path='/generateprompts' element={<PromptGeneration />} /> */}
              <Route path='/editsites' element={<EditSites />} />
              <Route path='/editextensions' element={<ExtensionEditor />} />
              <Route path='/deskphones' element={<Deskphones />} />
              <Route path='/copycustomrules' element={<CustomRules />} />
              <Route path='/customruleedit' element={<ManipulateCustomRules />} />
              <Route path='/intercom' element={<Intercom />} />
              <Route path='/extensionupload' element={<ExtensionUpload />} />
              <Route path='/callmonitoring' element={<CallMonitoring />} />
              <Route path='/paginggroups' element={<PagingGroups />} />
              <Route path='/sites' element={<Sites />} />
              <Route path='/bulkassign' element={<BulkAssign />} />
              <Route path='/locationupdates' element={<LocationUpdates />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Router>
  );
}

export default App;
