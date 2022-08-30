import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import CreateMenus from './components/CreateMenus';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <div className="App">
      <Sidebar />
      <div className="content">
        <Router>
          <Routes>
            <Route path='/' element={<CreateMenus />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
