import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Layout from "./components/Layout.jsx";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" />}
      />

      {/* Rutas Protegidas */}
      {user ? (
        <>
          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/movies"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/series"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/music"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/animes"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}

      <Route
        path="/"
        element={<Navigate to={user ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
}

export default App;
