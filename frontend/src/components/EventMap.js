import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const pinIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
});

function EventMap({ eventos, onAbrirModal }) {
    const [eventosConCoords, setEventosConCoords] = useState([]);
    const [cargandoMapa, setCargandoMapa] = useState(true);

    useEffect(() => {
        let montado = true;

        const obtenerCoordenadas = async () => {
            setCargandoMapa(true);
            const eventosMapeados = [];

            const diccionarioCiudades = JSON.parse(localStorage.getItem('ae_diccionario_ciudades')) || {};
            let huboNuevasCiudades = false;

            for (const evento of eventos) {
                const ciudadClave = evento.ubicacion.split(',')[0].trim().toLowerCase();

                if (diccionarioCiudades[ciudadClave]) {
                    eventosMapeados.push({
                        ...evento,
                        lat: diccionarioCiudades[ciudadClave].lat,
                        lng: diccionarioCiudades[ciudadClave].lng
                    });
                }
                else {
                    try {
                        const respuesta = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ciudadClave)}, España&limit=1`);
                        const datos = await respuesta.json();

                        if (datos && datos.length > 0) {
                            const lat = parseFloat(datos[0].lat);
                            const lng = parseFloat(datos[0].lon);

                            eventosMapeados.push({ ...evento, lat, lng });

                            diccionarioCiudades[ciudadClave] = { lat, lng };
                            huboNuevasCiudades = true;
                        }
                    } catch (error) {
                        console.warn(`No se pudo localizar: ${ciudadClave}`);
                    }

                    await new Promise(r => setTimeout(r, 1000));
                }
            }

            if (montado) {
                setEventosConCoords(eventosMapeados);
                setCargandoMapa(false);

                if (huboNuevasCiudades) {
                    localStorage.setItem('ae_diccionario_ciudades', JSON.stringify(diccionarioCiudades));
                }
            }
        };

        if (eventos.length > 0) {
            obtenerCoordenadas();
        } else {
            setCargandoMapa(false);
        }

        return () => { montado = false; };
    }, [eventos]);

    if (cargandoMapa) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center bg-dark glass-card rounded-4 border border-secondary shadow-lg" style={{ height: '500px' }}>
                <div className="spinner-border text-danger mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                <h5 className="text-white fw-bold">Optimizando rutas y localizando eventos...</h5>
                <p className="text-secondary small">Conectando con satélites GPS de OpenStreetMap</p>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-4 overflow-hidden border border-secondary shadow-lg fade-in position-relative" style={{ height: '500px', zIndex: 1 }}>
            <MapContainer
                center={[40.4168, -3.7038]}
                zoom={6}
                style={{ height: '100%', width: '100%', background: '#121212' }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />

                {eventosConCoords.map((evento) => (
                    <Marker key={evento.id} position={[evento.lat, evento.lng]} icon={pinIcon}>
                        <Popup className="ae-map-popup shadow-lg rounded-3 border-0">
                            <div className="text-center p-1" style={{ width: '190px' }}>
                                <img src={evento.imagen_url || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg'} alt={evento.titulo} className="img-fluid rounded-3 mb-2 object-fit-cover shadow-sm" style={{ height: '90px', width: '100%' }} />
                                <h6 className="fw-bold mb-1 text-dark text-truncate px-1">{evento.titulo}</h6>
                                <p className="mb-2 text-secondary small"><i className="bi bi-geo-alt-fill text-danger me-1"></i>{evento.ubicacion}</p>
                                <button
                                    className="btn btn-sm btn-danger w-100 fw-bold shadow-sm"
                                    onClick={() => onAbrirModal(evento.id)}
                                >
                                    Abrir Ticket
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

export default EventMap;