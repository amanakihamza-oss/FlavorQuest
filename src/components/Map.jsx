import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { Navigation, MapPin, Crosshair } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';

// Custom Marker Icon definition
const createCustomIcon = (name) => {
    const iconHtml = renderToStaticMarkup(
        <div className="relative flex flex-col items-center justify-center">
            <div className="w-10 h-10 bg-brand-orange rounded-full shadow-lg border-2 border-white flex items-center justify-center text-white transform transition-transform hover:scale-110">
                <MapPin size={20} className="fill-current" />
            </div>
            <div className="mt-1 px-2 py-0.5 bg-white/90 backdrop-blur text-[10px] font-bold rounded shadow-sm whitespace-nowrap text-brand-dark hidden group-hover:block">
                {name}
            </div>
        </div>
    );

    return L.divIcon({
        html: iconHtml,
        className: 'custom-marker-container group', // 'group' allows hover effects
        iconSize: [40, 50],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
    });
};

// Component to handle "Locate Me" functionality
const LocateControl = () => {
    const map = useMap();
    const [position, setPosition] = useState(null);

    const handleLocate = () => {
        map.locate().on("locationfound", function (e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, 14);
        });
    };

    return (
        <div className="leaflet-bottom leaflet-right !mb-4 mr-4 pointer-events-auto z-[1000]">
            <div className="bg-white rounded-lg shadow-md hover:bg-gray-50 border border-gray-100 overflow-hidden">
                <button
                    onClick={handleLocate}
                    className="p-2 text-brand-dark transition-colors flex items-center justify-center w-10 h-10"
                    title="Autour de moi"
                >
                    <Crosshair size={20} />
                </button>
            </div>
            {position && (
                <Marker position={position} icon={L.divIcon({
                    className: 'user-location-marker',
                    html: renderToStaticMarkup(<div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg pulse-ring"></div>),
                    iconSize: [16, 16]
                })}>
                    <Popup>Vous êtes ici</Popup>
                </Marker>
            )}
        </div>
    );
};

// Component to handle custom Zoom controls
const CustomZoomControl = () => {
    const map = useMap();

    return (
        <div className="leaflet-bottom leaflet-right !mb-20 mr-4 flex flex-col gap-2 pointer-events-auto z-[1000]">
            <div className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                <button
                    onClick={() => map.zoomIn()}
                    className="p-2 hover:bg-gray-50 text-brand-dark border-b border-gray-100 transition-colors w-10 h-10 flex items-center justify-center"
                    title="Zoom avant"
                >
                    <span className="text-xl font-bold">+</span>
                </button>
                <button
                    onClick={() => map.zoomOut()}
                    className="p-2 hover:bg-gray-50 text-brand-dark transition-colors w-10 h-10 flex items-center justify-center"
                    title="Zoom arrière"
                >
                    <span className="text-xl font-bold">-</span>
                </button>
            </div>
        </div>
    );
};

// Component to auto-fit bounds
const FitBounds = ({ places }) => {
    const map = useMap();

    useEffect(() => {
        if (!places || places.length === 0) return;

        const markers = places
            .filter(p => p.lat && p.lng)
            .map(p => [p.lat, p.lng]);

        if (markers.length > 0) {
            const bounds = L.latLngBounds(markers);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [places, map]);

    return null;
};

const Map = ({ places }) => {
    // Default center (Namur)
    const defaultCenter = [50.4674, 4.8720];

    return (
        <div className="h-[600px] w-full rounded-3xl overflow-hidden shadow-xl border border-gray-100 relative z-0">
            <MapContainer
                center={defaultCenter}
                zoom={13}
                scrollWheelZoom={true}
                zoomControl={false}
                className="h-full w-full bg-gray-50"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Premium nicer map style
                />

                <CustomZoomControl />
                <LocateControl />
                <FitBounds places={places} />

                {places.map(place => (
                    place.lat && place.lng && (
                        <Marker
                            key={place.id}
                            position={[place.lat, place.lng]}
                            icon={createCustomIcon(place.name)}
                        >
                            <Popup className="custom-popup" closeButton={false}>
                                <div className="w-[260px] p-0 font-sans">
                                    <Link to={place.slug ? `/place/${place.slug}` : `/place/${place.id}`} className="block relative h-36 group overflow-hidden">
                                        <img
                                            src={place.image}
                                            alt={place.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-brand-orange shadow-sm">
                                            {place.category === 'Snack' ? 'Fast Food' : place.category}
                                        </div>
                                    </Link>

                                    <div className="p-4 bg-white">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-exrabold text-brand-dark text-lg leading-tight line-clamp-1">{place.name}</h3>
                                            <div className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-md">
                                                <span>★</span> {place.rating || '4.5'}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-4">
                                            <MapPin size={12} className="shrink-0 text-brand-orange" />
                                            <span className="line-clamp-1">{place.address || place.city || 'Namur'}</span>
                                        </div>

                                        <Link
                                            to={place.slug ? `/place/${place.slug}` : `/place/${place.id}`}
                                            className="block w-full text-center py-2.5 rounded-xl bg-brand-dark text-white font-bold text-sm transition-all hover:bg-brand-orange hover:shadow-lg hover:shadow-orange-500/20 active:scale-95"
                                        >
                                            Voir la fiche
                                        </Link>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>

            <style>{`
                .custom-popup .leaflet-popup-content-wrapper {
                    padding: 0;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                .custom-popup .leaflet-popup-content {
                    margin: 0;
                    width: auto !important;
                }
                .pulse-ring {
                    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
                    animation: pulse-blue 2s infinite;
                }
                @keyframes pulse-blue {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }
            `}</style>
        </div>
    );
};

export default Map;
