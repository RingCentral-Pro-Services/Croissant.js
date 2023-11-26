import React, { Suspense, useState } from 'react'
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
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Home from './components/pages/Home/components/Home';
import ParkLocations from './components/pages/Park Locations/ParkLocations';
import GeneratePrompts from './components/pages/Prompt Generation/GeneratePrompts';
import { ErrorBoundary } from 'react-error-boundary';
import FatalError from './components/shared/FatalError';
import UserGroups from './components/pages/User Groups/UserGroups';
import PushToTalk from './components/pages/Push To Talk/PushToTalk';
import MigrateSites from './components/pages/Migration/Sites/MigrateSites';
import MigrateQueues from './components/pages/Migration/Queues/MigrateQueues';
import UserDataDownload from './components/pages/Migration/User Data Download/UserDataDownload';
// import MigrateUsers from './components/pages/Migration/Users/MigrateUsers';
import { MantineProvider } from '@mantine/core';
import { UserDetailsProvider } from './providers/UserDetailsProvider';
import { atom, useAtom } from 'jotai'
import BizToken from './components/shared/BizToken';
import AccountTemplates from './components/pages/Bulk Account Templates/AccountTemplates';
import AutoAudit from './components/pages/Migration/Audit/AutoAudit';
import UploadDevices from './components/pages/Device Upload/UploadDevices';
import ManageCustomFields from './components/pages/Custom Fields/ManageCustomFields';
import { AssignCustomFields } from './components/pages/Custom Fields/AssignCustomFields';
import { CustomFields } from './components/pages/Custom Fields/CustomFields';
import { ConvertCallQueues } from './components/pages/Conversion/Call Queue - Ring Group/ConvertCallQueues';
import { ConvertUsers } from './components/pages/Conversion/User - Limited Extension/ConvertUsers';
import { AccessDenied } from './components/pages/Access Denied/AccessDenied';
import { ManagementConsole } from './components/pages/Management Console/ManagementConsole';

const AuditMenus = React.lazy(() => import('./components/pages/IVR/AuditMenus'));
const CallQueues = React.lazy(() => import('./components/pages/Call Queues/CallQueues'));
const Presence = React.lazy(() => import('./components/pages/Presence/Presence'));
const Testbed = React.lazy(() => import('./components/pages/Testbed/Testbed'));
const CustomRulesBuilder = React.lazy(() => import('./components/pages/Custom Rules/CustomRulesBuilder'));
const CustomRulesExport = React.lazy(() => import('./components/pages/Custom Rules/CustomRulesExport'))
const MigrateUsers = React.lazy(() => import('./components/pages/Migration/Users/MigrateUsers'))

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

export const userAtom = atom({
  name: '',
  email: ''
})

function App() {
  const[theme, setTheme] = useState<string>('light')
  const [user, setUser] = useAtom(userAtom)

  useEffect(() => {
    document.title = "Croissant"
    // const storedTheme = localStorage.getItem('theme')
    const storedUser = localStorage.getItem('currentUser')
    // if (storedTheme) {
    //   setcolorTheme(storedTheme)
    // }
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUser({
        name: user.name,
        email: user.email
      })
    }
  }, [])

  const setcolorTheme =(theme: string) => {
    setTheme(theme)
    localStorage.setItem('theme', theme)
    document.querySelector('body')?.setAttribute('data-theme', theme)
  }

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <UserDetailsProvider>
    <ThemeProvider theme={theme === 'light'? lightTheme : darkTheme}>
       <Router>
      <div className="App">
        <Sidebar setColorTheme={setcolorTheme} />
        <div className="content">
          <ErrorBoundary fallback={<FatalError />}>
            <Suspense fallback={<Loading/>}>
              <Routes>
                <Route path='/access-denied' element={<AccessDenied />} />
                <Route path='/management-console' element={<ManagementConsole />} />
                <Route path='/token' element={<Token />} />
                <Route path='/biztoken' element={<BizToken />} />
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
                <Route path='/presence' element={<Presence />} />
                <Route path='/testbed' element={<Testbed />} />
                <Route path='/customrules' element={<CustomRulesBuilder />} />
                <Route path='/home' element={<Home />} />
                <Route path='/parklocations' element={<ParkLocations />} />
                <Route path='/prompts' element={<GeneratePrompts />} />
                <Route path='/usergroups' element={<UserGroups />} />
                <Route path='/pushtotalk' element={<PushToTalk />} />
                <Route path='/exportrules' element={<CustomRulesExport />} />
                <Route path='/migratesites' element={<MigrateSites />} />
                <Route path='/migratequeues' element={<MigrateQueues />} />
                <Route path='/userexport' element={<UserDataDownload />} />
                <Route path='/migrateusers' element={<MigrateUsers />} />
                <Route path='/accounttemplates' element={<AccountTemplates />} />
                <Route path='/error' element={<FatalError />} />
                <Route path='/autoaudit' element={<AutoAudit />} />
                <Route path='/uploaddevices' element={<UploadDevices />} />
                <Route path='/customfields' element={<CustomFields />} />
                <Route path='/convert-call-queues' element={<ConvertCallQueues />} />
                <Route path='/convert-users' element={<ConvertUsers />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </Router>
    </ThemeProvider>
    </UserDetailsProvider>
    </MantineProvider>
  );
}

export default App;
