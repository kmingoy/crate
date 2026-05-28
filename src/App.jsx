// src/App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getStoredToken, getAccessToken } from "./spotifyAuth";
import LoginScreen from "./components/LoginScreen";
import GameScreen from "./components/GameScreen";
import ResultsScreen from "./components/ResultsScreen";
import "./App.css";

function App() {
    const [token, setToken] = useState(getStoredToken());

    // Handle Spotify OAuth callback — exchange code for token
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
            getAccessToken(code).then((accessToken) => {
                setToken(accessToken);
                // Clean up URL after token exchange
                window.history.replaceState({}, document.title, "/");
            });
        }
    }, []);

    return (
        <Router>
            <Routes>
                {/* If not logged in, show login screen */}
                <Route
                    path="/"
                    element={token ? <Navigate to="/play" /> : <LoginScreen />}
                />

                {/* Callback route after Spotify login */}
                <Route
                    path="/callback"
                    element={token ? <Navigate to="/play" /> : <LoginScreen />}
                />

                {/* Main game screen — requires token */}
                <Route
                    path="/play"
                    element={token ? <GameScreen token={token} /> : <Navigate to="/" />}
                />

                {/* Results screen after session */}
                <Route
                    path="/results"
                    element={token ? <ResultsScreen token={token} /> : <Navigate to="/" />}
                />
            </Routes>
        </Router>
    );
}

export default App;

