import React, { useState, useEffect, useRef } from 'react';

function NotificationBell() {
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const [abierto, setAbierto] = useState(false);
    const menuRef = useRef(null);

    const cargarNotificaciones = async () => {
        try {
            const respuesta = await fetch('http://localhost/autoevents/backend/notificaciones.php', { method: 'GET', credentials: 'include' });
            const datos = await respuesta.json();
            if (datos.estado === 'exito') {
                setNotificaciones(datos.notificaciones);
                setNoLeidas(datos.no_leidas);
            }
        } catch (error) { console.error("Error cargando notificaciones:", error); }
    };

    // Carga inicial y "Polling" (consultar cada 10 segundos en segundo plano)
    useEffect(() => {
        cargarNotificaciones();
        const intervalo = setInterval(cargarNotificaciones, 10000);
        return () => clearInterval(intervalo);
    }, []);

    // Cerrar el menú si hacemos clic fuera de él
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

        // Si hay notificaciones sin leer y abrimos el menú, las marcamos como leídas
        if (!abierto && noLeidas > 0) {
            setNoLeidas(0); // Lo ponemos a 0 visualmente al instante para buena UX
            try {
                await fetch('http://localhost/autoevents/backend/notificaciones.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accion: 'marcar_leidas' }),
                    credentials: 'include'
                });
                cargarNotificaciones(); // Recargamos para asegurar sincronización
            } catch (error) { console.error(error); }
        }
    };

    return (
        <div className="position-relative d-inline-block me-3" ref={menuRef}>
            {/* ICONO DE LA CAMPANITA */}
            <button
                className="btn btn-link text-white p-0 text-decoration-none position-relative cursor-pointer"
                onClick={manejarClicCampana}
            >
                <i className={`bi bi-bell-fill fs-5 ${noLeidas > 0 ? 'text-white' : 'text-secondary'}`}></i>

                {/* PUNTITO ROJO (Solo si hay no leídas) */}
                {noLeidas > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-dark" style={{ fontSize: '0.65rem' }}>
                        {noLeidas}
                    </span>
                )}
            </button>

            {/* DESPLEGABLE DE NOTIFICACIONES */}
            {abierto && (
                <div className="dropdown-menu-custom show glass-card rounded-4 shadow-lg p-0 border border-secondary border-opacity-50"
                     style={{ position: 'absolute', top: '100%', right: '-10px', width: '320px', zIndex: 1050, marginTop: '15px' }}>

                    <div className="p-3 border-bottom border-white-10 bg-black bg-opacity-50">
                        <h6 className="m-0 fw-bold text-white d-flex justify-content-between align-items-center">
                            Notificaciones
                            {noLeidas > 0 && <span className="badge bg-danger">{noLeidas} nuevas</span>}
                        </h6>
                    </div>

                    <div className="overflow-auto" style={{ maxHeight: '350px' }}>
                        {notificaciones.length === 0 ? (
                            <div className="p-4 text-center text-secondary small">
                                <i className="bi bi-bell-slash fs-3 d-block mb-2 opacity-50"></i>
                                No tienes notificaciones.
                            </div>
                        ) : (
                            notificaciones.map((notif) => (
                                <div key={notif.id} className={`p-3 border-bottom border-white-10 transition-all hover-bg-darker ${notif.leido == 0 ? 'bg-danger bg-opacity-10' : ''}`}>
                                    <div className="d-flex align-items-start gap-3">
                                        <div className={`p-2 rounded-circle bg-black bg-opacity-50 border ${notif.leido == 0 ? 'border-danger text-danger' : 'border-secondary text-secondary'}`}>
                                            <i className={`bi ${notif.icono}`}></i>
                                        </div>
                                        <div>
                                            <p className="m-0 fw-bold text-light text-sm">{notif.titulo}</p>
                                            <p className="m-0 text-secondary" style={{ fontSize: '0.8rem' }}>{notif.mensaje}</p>
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