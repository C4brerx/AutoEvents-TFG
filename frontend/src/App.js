import React, { useState, useEffect } from 'react';
import './styles/App.css';

function App() {
    const [vista, setVista] = useState('login');
    const [seccionActiva, setSeccionActiva] = useState('inicio');

    const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
    const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [tipoAlerta, setTipoAlerta] = useState('');
    const [usuario, setUsuario] = useState(null);

    const [vehiculos, setVehiculos] = useState([]);
    const [mostrandoFormularioCoche, setMostrandoFormularioCoche] = useState(false);

    const [nuevoCoche, setNuevoCoche] = useState({ marca: '', modelo: '', anio: '', motor: '', especificaciones: '' });
    const [cocheEnEdicion, setCocheEnEdicion] = useState(null);
    const [archivosFotos, setArchivosFotos] = useState([]);

    const [cocheDetalleVista, setCocheDetalleVista] = useState(null);

    // ¡NUEVO! Variable de React para controlar el carrusel
    const [indiceFotoModal, setIndiceFotoModal] = useState(0);

    const marcasCoches = [
        "Abarth", "Alfa Romeo", "Alpine", "Aston Martin", "Audi", "Bentley", "BMW", "Bugatti", "Chevrolet",
        "Citroën", "Cupra", "Dacia", "DS", "Ferrari", "Fiat", "Ford", "Honda", "Hyundai", "Jaguar", "Jeep",
        "Kia", "Koenigsegg", "Lamborghini", "Lancia", "Land Rover", "Lexus", "Lotus", "Maserati", "Mazda",
        "McLaren", "Mercedes-Benz", "MG", "Mini", "Mitsubishi", "Nissan", "Pagani", "Peugeot", "Polestar",
        "Porsche", "Renault", "Rolls-Royce", "Seat", "Skoda", "Smart", "Subaru", "Suzuki", "Tesla", "Toyota",
        "Volkswagen", "Volvo"
    ];

    const cargarVehiculos = async () => {
        if (!usuario) return;
        try {
            const respuesta = await fetch(`http://localhost/autoevents/backend/vehiculos.php?usuario_id=${usuario.id}`);
            const datos = await respuesta.json();
            if (datos.estado === 'exito') setVehiculos(datos.vehiculos);
        } catch (error) { console.error("Error al cargar vehículos", error); }
    };

    useEffect(() => {
        if (seccionActiva === 'garaje') cargarVehiculos();
    }, [seccionActiva]);

    const manejarRegistroCoche = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('usuario_id', usuario.id);
        formData.append('marca', nuevoCoche.marca);
        formData.append('modelo', nuevoCoche.modelo);
        formData.append('anio', nuevoCoche.anio);
        formData.append('motor', nuevoCoche.motor);
        formData.append('especificaciones', nuevoCoche.especificaciones);

        if (cocheEnEdicion) formData.append('id', cocheEnEdicion);

        for (let i = 0; i < archivosFotos.length; i++) {
            if (i >= 4) break;
            formData.append('fotos[]', archivosFotos[i]);
        }

        try {
            const respuesta = await fetch('http://localhost/autoevents/backend/vehiculos.php', {
                method: 'POST',
                body: formData,
            });
            const resultado = await respuesta.json();

            if (respuesta.ok) {
                setMostrandoFormularioCoche(false);
                setNuevoCoche({ marca: '', modelo: '', anio: '', motor: '', especificaciones: '' });
                setCocheEnEdicion(null);
                setArchivosFotos([]);
                cargarVehiculos();
            } else {
                alert(resultado.mensaje);
            }
        } catch (error) { console.error("Error", error); }
    };

    const eliminarCoche = async (idCoche) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este vehículo?")) {
            try {
                const respuesta = await fetch(`http://localhost/autoevents/backend/vehiculos.php?id=${idCoche}`, { method: 'DELETE' });
                if (respuesta.ok) {
                    setCocheDetalleVista(null);
                    cargarVehiculos();
                }
            } catch (error) { console.error("Error", error); }
        }
    };

    const iniciarEdicion = (coche) => {
        setNuevoCoche({ marca: coche.marca, modelo: coche.modelo, anio: coche.anio, motor: coche.motor || '', especificaciones: coche.especificaciones || '' });
        setCocheEnEdicion(coche.id);
        setArchivosFotos([]);
        setCocheDetalleVista(null);
        setMostrandoFormularioCoche(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Funciones manuales para pasar fotos
    const fotoAnterior = (totalFotos) => {
        setIndiceFotoModal(prev => (prev === 0 ? totalFotos - 1 : prev - 1));
    };

    const fotoSiguiente = (totalFotos) => {
        setIndiceFotoModal(prev => (prev === totalFotos - 1 ? 0 : prev + 1));
    };

    const manejarSubmit = async (e) => {
        e.preventDefault();
        const endpoint = vista === 'login' ? 'login.php' : 'registro.php';
        const datosEnvio = vista === 'login' ? { email, password } : { nombre, email, password };

        try {
            const respuesta = await fetch(`http://localhost/autoevents/backend/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosEnvio),
            });
            const resultado = await respuesta.json();

            if (respuesta.ok) {
                setTipoAlerta('success');
                setMensaje(resultado.mensaje);
                if (vista === 'login') {
                    setUsuario(resultado.usuario);
                    setVista('app');
                    setSeccionActiva('inicio');
                } else {
                    setNombre(''); setPassword(''); setVista('login');
                }
            } else {
                setTipoAlerta('danger'); setMensaje(resultado.mensaje);
            }
        } catch (error) { setTipoAlerta('danger'); setMensaje('Error de conexión.'); }
    };

    if (vista === 'app' && usuario) {
        return (
            <div className="dashboard-animated-bg" style={{ position: 'relative' }}>

                {/* VENTANA EMERGENTE (MODAL) */}
                {cocheDetalleVista && (
                    <div className="fade-in" style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                    }}>
                        <div className="glass-card rounded-4 p-0 overflow-hidden" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                            <div className="d-flex justify-content-between align-items-center p-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                <h3 className="fw-bold m-0 text-white">{cocheDetalleVista.marca} <span style={{ color: 'var(--ae-red)' }}>{cocheDetalleVista.modelo}</span> ({cocheDetalleVista.anio})</h3>
                                <button className="btn btn-sm btn-outline-light border-0" onClick={() => setCocheDetalleVista(null)}>
                                    <i className="bi bi-x-lg" style={{ fontSize: '1.5rem' }}></i>
                                </button>
                            </div>

                            <div className="p-0 overflow-auto">
                                {/* NUEVO CARRUSEL PROGRAMADO EN REACT */}
                                {cocheDetalleVista.fotos ? (
                                    <div className="position-relative">
                                        {/* Mostramos solo la foto que toca */}
                                        <img
                                            src={`http://localhost/autoevents/backend/uploads/${cocheDetalleVista.fotos.split(',')[indiceFotoModal]}`}
                                            className="d-block w-100"
                                            alt="Coche"
                                            style={{ height: '400px', objectFit: 'cover' }}
                                        />

                                        {/* Botones si hay más de 1 foto */}
                                        {cocheDetalleVista.fotos.split(',').length > 1 && (
                                            <>
                                                <button
                                                    className="carousel-control-prev"
                                                    type="button"
                                                    onClick={() => fotoAnterior(cocheDetalleVista.fotos.split(',').length)}
                                                >
                                                    <span className="carousel-control-prev-icon"></span>
                                                </button>
                                                <button
                                                    className="carousel-control-next"
                                                    type="button"
                                                    onClick={() => fotoSiguiente(cocheDetalleVista.fotos.split(',').length)}
                                                >
                                                    <span className="carousel-control-next-icon"></span>
                                                </button>

                                                {/* Puntitos indicadores */}
                                                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex gap-2">
                                                    {cocheDetalleVista.fotos.split(',').map((_, idx) => (
                                                        <div key={idx} style={{
                                                            width: '10px', height: '10px', borderRadius: '50%',
                                                            backgroundColor: indiceFotoModal === idx ? 'var(--ae-red)' : 'rgba(255,255,255,0.5)',
                                                            transition: 'background-color 0.3s'
                                                        }}></div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ height: '300px', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="bi bi-camera text-secondary" style={{ fontSize: '4rem' }}></i>
                                    </div>
                                )}

                                <div className="p-4 text-light">
                                    <h5 className="fw-bold text-secondary mb-3"><i className="bi bi-info-circle me-2"></i>Información Técnica</h5>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="p-3 bg-dark rounded border border-secondary">
                                                <p className="m-0 text-secondary" style={{ fontSize: '0.8rem' }}>MOTOR</p>
                                                <p className="m-0 fw-bold">{cocheDetalleVista.motor || 'No especificado'}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="p-3 bg-dark rounded border border-secondary">
                                                <p className="m-0 text-secondary" style={{ fontSize: '0.8rem' }}>ESPECIFICACIONES / MODS</p>
                                                <p className="m-0 fw-bold">{cocheDetalleVista.especificaciones || 'Coche de serie'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-dark d-flex justify-content-end gap-2 border-top" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                <button className="btn btn-outline-light" onClick={() => iniciarEdicion(cocheDetalleVista)}><i className="bi bi-pencil me-2"></i>Editar Vehículo</button>
                                <button className="btn btn-outline-danger" onClick={() => eliminarCoche(cocheDetalleVista.id)}><i className="bi bi-trash me-2"></i>Eliminar</button>
                            </div>
                        </div>
                    </div>
                )}


                <nav className="navbar navbar-expand-lg navbar-dark sticky-top glass-card" style={{ borderBottom: '1px solid var(--ae-red)', zIndex: 1000 }}>
                    <div className="container">
                        <span className="navbar-brand fw-bold ae-title m-0" style={{ fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setSeccionActiva('inicio')}>
                            Auto<span>Events</span>
                        </span>
                        <button className="navbar-toggler border-0 shadow-none" type="button" onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}>
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className={`collapse navbar-collapse ${menuMovilAbierto ? 'show' : ''}`}>
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 mt-3 mt-lg-0">
                                <li className="nav-item">
                                    <span className={`nav-link ${seccionActiva === 'inicio' ? 'active text-white fw-bold' : ''}`} style={{ cursor: 'pointer' }} onClick={() => { setSeccionActiva('inicio'); setMenuMovilAbierto(false); }}>
                                        <i className="bi bi-house-door me-1"></i> Inicio
                                    </span>
                                </li>
                                <li className="nav-item">
                                    <span className={`nav-link ${seccionActiva === 'garaje' ? 'active text-white fw-bold' : ''}`} style={{ cursor: 'pointer' }} onClick={() => { setSeccionActiva('garaje'); setMenuMovilAbierto(false); }}>
                                        <i className="bi bi-car-front me-1"></i> Mi Garaje
                                    </span>
                                </li>
                            </ul>
                            <div className="d-flex align-items-center mt-2 mt-lg-0 position-relative">
                                <button className="btn btn-dark ae-input border-0 px-3 w-100 text-start" onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}>
                                    <i className="bi bi-person-circle me-2"></i> {usuario.nombre} <i className={`bi bi-chevron-${menuUsuarioAbierto ? 'up' : 'down'} ms-1`} style={{ fontSize: '0.8rem' }}></i>
                                </button>
                                <ul className={`dropdown-menu dropdown-menu-dark dropdown-menu-end glass-card mt-2 border-0 shadow-lg ${menuUsuarioAbierto ? 'show' : ''}`} style={{ position: 'absolute', top: '100%', right: 0, minWidth: '200px' }}>
                                    <li><span className="dropdown-item fw-semibold text-light" style={{ cursor: 'pointer' }}><i className="bi bi-gear me-2"></i>Ajustes</span></li>
                                    <li><hr className="dropdown-divider" style={{ borderColor: 'var(--ae-nardo)' }}/></li>
                                    <li><span className="dropdown-item text-danger fw-bold" style={{ cursor: 'pointer' }} onClick={() => setVista('login')}><i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="container py-5">
                    {/* INICIO */}
                    {seccionActiva === 'inicio' && (
                        <div className="fade-in">
                            <h2 className="fw-bold mb-4" style={{ color: 'var(--ae-text)' }}>Últimas Noticias</h2>
                            <div className="row g-4">
                                <div className="col-md-6 col-lg-4">
                                    <div className="card bg-dark text-white border-0 glass-card car-card overflow-hidden h-100">
                                        <img src="https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800" className="card-img-top" alt="Coche Deportivo" style={{ height: '200px', objectFit: 'cover' }} />
                                        <div className="card-body">
                                            <span className="badge bg-danger mb-2">Eventos</span>
                                            <h5 className="card-title fw-bold">Trackday Jarama</h5>
                                            <p className="card-text text-secondary" style={{ fontSize: '0.9rem' }}>Evento exclusivo para deportivos este fin de semana.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 col-lg-4">
                                    <div className="card bg-dark text-white border-0 glass-card car-card overflow-hidden h-100">
                                        <img src="https://images.pexels.com/photos/3136695/pexels-photo-3136695.jpeg?auto=compress&cs=tinysrgb&w=800" className="card-img-top" alt="Coche Tuning" style={{ height: '200px', objectFit: 'cover' }} />
                                        <div className="card-body">
                                            <span className="badge bg-primary mb-2">Comunidad</span>
                                            <h5 className="card-title fw-bold">Galeria JDM Semanal</h5>
                                            <p className="card-text text-secondary" style={{ fontSize: '0.9rem' }}>Descubre las mejores modificaciones de nuestros usuarios.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* GARAJE */}
                    {seccionActiva === 'garaje' && (
                        <div className="fade-in">
                            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                                <h2 className="fw-bold m-0" style={{ color: 'var(--ae-text)' }}>Mi Garaje Virtual</h2>
                                <button
                                    className={`btn ${mostrandoFormularioCoche && !cocheEnEdicion ? 'btn-outline-danger' : 'ae-btn-primary'} fw-bold px-4 shadow`}
                                    onClick={() => {
                                        if (mostrandoFormularioCoche) {
                                            setMostrandoFormularioCoche(false);
                                            setCocheEnEdicion(null);
                                            setNuevoCoche({ marca: '', modelo: '', anio: '', motor: '', especificaciones: '' });
                                            setArchivosFotos([]);
                                        } else {
                                            setMostrandoFormularioCoche(true);
                                        }
                                    }}
                                >
                                    {mostrandoFormularioCoche && !cocheEnEdicion ? 'Cancelar Registro' : <><i className="bi bi-plus-lg me-2"></i>Añadir Vehículo</>}
                                </button>
                            </div>

                            {/* FORMULARIO */}
                            {mostrandoFormularioCoche && (
                                <div className="card glass-card border-0 mb-5 fade-in p-4 shadow-lg" style={{ borderTop: `4px solid ${cocheEnEdicion ? '#ffc107' : 'var(--ae-red)'}` }}>
                                    <h4 className="fw-bold mb-4" style={{ color: 'var(--ae-text)' }}>
                                        {cocheEnEdicion ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo'}
                                    </h4>

                                    <form onSubmit={manejarRegistroCoche} className="row g-3">
                                        <div className="col-md-3">
                                            <label className="form-label text-light">Marca</label>
                                            <select className="form-select ae-input" required value={nuevoCoche.marca} onChange={e => setNuevoCoche({...nuevoCoche, marca: e.target.value})}>
                                                <option value="">Selecciona...</option>
                                                {marcasCoches.map(marca => <option key={marca} value={marca}>{marca}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label text-light">Modelo</label>
                                            <input type="text" className="form-control ae-input" placeholder="Ej: M4 Competition" required value={nuevoCoche.modelo} onChange={e => setNuevoCoche({...nuevoCoche, modelo: e.target.value})} />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label text-light">Año</label>
                                            <input type="number" min="1900" max="2026" className="form-control ae-input" placeholder="Ej: 2022" required value={nuevoCoche.anio} onChange={e => setNuevoCoche({...nuevoCoche, anio: e.target.value})} />
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label text-light">Subir Fotos (Máx 4)</label>
                                            <input type="file" className="form-control ae-input" multiple accept="image/*" onChange={e => setArchivosFotos(e.target.files)} />
                                            {archivosFotos.length > 0 ? (
                                                <small className="text-success fw-bold d-block mt-1"><i className="bi bi-check-circle me-1"></i> ¡{archivosFotos.length} foto(s) seleccionadas!</small>
                                            ) : (
                                                <small className="text-secondary" style={{fontSize: '0.75rem'}}>Selecciona varias a la vez (Ctrl + Clic)</small>
                                            )}
                                        </div>

                                        <div className="col-md-4 mt-3">
                                            <label className="form-label text-light">Motor</label>
                                            <input type="text" className="form-control ae-input" placeholder="Ej: 3.0L S58 Twin Turbo" value={nuevoCoche.motor} onChange={e => setNuevoCoche({...nuevoCoche, motor: e.target.value})} />
                                        </div>
                                        <div className="col-md-8 mt-3">
                                            <label className="form-label text-light">Especificaciones / Modificaciones</label>
                                            <input type="text" className="form-control ae-input" placeholder="Ej: Escape Akrapovic, Suspensión KW V3..." value={nuevoCoche.especificaciones} onChange={e => setNuevoCoche({...nuevoCoche, especificaciones: e.target.value})} />
                                        </div>

                                        <div className="col-12 text-end mt-4">
                                            <button type="submit" className={`btn ${cocheEnEdicion ? 'btn-warning' : 'btn-light'} fw-bold text-dark px-5`}>
                                                <i className="bi bi-save me-2"></i>{cocheEnEdicion ? 'Guardar Cambios' : 'Guardar Vehículo'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* TARJETAS LIMPIAS */}
                            <div className="row g-4">
                                {vehiculos.length === 0 && !mostrandoFormularioCoche ? (
                                    <div className="col-12 text-center py-5">
                                        <i className="bi bi-car-front text-secondary mb-3" style={{ fontSize: '4rem' }}></i>
                                        <h4 className="text-secondary">Tu garaje está vacío.</h4>
                                    </div>
                                ) : (
                                    vehiculos.map((coche) => {
                                        const primeraFoto = coche.fotos ? coche.fotos.split(',')[0] : null;

                                        return (
                                            <div className="col-md-6 col-lg-4" key={coche.id}>
                                                <div
                                                    className="card bg-dark text-white border-0 glass-card car-card h-100 p-0 overflow-hidden shadow-sm"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => {
                                                        setCocheDetalleVista(coche);
                                                        setIndiceFotoModal(0); // Reiniciamos el carrusel a la primera foto al abrir
                                                    }}
                                                >
                                                    {primeraFoto ? (
                                                        <img src={`http://localhost/autoevents/backend/uploads/${primeraFoto}`} className="card-img-top" alt="Coche" style={{ height: '240px', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ height: '240px', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <i className="bi bi-camera text-secondary" style={{ fontSize: '3rem' }}></i>
                                                        </div>
                                                    )}

                                                    <div className="card-body p-3 text-center">
                                                        <h4 className="fw-bold m-0">{coche.marca} <span style={{ color: 'var(--ae-red)' }}>{coche.modelo}</span></h4>
                                                        <span className="badge bg-secondary mt-2">{coche.anio}</span>
                                                        <p className="text-secondary mt-3 mb-0" style={{ fontSize: '0.8rem' }}><i className="bi bi-hand-index-thumb me-1"></i>Clic para ver detalles</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )})
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // LOGIN
    return (
        <div className="animated-background px-3">
            <div className="text-center mb-4">
                <h1 className="display-4 fw-bold shadow-sm ae-title">Auto<span>Events</span></h1>
            </div>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-5">
                        <div className="card rounded-4 glass-card">
                            <div className="card-body p-5">
                                <h3 className="text-center mb-4 fw-bold" style={{ color: 'var(--ae-text)' }}>
                                    {vista === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}<span style={{ color: 'var(--ae-red)' }}>.</span>
                                </h3>
                                {mensaje && <div className={`alert alert-${tipoAlerta} text-center fw-bold`} role="alert">{mensaje}</div>}
                                <form onSubmit={manejarSubmit}>
                                    {vista === 'registro' && (
                                        <div className="mb-3">
                                            <label className="form-label text-light fw-semibold">Nombre completo</label>
                                            <input type="text" className="form-control ae-input shadow-none" value={nombre} onChange={(e) => setNombre(e.target.value)} required={vista === 'registro'} />
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label text-light fw-semibold">Correo electrónico</label>
                                        <input type="email" className="form-control ae-input shadow-none" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label text-light fw-semibold">Contraseña</label>
                                        <input type="password" className="form-control ae-input shadow-none" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                    </div>
                                    <button type="submit" className="btn w-100 py-2 fw-bold rounded-3 mb-3 ae-btn-primary">
                                        {vista === 'login' ? 'ENTRAR' : 'REGISTRARSE'}
                                    </button>
                                </form>
                                <hr style={{ borderColor: 'var(--ae-nardo)' }} className="my-4"/>
                                <p className="text-center mb-0 text-light">
                                    {vista === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes una cuenta? '}
                                    <span className="ae-link" onClick={() => { setVista(vista === 'login' ? 'registro' : 'login'); setMensaje(''); }}>
                                        {vista === 'login' ? 'Regístrate aquí' : 'Inicia sesión'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;