import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';

function EventModal({ evento, onClose, onAsistir, formatearFecha }) {
    const [clima, setClima] = useState(null);
    const [cargandoClima, setCargandoClima] = useState(true);

    // Efecto para buscar el tiempo cuando se abre el modal
    useEffect(() => {
        if (!evento) return;

        const obtenerTiempo = async () => {
            setCargandoClima(true);
            try {
                // 1. Limpiamos el nombre de la ciudad
                const ciudadBusqueda = evento.ubicacion.split(',')[0].trim();

                // 2. Buscamos las coordenadas de esa ciudad (Open-Meteo Geocoding)
                const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudadBusqueda)}&count=1&language=es&format=json`);
                const geoData = await geoRes.json();

                if (geoData.results && geoData.results.length > 0) {
                    const { latitude, longitude } = geoData.results[0];

                    // 3. Buscamos el tiempo en esas coordenadas
                    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
                    const weatherData = await weatherRes.json();

                    setClima(weatherData.current_weather);
                }
            } catch (error) {
                console.error("Error cargando el tiempo", error);
            } finally {
                setCargandoClima(false);
            }
        };

        obtenerTiempo();
    }, [evento]);

    if (!evento) return null;

    const ticketData = `https://autoevents.app/portero/validar?ticket=${evento.id}&evento=${encodeURIComponent(evento.titulo)}`;

    // Función para traducir el código del tiempo a un icono y texto
    const obtenerIconoClima = (codigo) => {
        if (codigo === 0) return { icon: 'bi-sun-fill text-warning', text: 'Despejado' };
        if (codigo >= 1 && codigo <= 3) return { icon: 'bi-cloud-sun-fill text-light', text: 'Nublado' };
        if (codigo >= 51 && codigo <= 67) return { icon: 'bi-cloud-rain-fill text-info', text: 'Lluvia' };
        if (codigo >= 71 && codigo <= 77) return { icon: 'bi-snow text-white', text: 'Nieve' };
        if (codigo >= 95) return { icon: 'bi-cloud-lightning-rain-fill text-warning', text: 'Tormenta' };
        return { icon: 'bi-cloud-fill text-secondary', text: 'Variable' };
    };

    return createPortal(
        <div className="modal-backdrop-custom" onClick={onClose} style={{ zIndex: 9999 }}>
            <div className="glass-card rounded-4 p-0 overflow-hidden modal-container-custom fade-in" onClick={e => e.stopPropagation()}>

                {/* CABECERA */}
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-white-10 bg-black bg-opacity-50">
                    <h3 className="fw-bold m-0 text-white">{evento.titulo}</h3>
                    <button className="btn btn-sm btn-outline-light border-0" onClick={onClose}><i className="bi bi-x-lg fs-4"></i></button>
                </div>

                {/* CUERPO DEL MODAL */}
                <div className="row g-0 flex-grow-1 overflow-auto" style={{ maxHeight: 'calc(90vh - 130px)' }}>

                    {/* IMAGEN Y TICKET QR */}
                    <div className="col-lg-6 bg-black d-flex align-items-center justify-content-center position-relative">
                        <img
                            src={evento.imagen_url || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'}
                            className={`img-fluid w-100 h-100 object-fit-cover transition-all ${evento.apuntado == 1 ? 'opacity-25' : ''}`}
                            alt={evento.titulo}
                            style={{ minHeight: '300px' }}
                        />

                        {evento.apuntado == 1 && (
                            <div className="position-absolute text-center p-4 rounded-4 shadow-lg bg-white fade-in" style={{ width: '220px' }}>
                                <p className="text-dark fw-bold mb-2 small text-uppercase">Ticket de Acceso</p>
                                <div className="p-2 border border-2 border-dark rounded-3 bg-white">
                                    <QRCodeSVG value={ticketData} size={150} level={"H"} includeMargin={true} />
                                </div>
                                <p className="text-dark mt-2 mb-0 fw-bold" style={{ fontSize: '0.7rem' }}>
                                    #{evento.id}{new Date().getTime().toString().slice(-5)}
                                </p>
                                <small className="text-muted">Presenta este QR al llegar</small>
                            </div>
                        )}
                    </div>

                    {/* DETALLES DEL EVENTO */}
                    <div className="col-lg-6 p-4 d-flex flex-column bg-dark bg-opacity-50 text-light">
                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <span className="badge bg-danger px-3 py-2 fs-6 shadow-sm">{evento.tipo}</span>

                                {/* ========================================== */}
                                {/* WIDGET DEL TIEMPO EN DIRECTO               */}
                                {/* ========================================== */}
                                <div className="bg-black bg-opacity-50 border border-secondary rounded-pill px-3 py-1 d-flex align-items-center shadow-sm">
                                    {cargandoClima ? (
                                        <span className="spinner-border spinner-border-sm text-secondary" role="status"></span>
                                    ) : clima ? (
                                        <>
                                            <i className={`bi ${obtenerIconoClima(clima.weathercode).icon} fs-5 me-2`}></i>
                                            <span className="fw-bold">{Math.round(clima.temperature)}°C</span>
                                        </>
                                    ) : (
                                        <span className="text-secondary small"><i className="bi bi-cloud-slash me-1"></i>N/D</span>
                                    )}
                                </div>

                            </div>

                            <h4 className="fw-bold text-ae-red mb-3">Información del Evento</h4>
                            <p className="text-md text-pre-wrap text-secondary mb-4" style={{ lineHeight: '1.6' }}>
                                {evento.descripcion}
                            </p>

                            <hr className="border-white-10 mb-4" />

                            <ul className="list-unstyled mb-0">
                                <li className="mb-3 d-flex align-items-center">
                                    <div className="bg-black bg-opacity-50 p-2 rounded text-danger me-3 border border-secondary shadow-sm">
                                        <i className="bi bi-calendar-event fs-5"></i>
                                    </div>
                                    <div>
                                        <small className="text-secondary d-block fw-bold text-uppercase">Fecha y Hora</small>
                                        <span className="fw-bold text-capitalize">{formatearFecha(evento.fecha)}</span>
                                    </div>
                                </li>

                                <li className="mb-3 d-flex align-items-center">
                                    <div className="bg-black bg-opacity-50 p-2 rounded text-danger me-3 border border-secondary shadow-sm">
                                        <i className="bi bi-geo-alt-fill fs-5"></i>
                                    </div>
                                    <div>
                                        <small className="text-secondary d-block fw-bold text-uppercase">Ubicación</small>
                                        <span className="fw-bold">{evento.ubicacion}</span>
                                    </div>
                                </li>

                                <li className="d-flex align-items-center">
                                    <div className="bg-black bg-opacity-50 p-2 rounded text-danger me-3 border border-secondary shadow-sm">
                                        <i className="bi bi-people-fill fs-5"></i>
                                    </div>
                                    <div>
                                        <small className="text-secondary d-block fw-bold text-uppercase">Asistencia</small>
                                        <span className="fw-bold">
                                            {evento.asistentes_actuales} asistentes
                                            {evento.aforo_maximo ? ` (Máx. ${evento.aforo_maximo})` : ' (Aforo Ilimitado)'}
                                        </span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* PIE DE MODAL */}
                <div className="p-3 bg-dark border-top border-white-10 bg-opacity-75 d-flex justify-content-between align-items-center">
                    {evento.apuntado == 1 ? (
                        <p className="m-0 text-success fw-bold"><i className="bi bi-check-circle-fill me-2"></i>Ya estás inscrito en este evento</p>
                    ) : (
                        <p className="m-0 text-secondary small">Quedan plazas disponibles para este evento</p>
                    )}

                    <button
                        className={`btn fw-bold px-4 py-2 shadow ${evento.apuntado == 1 ? 'btn-outline-danger' : 'ae-btn-primary'}`}
                        onClick={() => {
                            onAsistir(evento.id, evento.titulo, evento.apuntado);
                            if (evento.apuntado == 1) onClose();
                        }}
                    >
                        {evento.apuntado == 1 ? <><i className="bi bi-x-circle-fill me-2"></i>Cancelar Asistencia</> : <><i className="bi bi-qr-code-scan me-2"></i>Confirmar y Generar Ticket</>}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default EventModal;