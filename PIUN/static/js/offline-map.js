// Offline-capable mapping system for PIU project sites
// Uses Leaflet with offline tile storage capability

class OfflineMap {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            center: [13.4544, -16.5753], // The Gambia center
            zoom: 8,
            maxZoom: 18,
            minZoom: 5,
            ...options
        };
        this.map = null;
        this.markers = [];
        this.markerCluster = null;
        this.baseLayers = {};
        this.currentLayer = null;
        this.offlineStorage = new OfflineTileStorage();
    }

    // Initialize the map with offline capabilities
    init() {
        console.log('Initializing offline map...');
        
        // Create map instance
        this.map = L.map(this.containerId, {
            center: this.options.center,
            zoom: this.options.zoom,
            maxZoom: this.options.maxZoom,
            minZoom: this.options.minZoom,
            zoomControl: true,
            attributionControl: true
        });

        // Add offline-capable base layers
        this.setupBaseLayers();
        
        // Add marker clustering
        this.setupMarkerClustering();
        
        // Add controls
        this.setupControls();
        
        // Setup offline storage
        this.setupOfflineStorage();
        
        console.log('Offline map initialized successfully');
        return this;
    }

    // Setup base layers with offline capability
    setupBaseLayers() {
        // OpenStreetMap - Primary offline layer
        this.baseLayers['OpenStreetMap'] = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            id: 'osm',
            offline: true
        });

        // Offline fallback layer (simple canvas-based)
        this.baseLayers['Offline Fallback'] = L.tileLayer.canvas({
            attribution: 'Offline Mode - Basic Grid',
            maxZoom: 18,
            id: 'offline'
        });

        // Set default layer
        this.currentLayer = this.baseLayers['OpenStreetMap'];
        this.currentLayer.addTo(this.map);
    }

    // Setup marker clustering for better performance
    setupMarkerClustering() {
        if (typeof L.markerClusterGroup !== 'undefined') {
            this.markerCluster = L.markerClusterGroup({
                chunkedLoading: true,
                maxClusterRadius: 60,
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true
            });
            this.map.addLayer(this.markerCluster);
        }
    }

    // Setup map controls
    setupControls() {
        // Layer control
        const layerControl = L.control.layers(this.baseLayers, {}, {
            position: 'topright',
            collapsed: false
        });
        layerControl.addTo(this.map);

        // Scale control
        L.control.scale({
            position: 'bottomleft',
            metric: true,
            imperial: false
        }).addTo(this.map);

        // Fullscreen control (if available)
        if (L.control.fullscreen) {
            L.control.fullscreen({
                position: 'topleft'
            }).addTo(this.map);
        }

        // Offline status indicator
        this.addOfflineStatusControl();
    }

    // Setup offline tile storage
    setupOfflineStorage() {
        // Monitor online/offline status
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
        
        // Check initial status
        this.handleOnlineStatus(navigator.onLine);
    }

    // Handle online/offline status changes
    handleOnlineStatus(isOnline) {
        const statusControl = document.getElementById('offline-status');
        if (statusControl) {
            if (isOnline) {
                statusControl.innerHTML = '<i class="bi bi-wifi"></i> Online';
                statusControl.className = 'leaflet-control-offline online';
                // Switch to online layer if available
                if (this.currentLayer !== this.baseLayers['OpenStreetMap']) {
                    this.map.removeLayer(this.currentLayer);
                    this.currentLayer = this.baseLayers['OpenStreetMap'];
                    this.currentLayer.addTo(this.map);
                }
            } else {
                statusControl.innerHTML = '<i class="bi bi-wifi-off"></i> Offline';
                statusControl.className = 'leaflet-control-offline offline';
                // Switch to offline layer
                this.switchToOfflineMode();
            }
        }
    }

    // Switch to offline mode
    switchToOfflineMode() {
        console.log('Switching to offline mode...');
        // Keep existing tiles in cache, add offline fallback for missing tiles
        this.currentLayer.options.errorTileUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }

    // Add offline status control
    addOfflineStatusControl() {
        const OfflineStatusControl = L.Control.extend({
            onAdd: function(map) {
                const div = L.DomUtil.create('div', 'leaflet-control-offline');
                div.id = 'offline-status';
                div.innerHTML = '<i class="bi bi-wifi"></i> Online';
                div.style.backgroundColor = 'white';
                div.style.padding = '5px 10px';
                div.style.borderRadius = '4px';
                div.style.border = '2px solid rgba(0,0,0,0.2)';
                div.style.fontSize = '12px';
                div.style.fontWeight = 'bold';
                return div;
            },
            onRemove: function(map) {}
        });

        new OfflineStatusControl({ position: 'topright' }).addTo(this.map);
    }

    // Add project markers to the map
    addProjectMarkers(projects) {
        console.log(`Adding ${projects.length} project markers...`);
        
        projects.forEach(project => {
            if (project.latitude && project.longitude) {
                const marker = this.createProjectMarker(project);
                if (this.markerCluster) {
                    this.markerCluster.addLayer(marker);
                } else {
                    marker.addTo(this.map);
                }
                this.markers.push(marker);
            }
        });

        // Fit map to markers if we have any
        if (this.markers.length > 0) {
            this.fitToMarkers();
        }
    }

    // Create individual project marker
    createProjectMarker(project) {
        const lat = parseFloat(project.latitude);
        const lng = parseFloat(project.longitude);

        // Color coding based on project status or donor
        const markerColor = this.getMarkerColor(project);
        
        // Create custom icon
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const marker = L.marker([lat, lng], { icon });

        // Create popup content
        const popupContent = this.createPopupContent(project);
        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'project-popup'
        });

        return marker;
    }

    // Get marker color based on project properties
    getMarkerColor(project) {
        const colors = {
            'World Bank': '#0066cc',
            'AfDB': '#ff6600',
            'BADEA': '#009900',
            'IsDB': '#cc0066',
            'default': '#666666'
        };

        // Color by donor if available
        if (project.donor && colors[project.donor]) {
            return colors[project.donor];
        }

        // Color by access status if available
        if (project.access_status) {
            return project.access_status === 'Connected' ? '#009900' : '#cc0000';
        }

        return colors.default;
    }

    // Create popup content for project marker
    createPopupContent(project) {
        const editUrl = project.id ? `/PIU_Mapping_project_Sites/update-mapping/${project.id}/` : '#';
        return `
            <div class="project-popup-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h5 class="mb-0">${project.settlement_name || 'Unknown Settlement'}</h5>
                    ${project.id ? `<a href="${editUrl}" style="color: #27ae60; text-decoration: none; font-size: 16px;" title="Edit Details">
                        <i class="fa fa-edit"></i>
                    </a>` : ''}
                </div>
                <div class="popup-details">
                    <p><strong>Region:</strong> ${project.region_name || 'N/A'}</p>
                    <p><strong>District:</strong> ${project.district_name || 'N/A'}</p>
                    ${project.total_households ? `<p><strong>Households:</strong> ${project.total_households}</p>` : ''}
                    ${project.connected_households ? `<p><strong>Connected:</strong> ${project.connected_households}</p>` : ''}
                    ${project.donor ? `<p><strong>Donor:</strong> ${project.donor}</p>` : ''}
                    ${project.access_status ? `<p><strong>Status:</strong> ${project.access_status}</p>` : ''}
                </div>
                <div class="popup-coordinates">
                    <small class="text-muted">
                        Coordinates: ${parseFloat(project.latitude).toFixed(4)}, ${parseFloat(project.longitude).toFixed(4)}
                    </small>
                </div>
            </div>
        `;
    }

    // Fit map view to show all markers
    fitToMarkers() {
        if (this.markers.length === 0) return;

        const group = new L.featureGroup(this.markers);
        this.map.fitBounds(group.getBounds().pad(0.1));
    }

    // Clear all markers
    clearMarkers() {
        if (this.markerCluster) {
            this.markerCluster.clearLayers();
        } else {
            this.markers.forEach(marker => {
                this.map.removeLayer(marker);
            });
        }
        this.markers = [];
    }

    // Add search functionality
    addSearch(searchData) {
        if (typeof L.Control.Search !== 'undefined') {
            const searchControl = new L.Control.Search({
                layer: this.markerCluster || L.layerGroup(this.markers),
                propertyName: 'settlement_name',
                marker: false,
                moveToLocation: function(latlng, title, map) {
                    map.setView(latlng, 15);
                }
            });
            this.map.addControl(searchControl);
        }
    }

    // Export map as image (for offline documentation)
    exportAsImage() {
        if (typeof leafletImage !== 'undefined') {
            leafletImage(this.map, (err, canvas) => {
                if (!err) {
                    const link = document.createElement('a');
                    link.download = 'piu-project-map.png';
                    link.href = canvas.toDataURL();
                    link.click();
                }
            });
        }
    }

    // Get map instance
    getMap() {
        return this.map;
    }
}

