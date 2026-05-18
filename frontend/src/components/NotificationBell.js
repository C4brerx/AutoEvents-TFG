import React, { useState, useEffect, useRef } from 'react';

const API_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
    ? process.env.REACT_APP_API_URL
    : 'http://localhost/autoevents/backend';

function NotificationBell() {
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const [abierto, setAbierto] = useState(false);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

    const menuRef = useRef(null);

    const cargarNotificaciones = async () => {
        try {
            const respuesta = await fetch(`${API_URL}/notificaciones.php`, { method: 'GET', credentials: 'include' });
            const datos = await respuesta.json();
            if (datos.estado === 'exito') {
                setNotificaciones(datos.notificaciones);
                setNoLeidas(datos.no_leidas);
            }
        } catch (error) {
            console.error("Error cargando notificaciones:", error);
        }
    };

    useEffect(() => {
        const manejarResize = () => setIsMobile(window.innerWidth < 992);
        window.addEventListener('resize', manejarResize);
        return () => window.removeEventListener('resize', manejarResize);
    }, []);

    useEffect(() => {
        cargarNotificaciones();
        const intervalo = setInterval(cargarNotificaciones, 10000);
        return () => clearInterval(intervalo);
    }, []);

    useEffect(() => {
        const handleClickFuera = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setAbierto(false);
            }
        };
        document.addEventListener('mousedown', handleClickFuera);
        return () => document.removeEventListener('mousedown', handleClickFuera);
    }, []);

    const manejarClicCampana = async () => {
        setAbierto(!abierto);

        if (!abierto && noLeidas > 0) {
            setNoLeidas(0);
            try {
                await fetch(`${API_URL}/notificaciones.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accion: 'marcar_leidas' }),
                    credentials: 'include'
                });
                cargarNotificaciones();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const obtenerIcono = (mensaje) => {
        if (mensaje.includes('🏎️')) return 'bi-flag-fill text-warning';
        if (mensaje.includes('✅')) return 'bi-check-circle-fill text-success';
        return 'bi-info-circle-fill text-info';
    };

    const posicionMenu = isMobile ? { left: '0' } : { right: '0' };

    return (
        <div className="position-relative d-inline-block me-3" ref={menuRef}>
            <button
                className="btn btn-link text-white p-0 text-decoration-none position-relative cursor-pointer"
                onClick={manejarClicCampana}
            >
                <i className={`bi bi-bell-fill fs-5 ${noLeidas > 0 ? 'text-white' : 'text-secondary'}`}></i>

                {noLeidas > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-dark" style={{ fontSize: '0.65rem' }}>
                        {noLeidas}
                    </span>
                )}
            </button>

            {abierto && (
                <div className="dropdown-menu-custom show glass-card rounded-4 shadow-lg p-0 border border-secondary border-opacity-50"
                     style={{
                         position: 'absolute',
                         top: '130%',
                         ...posicionMenu,
                         minWidth: '280px',
                         maxWidth: '90vw',
                         zIndex: 9999
                     }}>

                    <div className="p-3 border-bottom border-white-10 bg-black bg-opacity-50" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                        <h6 className="m-0 fw-bold text-white d-flex justify-content-between align-items-center">
                            Notificaciones
                            {noLeidas > 0 && <span className="badge bg-danger">{noLeidas} nuevas</span>}
                        </h6>
                    </div>

                    <div className="overflow-auto" style={{ maxHeight: '350px' }}>
                        {notificaciones.length === 0 ? (
                            <div className="p-4 text-center text-secondary small">
                                <i className="bi bi-bell-slash fs-3 d-block mb-2 opacity-50"></i>
                                No tienes notificaciones recientes.
                            </div>
                        ) : (
                            notificaciones.map((notif) => (
                                <div key={notif.id} className={`p-3 border-bottom border-white-10 transition-all hover-bg-darker ${notif.leido == 0 ? 'bg-danger bg-opacity-10' : ''}`}>
                                    <div className="d-flex align-items-start gap-3">

                                        <div className={`p-2 rounded-circle bg-black bg-opacity-50 border ${notif.leido == 0 ? 'border-danger' : 'border-secondary'}`}>
                                            <i className={`bi ${obtenerIcono(notif.mensaje)}`}></i>
                                        </div>

                                        <div>
                                            <p className="m-0 text-light fw-semibold" style={{ fontSize: '0.85rem' }}>{notif.mensaje}</p>
                                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                {new Date(notif.fecha_creacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                                            </small>
                                        </div>

                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;