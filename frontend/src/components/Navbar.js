import React, { useState } from 'react';
import NotificationBell from './NotificationBell';

function Navbar({ usuario, seccionActiva, setSeccionActiva, onLogout }) {
    const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
    const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);

    const API_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
        ? process.env.REACT_APP_API_URL
        : 'http://localhost/autoevents/backend';

    const avatarUrl = usuario?.foto_perfil
        ? `${API_URL}/uploads/perfiles/${usuario.foto_perfil}`
        : null;

    return (
        <nav className="navbar navbar-expand-lg navbar-dark sticky-top glass-card navbar-custom">
            <div className="container">
                <span className="navbar-brand m-0 cursor-pointer" onClick={() => setSeccionActiva('inicio')}>
                    <img src="/logo.png" alt="AutoEvents Logo" style={{ height: '45px', objectFit: 'contain' }} />
                </span>

                <button className="navbar-toggler border-0 shadow-none" type="button" onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}>
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className={`collapse navbar-collapse ${menuMovilAbierto ? 'show' : ''}`}>
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 mt-3 mt-lg-0">
                        <li className="nav-item">
                            <span className={`nav-link cursor-pointer text-nowrap ${seccionActiva === 'inicio' ? 'active text-white fw-bold' : ''}`} onClick={() => { setSeccionActiva('inicio'); setMenuMovilAbierto(false); }}>
                                <i className="bi bi-house-door me-1"></i>Inicio
                            </span>
                        </li>
                        <li className="nav-item">
                            <span className={`nav-link cursor-pointer text-nowrap ${seccionActiva === 'garaje' ? 'active text-white fw-bold' : ''}`} onClick={() => { setSeccionActiva('garaje'); setMenuMovilAbierto(false); }}>
                                <i className="bi bi-car-front me-1"></i>Mi Garaje
                            </span>
                        </li>
                        <li className="nav-item">
                            <span className={`nav-link cursor-pointer text-nowrap ${seccionActiva === 'comunidad' ? 'active text-white fw-bold' : ''}`} onClick={() => { setSeccionActiva('comunidad'); setMenuMovilAbierto(false); }}>
                                <i className="bi bi-people me-1"></i>Comunidad
                            </span>
                        </li>
                        <li className="nav-item">
                            <span className={`nav-link cursor-pointer text-nowrap ${seccionActiva === 'tienda' ? 'active text-white fw-bold' : ''}`} onClick={() => { setSeccionActiva('tienda'); setMenuMovilAbierto(false); }}>
                                <i className="bi bi-shop me-1"></i>Tienda
                            </span>
                        </li>
                    </ul>

                    <div className="d-flex flex-wrap align-items-center mt-3 mt-lg-0 position-relative gap-2 pb-2 pb-lg-0">

                        {usuario && usuario.rol === 'admin' && (
                            <button
                                onClick={() => { setSeccionActiva('admin'); setMenuMovilAbierto(false); }}
                                className={`btn btn-outline-warning fw-bold d-flex align-items-center text-nowrap ${seccionActiva === 'admin' ? 'active' : ''}`}
                            >
                                👑 <span className="d-none d-xl-inline ms-1">Panel Admin</span>
                            </button>
                        )}

                        <button
                            className={`btn d-flex align-items-center transition-all ${seccionActiva === 'mensajes' ? 'btn-danger text-white shadow' : 'btn-dark border border-secondary text-white-50 hover-text-white'}`}
                            onClick={() => { setSeccionActiva('mensajes'); setMenuMovilAbierto(false); }}
                            title="Mis Mensajes"
                        >
                            <i className="bi bi-envelope-fill"></i>
                        </button>

                        <NotificationBell />

                        <button
                            className="btn btn-dark ae-input border-0 px-3 text-start d-flex align-items-center justify-content-between shadow-sm flex-grow-1 flex-md-grow-0"
                            onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                        >
                            <div className="d-flex align-items-center position-relative">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Perfil" className="rounded-circle me-2 object-fit-cover border border-secondary" style={{ width: '32px', height: '32px' }} />
                                ) : (
                                    <i className="bi bi-person-circle me-2 text-secondary fs-4 align-middle"></i>
                                )}
                                <span className="fw-bold text-truncate" style={{ maxWidth: '110px' }}>{usuario?.nombre || 'Usuario'}</span>
                            </div>
                            <i className={`bi bi-chevron-${menuUsuarioAbierto ? 'up' : 'down'} ms-2 text-secondary small`}></i>
                        </button>

                        {menuUsuarioAbierto && (
                            <div
                                className="ae-user-dropdown fade-in position-absolute shadow-lg"
                                style={{ top: '110%', right: '0', minWidth: '220px', zIndex: 9999 }}
                            >
                                <div className="d-grid gap-2">
                                    <button
                                        className="btn btn-outline-light text-start fw-bold py-2 px-3"
                                        onClick={() => { setSeccionActiva('perfil'); setMenuUsuarioAbierto(false); }}
                                    >
                                        <i className="bi bi-person-badge me-2"></i> Mi Perfil
                                    </button>

                                    <button
                                        className="btn btn-danger text-start fw-bold py-2 px-3"
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