import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="conversations/:id" element={<Home />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
