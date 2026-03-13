import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ToolsHub from './pages/ToolsHub';
import ReportGen from './tools/reportgen/ReportGen';
import Incentives from './tools/incentives/Incentives';
import ResumeGen from './tools/resume/ResumeGen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ToolsHub />} />
        <Route path="/reportgen" element={<ReportGen />} />
        <Route path="/incentives" element={<Incentives />} />
        <Route path="/resume" element={<ResumeGen />} />
      </Routes>
    </BrowserRouter>
  );
}
