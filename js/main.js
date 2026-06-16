// Function to parse JWT token from Google Auth
function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Global callback for Google Sign-In
window.handleCredentialResponse = (response) => {
    const responsePayload = parseJwt(response.credential);
    console.log("ID: " + responsePayload.sub);
    console.log('Full Name: ' + responsePayload.name);
    console.log("Email: " + responsePayload.email);

    // Update UI
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('user-profile').style.display = 'flex';
    document.getElementById('user-avatar').src = responsePayload.picture;
    document.getElementById('user-name').textContent = responsePayload.name;
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('BulkThreads application initialized.');

    // Sign out functionality
    const signOutBtn = document.getElementById('sign-out-btn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            document.getElementById('user-profile').style.display = 'none';
            document.getElementById('auth-container').style.display = 'block';
            console.log('User signed out.');
        });
    }
    
    // Example data for campaigns
    const campaigns = [
        {
            id: 1,
            title: "Premium Heavyweight Hoodies",
            price: "$25.00",
            target: 100,
            current: 65,
            image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=500&q=80"
        },
        {
            id: 2,
            title: "Organic Cotton T-Shirts",
            price: "$10.00",
            target: 500,
            current: 420,
            image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80"
        },
        {
            id: 3,
            title: "Denim Jackets Batch",
            price: "$45.00",
            target: 50,
            current: 12,
            image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=500&q=80"
        }
    ];

    const campaignGrid = document.querySelector('.campaign-grid');

    if (campaignGrid) {
        campaigns.forEach(campaign => {
            const progressPercentage = (campaign.current / campaign.target) * 100;
            
            const card = document.createElement('div');
            card.className = 'campaign-card';
            // Setting up inline styles directly via JS for the dynamic card component
            // We can move this to CSS later if preferred
            card.style.backgroundColor = 'var(--surface-color)';
            card.style.borderRadius = '16px';
            card.style.overflow = 'hidden';
            card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
            card.style.cursor = 'pointer';
            
            card.onmouseover = () => {
                card.style.transform = 'translateY(-10px)';
                card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.5)';
            };
            card.onmouseout = () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = 'none';
            };

            card.innerHTML = `
                <div style="height: 200px; overflow: hidden;">
                    <img src="${campaign.image}" alt="${campaign.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                </div>
                <div style="padding: 20px;">
                    <h3 style="margin-bottom: 10px; font-size: 1.25rem;">${campaign.title}</h3>
                    <p style="color: var(--accent-color); font-weight: 600; font-size: 1.5rem; margin-bottom: 20px;">${campaign.price} <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 400;">/ piece</span></p>
                    
                    <div style="margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 5px;">
                            <span>${campaign.current} ordered</span>
                            <span>Goal: ${campaign.target}</span>
                        </div>
                        <div style="width: 100%; height: 8px; background-color: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                            <div style="width: ${progressPercentage}%; height: 100%; background-color: var(--primary-color); border-radius: 4px; transition: width 1s ease-in-out;"></div>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width: 100%; margin-top: 15px;">Join Group Buy</button>
                </div>
            `;
            campaignGrid.appendChild(card);
        });
    }
});
