const clientId = "97a5a8c13260417f949b071612f7adb0";
const redirect_uri = "http://localhost:6465/callback"
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

export async function loginToSpotify() {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    sessionStorage.setItem('codeVerifier', verifier);

    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirect_uri);
    params.append("scope", "playlist-modify-public playlist-modify-private user-top-read playlist-read-private");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    window.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export async function getAccessToken(clientId, code) {
    console.log("Here")
    const verifier = localStorage.getItem("verifier");

    params.append("grant_type", "authorization_code");
    params.append("code", code);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    console.log(access_token)
    return access_token;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// On the callback page
export async function handleSpotifyCallback() {
    const authorizationCode = params.get('code');
    if (!authorizationCode) {
        alert('Authorization failed');
        return;
    }

    const verifier = sessionStorage.getItem('codeVerifier');

    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirect_uri);
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    console.log(access_token)
    if (access_token) {
            sessionStorage.setItem('spotifyAccessToken', access_token);
            window.location.href = '/results.html';
    } else {
        alert('Token exchange failed');
    }
}

// Function to fetch Spotify data
export async function fetchSpotifyData(accessToken) {
    try {
        const response = await fetch('https://api.spotify.com/v1/me/top/tracks', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error('Error fetching Spotify data:', error);
        document.getElementById('results').innerText = 'Failed to load data.';
    }
}