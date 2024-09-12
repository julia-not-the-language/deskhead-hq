// Fetch artist's albums
async function fetchArtistAlbums(access_token, getAlbumsUrl, artistId) {
    console.log("Here2")
    const response = await fetch(getAlbumsUrl, {
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    });
    const data = await response.json();
    console.log(data.items)
    return data.items; // Returns the albums
}

// Fetch tracks from an album
async function fetchAlbumTracks(albumId, token) {
    const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    return data.items; // Returns the tracks
}

// Add tracks to the user's library
async function addTracksToLibrary(trackIds, token, addTracksUrl) {
    await fetch(addTracksUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ids: trackIds
        })
    });
}

// Main function to get all tracks by an artist and add them to the user's library
async function addArtistTracksToLiked(token) {
    const albums = await fetchArtistAlbums(token);
    for (const album of albums) {
        const tracks = await fetchAlbumTracks(album.id, token);
        const trackIds = tracks.map(track => track.id);
        
        // Spotify API limits you to 50 track IDs per request
        const chunks = chunkArray(trackIds, 50); 
        for (const chunk of chunks) {
            await addTracksToLibrary(chunk, token);
        }
    }
}

// Helper function to chunk track IDs into groups of 50
function chunkArray(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

export async function addAllFrontDeskSongsToLikedSongs(token) {
    const artistId = '3M1QZQHNn0op1eWBeEHQ7Z'; // Replace with the artist's Spotify ID
    const getAlbumsUrl = `https://api.spotify.com/v1/artists/${artistId}/albums`;
    const addTracksUrl = `https://api.spotify.com/v1/me/tracks`;
    

    const albums = await fetchArtistAlbums(token, getAlbumsUrl, artistId);
    for (const album of albums) {
        const tracks = await fetchAlbumTracks(album.id, token);
        console.log(tracks)
        const trackIds = tracks.map(track => track.id);
        
        // Spotify API limits you to 50 track IDs per request
        const chunks = chunkArray(trackIds, 50); 
        for (const chunk of chunks) {
            await addTracksToLibrary(chunk, token, addTracksUrl);
        }
    }

    // try {
    //     // Request the top 0 to 50 artists
    //     const response1 = await fetch('https://api.spotify.com/v1/me/playlists?limit=5&offset=0', {
    //         headers: {
    //             'Authorization': `Bearer ${accessToken}`
    //         }
    //     });

    //     if (!response1.ok) {
    //         throw new Error('Network response was not ok');
    //     }

    //     const data = await response1.json();

    //     displayResults(data.items)
    // } catch (error) {
    //     console.error('Error fetching Spotify data:', error);
    //     document.getElementById('results').innerText = 'Failed to load data.';
    // }

}

export async function fetchSpotifyData(accessToken) {
    try {
        // Request the top 0 to 50 artists
        const response1 = await fetch('https://api.spotify.com/v1/me/playlists?limit=5&offset=0', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response1.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response1.json();

        displayResults(data.items)
    } catch (error) {
        console.error('Error fetching Spotify data:', error);
        document.getElementById('results').innerText = 'Failed to load data.';
    }
}

// Function to display the playlists
function displayResults(playlists) {
    const container = document.getElementById('playlists-container');
    container.innerHTML = ''; // Clear the container

    playlists.forEach(playlist => {
        // Create a playlist element
        const playlistElement = document.createElement('div');
        playlistElement.className = 'playlist';

        // Display playlist name
        const playlistName = document.createElement('h3');
        playlistName.textContent = playlist.name;
        playlistElement.appendChild(playlistName);

        // Display playlist image
        if (playlist.images.length > 0) {
            const playlistImage = document.createElement('img');
            playlistImage.src = playlist.images[0].url;
            playlistElement.appendChild(playlistImage);
        }

        // Display total number of tracks
        const trackCount = document.createElement('p');
        trackCount.textContent = `Total tracks: ${playlist.tracks.total}`;
        playlistElement.appendChild(trackCount);

        // Append the playlist element to the container
        container.appendChild(playlistElement);
    });
}


// On page load, retrieve the access token and fetch data
document.addEventListener('DOMContentLoaded', () => {
    const accessToken = sessionStorage.getItem('spotifyAccessToken');
    
    if (accessToken) {
        console.log("here")
        addAllFrontDeskSongsToLikedSongs(accessToken);
    } else {
        document.getElementById('results').innerText = 'No access token found. Please log in again.';
    }
});