// Offline tile storage utility
class OfflineTileStorage {
    constructor() {
        this.dbName = 'PIU_MapTiles';
        this.dbVersion = 1;
        this.db = null;
        this.init();
    }

    async init() {
        if ('indexedDB' in window) {
            try {
                this.db = await this.openDB();
                console.log('Offline tile storage initialized');
            } catch (error) {
                console.warn('Could not initialize offline storage:', error);
            }
        }
    }

    openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('tiles')) {
                    const store = db.createObjectStore('tiles', { keyPath: 'key' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    async storeTile(url, blob) {
        if (!this.db) return;
        
        try {
            const transaction = this.db.transaction(['tiles'], 'readwrite');
            const store = transaction.objectStore('tiles');
            
            const tile = {
                key: url,
                data: blob,
                timestamp: Date.now()
            };
            
            await store.put(tile);
        } catch (error) {
            console.warn('Could not store tile:', error);
        }
    }

    async getTile(url) {
        if (!this.db) return null;
        
        try {
            const transaction = this.db.transaction(['tiles'], 'readonly');
            const store = transaction.objectStore('tiles');
            const result = await store.get(url);
            
            return result ? result.data : null;
        } catch (error) {
            console.warn('Could not retrieve tile:', error);
            return null;
        }
    }
}

// Global map instance
window.PIUOfflineMap = OfflineMap;

// CSS for map styling
const mapStyles = `
<style>
.leaflet-control-offline {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    cursor: default;
}

.leaflet-control-offline.online {
    color: #28a745;
    border-color: #28a745 !important;
}

.leaflet-control-offline.offline {
    color: #dc3545;
    border-color: #dc3545 !important;
}

.project-popup-content {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.project-popup-content h5 {
    color: #2c3e50;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
    margin-bottom: 8px;
}

.popup-details p {
    margin: 4px 0;
    font-size: 13px;
}

.popup-coordinates {
    border-top: 1px solid #eee;
    padding-top: 8px;
    margin-top: 8px;
}

.custom-marker {
    border: none !important;
    background: transparent !important;
}

.leaflet-popup-content-wrapper {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

#map-container {
    height: 500px;
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
    #map-container {
        height: 400px;
    }
}
</style>
`;

// Inject styles
if (typeof document !== 'undefined') {
    document.head.insertAdjacentHTML('beforeend', mapStyles);
}