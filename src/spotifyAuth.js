// src/spotifyAuth.js
// Handles Spotify OAuth 2.0 PKCE flow (no backend needed)

import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, SPOTIFY_SCOPES } from "./spotifyConfig";

// Generate a random string for the code verifier
function generateRandomString(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Hash the code verifier using SHA-256
async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

// Redirect user to Spotify login page
export async function redirectToSpotifyLogin() {
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store code verifier in localStorage to use after redirect
    localStorage.setItem("code_verifier", codeVerifier);

    const params = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        response_type: "code",
        redirect_uri: SPOTIFY_REDIRECT_URI,
        scope: SPOTIFY_SCOPES,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Exchange authorization code for access token
export async function getAccessToken(code) {
    const codeVerifier = localStorage.getItem("code_verifier");

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: SPOTIFY_REDIRECT_URI,
            client_id: SPOTIFY_CLIENT_ID,
            code_verifier: codeVerifier,
        }),
    });

    const data = await response.json();

    // Store token and expiry in localStorage
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("token_expiry", Date.now() + data.expires_in * 1000);

    return data.access_token;
}

// Get stored access token (returns null if expired or missing)
export function getStoredToken() {
    const token = localStorage.getItem("access_token");
    const expiry = localStorage.getItem("token_expiry");
    if (!token || Date.now() > expiry) return null;
    return token;
}

// Log out by clearing localStorage
export function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_expiry");
    localStorage.removeItem("code_verifier");
}
