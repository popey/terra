const PROCESSED_FEEDS_FILE = './feed-data.json';
const container = document.getElementById('feed-container');
const BATCH_SIZE = 12; // # of cards to render

let allFeeds = [];
let currentIndex = 0;
let showMoreButtonWrapper = null; 

function renderBatch() {
    const endIndex = Math.min(currentIndex + BATCH_SIZE, allFeeds.length);
    const batch = allFeeds.slice(currentIndex, endIndex);

    batch.forEach(item => {
        const columnWrapper = document.createElement('div');
        columnWrapper.className = 'col-4 u-spacing'; 

        const feedCard = document.createElement('div');
        feedCard.className = 'p-card'; 
        
        const formattedDate = new Date(item.date).toLocaleDateString();
        const hasSnippet = item.snippet && item.snippet.length > 0;
        
        feedCard.innerHTML = `
            <div class="p-card__content">
                <p class="p-heading--6">${item.sourceName}</p>
                <hr class="u-sv-1" />
                <h3 class="p-heading--4">
                    <a href="${item.link}" target="_blank" rel="noopener noreferrer">
                        ${item.title}
                    </a>
                </h3>
                <p class="u-small-text">
                    Published: <strong>${formattedDate}</strong>
                </p>
                
                ${hasSnippet ? `
                    <p class="u-text--muted u-small-text u-sv-1">${item.snippet}</p>
                ` : ''}
            </div>
        `;
        
        columnWrapper.appendChild(feedCard);
        container.appendChild(columnWrapper);
    });

    currentIndex = endIndex;
    checkLoadMoreStatus();
}

function createLoadMoreButtonWrapper() {
    const buttonWrapper = document.createElement('div');
    buttonWrapper.id = 'load-more-wrapper';
    buttonWrapper.className = 'col-12 u-align-text--center u-sv-4';
    
    const button = document.createElement('button');
    button.className = 'p-button--base is-prominent';
    button.textContent = 'Load More Feeds';
    button.addEventListener('click', renderBatch);
    
    buttonWrapper.appendChild(button);
    return buttonWrapper;
}

function checkLoadMoreStatus() {
    if (showMoreButtonWrapper) {
        showMoreButtonWrapper.remove(); 
    }
    
    if (currentIndex < allFeeds.length) {
        showMoreButtonWrapper = createLoadMoreButtonWrapper();
        container.appendChild(showMoreButtonWrapper);
    } else {
        const allDone = document.createElement('div');
        allDone.className = 'col-12 u-align-text--center u-sv-4';
        allDone.innerHTML = '<p class="u-text--muted">End of all feeds.</p>';
        container.appendChild(allDone);
    }
}

async function initAggregator() {
    try {
        const response = await fetch(PROCESSED_FEEDS_FILE);
        allFeeds = await response.json(); 
        
        document.getElementById('loading-message')?.remove(); 

        if (allFeeds.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="p-notification--information">No feeds found.</p></div>';
            return;
        }
        renderBatch(); 
        
    } catch (error) {
        console.error("Failed to load processed feed data.", error);
        container.innerHTML = '<div class="col-12"><p class="p-notification--negative">Could not load the latest content. Please check back later.</p></div>';
    }
}

initAggregator();
