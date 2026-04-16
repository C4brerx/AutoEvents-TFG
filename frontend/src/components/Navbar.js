import React, { useState } from 'react';
import NotificationBell from './NotificationBell'; // <-- IMPORTAMOS LA CAMPANITA REAL

function Navbar({ usuario, seccionActiva, setSeccionActiva, onLogout }) {
    const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
    const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);

    // Comprobamos si el usuario tiene foto. Si no, usamos null para poner el icono por defecto.
    const avatarUrl = usuario.foto_perfil
        ? `http://localhost/autoevents/backend/uploads/perfiles/${usuario.foto_perfil}`
        : null;

    return (
        <nav className="navbar navbar-expand-lg navbar-dark sticky-top glass-card navbar-custom">
            <div className="container">
                {/* LOGO */}
                <span className="navbar-brand m-0 cursor-pointer" onClick={() => setSeccionActiva('inicio')}>
                    <img src="/logo.png" alt="AutoEvents Logo" style={{ height: '45px', objectFit: 'contain' }} />
                </span>

                {/* BOTÓN MENÚ MÓVIL */}
                <button className="navbar-toggler border-0 shadow-none" type="button" onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}>
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className={`collapse navbar-collapse ${menuMovilAbierto ? 'show' : ''}`}>
                    {/* ENLACES PRINCIPALES */}
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 mt-3 mt-lg-0">
                        <li className="nav-item">
                            <span className={`nav-link cursor-pointer ${seccionActiva === 'inicio' ? 'active text-white fw-bold' : ''}`} onClick={() => { setSeccionActiva('inicio'); setMenuMovilAbierto(false); }}>
                                <i className="bi bi-house-door me-1"></i> Inicio
                            </span>
                        </li>
                        <li className="nav-item">
                            <span className={`nav-link cursor-pointer ${seccionActiva === 'garaje' ? 'active text-white fw-bold' : ''}`} onClick={() => { setSeccionActiva('garaje'); setMenuMovilAbierto(false); }}>
                                <i className="bi bi-car-front me-1"></i> Mi Garaje
                            </span>
                        </li>
                    </ul>

                    {/* ZONA DE USUARIO Y NOTIFICACIONES */}
                    <div className="d-flex align-items-center mt-2 mt-lg-0 position-relative gap-2">

                        {/* ==================================================== */}
                        {/* AQUÍ INYECTAMOS LA CAMPANITA FUNCIONAL */}
                        {/* ==================================================== */}
                        <NotificationBell />

                        {/* BOTÓN PRINCIPAL DE USUARIO */}
                        <button
                            className="btn btn-dark ae-input border-0 px-3 text-start d-flex align-items-center justify-content-between shadow-sm"
                            onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                            style={{ minWidth: '180px' }}
                        >
                            <div className="d-flex align-items-center position-relative">
                                {/* Muestra la foto real o el icono */}
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Perfil" className="rounded-circle me-2 object-fit-cover border border-secondary" style={{ width: '32px', height: '32px' }} />
                                ) : (
                                    <i className="bi bi-person-circle me-2 text-secondary fs-4 align-middle"></i>
                                )}

                                <span className="fw-bold text-truncate" style={{ maxWidth: '110px' }}>{usuario.nombre}</span>
                            </div>
                            <i className={`bi bi-chevron-${menuUsuarioAbierto ? 'up' : 'down'} ms-2 text-secondary small`}></i>
                        </button>

                        {/* MENÚ DE USUARIO DESPLEGABLE */}
                        {menuUsuarioAbierto && (
                            <div
                                className="glass-card mt-2 border border-secondary shadow-lg p-3 rounded-3 fade-in"
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: '0',
                                    minWidth: '220px',
                                    zIndex: 9999,
                                    backgroundColor: '#1a1a1a'
                                }}
                            >
                                <div className="d-grid gap-2">
                                    <button
                                        className="btn btn-outline-light text-start fw-bold shadow-sm py-2"
                                        onClick={() => { setSeccionActiva('perfil'); setMenuUsuarioAbierto(false); }}
                                    >
                                        <i className="bi bi-person-badge me-2"></i> Mi Perfil
                                    </button>

                                    <button
                                        className="btn btn-danger text-start fw-bold shadow-sm py-2 mt-1"
                                        onClick={onLogout}
                                    >
                                        <i className="bi bi-power me-2"></i> Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;