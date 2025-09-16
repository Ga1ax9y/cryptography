import Lab1 from "./components/pages/lab1"
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box } from '@mui/material';
import Lab2 from "./components/pages/lab2";
import Navigation from "./components/shared/Navigation";
import Lab4 from "./components/pages/lab4";
import Lab3 from "./components/pages/lab3";
import Lab5 from "./components/pages/lab5";
import Lab6 from "./components/pages/lab6";
import Lab7 from "./components/pages/lab7";
import Lab8 from "./components/pages/lab8";

function App() {
  return (
    <Router>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/lab1" />} />
          <Route path="/lab1" element={<Lab1 />} />
          <Route path="/lab2" element={<Lab2 />} />
          <Route path="/lab3" element={<Lab3 />} />
          <Route path="/lab4" element={<Lab4 />} />
          <Route path="/lab5" element={<Lab5 />} />
          <Route path="/lab6" element={<Lab6 />} />
          <Route path="/lab7" element={<Lab7 />} />
          <Route path="/lab8" element={<Lab8 />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
