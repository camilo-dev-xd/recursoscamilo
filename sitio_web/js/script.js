document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('resources-grid');
    const filtersContainer = document.getElementById('filters-container');
    const searchInput = document.getElementById('search-input');
    const noResults = document.getElementById('no-results');

    let allResources = [];
    let activeFilter = 'all';
    let searchQuery = '';

    // Fetch data
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            allResources = data;
            initializeUI();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            gridContainer.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 2rem;">Error cargando los recursos. Es posible que debas abrir esto con un servidor local (Live Server).</p>';
        });

    function initializeUI() {
        extractAndRenderCategories();
        renderResources(allResources);
        setupEventListeners();
    }

    function extractAndRenderCategories() {
        const categoriesSet = new Set();
        
        allResources.forEach(resource => {
            if (resource.categories && resource.categories.length > 0) {
                resource.categories.forEach(cat => {
                    if (cat && cat.trim() !== '') {
                        categoriesSet.add(cat.trim().toLowerCase());
                    }
                });
            }
        });

        const sortedCategories = Array.from(categoriesSet).sort();

        sortedCategories.forEach(category => {
            // Capitalize for display
            const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.dataset.filter = category;
            btn.textContent = displayCategory;
            filtersContainer.appendChild(btn);
        });
    }

    function renderResources(resources) {
        gridContainer.innerHTML = '';
        
        if (resources.length === 0) {
            noResults.classList.remove('hidden');
            return;
        } else {
            noResults.classList.add('hidden');
        }

        resources.forEach((resource, index) => {
            // Clean up image name
            let imgName = resource.image;
            if (imgName) {
                imgName = imgName.replace(/^[- \[\s]+/, '').replace(/[\s\]]+$/, '');
            } else {
                imgName = '';
            }
            
            const imgSrc = imgName ? `img/${imgName}` : '';
            
            // Limit animation delay so it doesn't take too long for many items
            const delay = Math.min((index % 20) * 0.05, 1);

            const card = document.createElement('a');
            card.href = resource.url && resource.url !== 'Categoria:' ? resource.url : '#';
            if (card.href !== '#') {
                card.target = "_blank";
                card.rel = "noopener noreferrer";
            }
            card.className = 'resource-card';
            card.style.animationDelay = `${delay}s`;

            const categoriesHtml = resource.categories && resource.categories.length > 0 
                ? resource.categories.map(c => `<span class="tag">${c.trim()}</span>`).join('')
                : '';

            card.innerHTML = `
                <div class="card-img-wrapper">
                    ${imgSrc ? `<img src="${imgSrc}" alt="${resource.name}" onerror="this.src='', this.parentElement.innerHTML='<div style=\\'color:#fff;font-size:0.8rem;text-transform:uppercase;opacity:0.5;\\'>Sin Imagen</div>'">` : '<div style="color:#fff;font-size:0.8rem;text-transform:uppercase;opacity:0.5;">Sin Imagen</div>'}
                </div>
                <div class="card-content">
                    <div class="card-tags">${categoriesHtml}</div>
                    <h3 class="card-title">${resource.name}</h3>
                    <p class="card-description">${resource.description}</p>
                    <div class="card-footer">
                        <span class="card-link">Visitar sitio 
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                        </span>
                    </div>
                </div>
            `;

            gridContainer.appendChild(card);
        });
    }

    function setupEventListeners() {
        // Category Filters
        filtersContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                // Remove active class from all
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                // Add active to clicked
                e.target.classList.add('active');
                
                activeFilter = e.target.dataset.filter.toLowerCase();
                applyFilters();
            }
        });

        // Search Input
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            applyFilters();
        });
    }

    function applyFilters() {
        const filtered = allResources.filter(resource => {
            // Check category match
            let matchesCategory = false;
            if (activeFilter === 'all') {
                matchesCategory = true;
            } else if (resource.categories) {
                matchesCategory = resource.categories.some(c => c.trim().toLowerCase() === activeFilter);
            }
            
            // Check search match
            const matchesSearch = searchQuery === '' || 
                resource.name.toLowerCase().includes(searchQuery) || 
                (resource.description && resource.description.toLowerCase().includes(searchQuery)) ||
                (resource.categories && resource.categories.some(c => c.toLowerCase().includes(searchQuery)));

            return matchesCategory && matchesSearch;
        });

        renderResources(filtered);
    }
});
