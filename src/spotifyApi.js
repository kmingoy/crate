// src/spotifyApi.js
// Functions for calling the Spotify Web API

// Fetch a list of recommendation tracks based on seed genres
export async function getRecommendations(token, seedGenres = ["hip-hop", "house"]) {
    const params = new URLSearchParams({
        seed_genres: seedGenres.join(","),
        limit: 10,
    });

    const response = await fetch(
        `https://api.spotify.com/v1/recommendations?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await response.json();
    return data.tracks;
}

// Fetch the current user's profile
export async function getUserProfile(token) {
    const response = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
}

// Get available genre seeds (useful for recommendation options)
export async function getAvailableGenres(token) {
    const response = await fetch(
        "https://api.spotify.com/v1/recommendations/available-genre-seeds",
        { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();
    return data.genres;
}

// Create a new playlist and add tracks to it
export async function exportToPlaylist(token, userId, trackUris, playlistName = "My Crate") {
    // Step 1: Create the playlist
    const createResponse = await fetch(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: playlistName,
                description: "Created with Crate",
                public: false,
            }),
        }
    );
    const playlist = await createResponse.json();

    // Step 2: Add tracks to the playlist
    await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: trackUris }),
    });

    return playlist;
}
