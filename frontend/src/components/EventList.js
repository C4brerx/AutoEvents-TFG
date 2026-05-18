import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import EventModal from './EventModal';
import EventMap from './EventMap';
import Flatpickr from "react-flatpickr";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import "flatpickr/dist/themes/dark.css";

// CORRECCIÓN TUTOR: Variable de entorno protegida
const API_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
    ? process.env.REACT_APP_API_URL
    : 'http://localhost/autoevents/backend';

function EventList({ usuario }) {
    const [eventos, setEventos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [pestañaActiva, setPestañaActiva] = useState('todos');

    const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('Todos');
    const [vista, setVista] = useState('lista');

    const [recomendacionIA, setRecomendacionIA] = useState('');
    const [cargandoIA, setCargandoIA] = useState(false);

    const [nuevoEvento, setNuevoEvento] = useState({
        titulo: '', descripcion: '', fecha: null, ubicacion: '', tipo: 'Concentración', aforo_maximo: '', imagen_url: ''
    });
    const [creando, setCreando] = useState(false);
    const [eventoEnEdicion, setEventoEnEdicion] = useState(null);

    const cargarEventos = async () => {
        setCargando(true);
        try {
            const respuesta = await fetch(`${API_URL}/eventos.php`, { method: 'GET', credentials: 'include' });
            const datos = await respuesta.json();
            if (datos.estado === 'exito') setEventos(datos.eventos);
        } catch (error) { console.error(error); } finally { setCargando(false); }
    };

    useEffect(() => { cargarEventos(); }, []);

    const formatearFecha = (fechaString) => {
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(fechaString).toLocaleDateString('es-ES', opciones).replace(',', ' a las');
    };

    const formatearFechaParaSQL = (fechaObj) => {
        if (!fechaObj) return '';
        const offset = fechaObj.getTimezoneOffset() * 60000;
        return (new Date(fechaObj - offset)).toISOString().slice(0, 19).replace('T', ' ');
    };

    const manejarAsistencia = async (idEvento, titulo, apuntadoActualmente) => {
        try {
            const respuesta = await fetch(`${API_URL}/eventos.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accion: 'toggle_asistencia', id_evento: idEvento }),
                credentials: 'include'
            });
            const datos = await respuesta.json();

            if (datos.estado === 'exito') {
                setEventos(eventos.map(ev => {
                    if (ev.id === idEvento) {
                        return { ...ev, apuntado: datos.apuntado ? 1 : 0, asistentes_actuales: datos.apuntado ? parseInt(ev.asistentes_actuales)+1 : parseInt(ev.asistentes_actuales)-1 };
                    }
                    return ev;
                }));

                Swal.fire({
                    title: datos.apuntado ? '¡Plaza reservada!' : 'Cancelado',
                    html: datos.apuntado ? `Te esperamos en:<br><b>${titulo}</b>` : `Te has desapuntado de:<br><b>${titulo}</b>`,
                    icon: datos.apuntado ? 'success' : 'info',
                    background: '#1a1a1a', color: '#fff', confirmButtonColor: '#e60000', timer: 2000, showConfirmButton: false
                });
            } else {
                Swal.fire({ icon: 'error', title: 'Aforo completo', text: datos.mensaje, background: '#1a1a1a', color: '#fff', confirmButtonColor: '#e60000' });
            }
        } catch (error) { console.error(error); }
    };

    const manejarCrearOEditarEvento = async (e) => {
        e.preventDefault();

        if (!nuevoEvento.fecha) {
            Swal.fire({ icon: 'warning', title: 'Falta la fecha', text: 'Por favor selecciona una fecha y hora.', background: '#1a1a1a', color: '#fff' });
            return;
        }

        setCreando(true);
        const datosParaEnviar = { ...nuevoEvento, fecha: formatearFechaParaSQL(nuevoEvento.fecha) };

        try {
            let respuesta;
            if (eventoEnEdicion) {
                datosParaEnviar.id = eventoEnEdicion;
                respuesta = await fetch(`${API_URL}/eventos.php`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosParaEnviar),
                    credentials: 'include'
                });
            } else {
                datosParaEnviar.accion = 'crear_evento';
                respuesta = await fetch(`${API_URL}/eventos.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosParaEnviar),
                    credentials: 'include'
                });
            }

            const datos = await respuesta.json();

            if (datos.estado === 'exito') {
                Swal.fire({ icon: 'success', title: eventoEnEdicion ? '¡Actualizado!' : '¡Hecho!', text: datos.mensaje, background: '#1a1a1a', color: '#fff', confirmButtonColor: '#e60000' });
                setNuevoEvento({ titulo: '', descripcion: '', fecha: null, ubicacion: '', tipo: 'Concentración', aforo_maximo: '', imagen_url: '' });
                setEventoEnEdicion(null);
                setPestañaActiva('todos');
                cargarEventos();
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: datos.mensaje, background: '#1a1a1a', color: '#fff' });
            }
        } catch (error) { console.error(error); } finally { setCreando(false); }
    };

    const manejarAprobarEvento = async (id, e) => {
        e.stopPropagation();
        try {
            const res = await fetch(`${API_URL}/eventos.php`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accion: 'aprobar', id: id }), credentials: 'include'
            });
            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'Evento Aprobado', background: '#1a1a1a', color: '#fff', timer: 1500, showConfirmButton: false });
                cargarEventos();
            }
        } catch (error) { console.error(error); }
    };

    const manejarBorrarEvento = (id, titulo, e) => {
        e.stopPropagation();
        Swal.fire({
            title: '¿Borrar evento?',
            text: `Vas a eliminar "${titulo}" para siempre.`,
            icon: 'warning',
            showCancelButton: true,
            background: '#1a1a1a', color: '#fff',
            confirmButtonColor: '#e60000',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, borrar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`${API_URL}/eventos.php?id=${id}`, { method: 'DELETE', credentials: 'include' });
                    if (res.ok) {
                        Swal.fire({ icon: 'success', title: 'Borrado', background: '#1a1a1a', color: '#fff', timer: 1500, showConfirmButton: false });
                        cargarEventos();
                    }
                } catch (error) {
                    console.error("Error al borrar:", error);
                }
            }
        });
    };

    const pedirRecomendacionIA = async () => {
        setCargandoIA(true);
        setRecomendacionIA('');
        try {
            const respuesta = await fetch(`${API_URL}/recomendar_ia.php`, { method: 'POST', credentials: 'include' });
            const datos = await respuesta.json();

            if (datos.estado === 'exito') {
                setRecomendacionIA(datos.recomendacion);
            } else if (datos.estado === 'info') {
                Swal.fire({ icon: 'info', title: 'Aviso', text: datos.mensaje, background: '#1a1a1a', color: '#fff' });
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: datos.mensaje, background: '#1a1a1a', color: '#fff' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Fallo de conexión con la IA', background: '#1a1a1a', color: '#fff' });
        } finally {
            setCargandoIA(false);
        }
    };

    const eventosFiltrados = eventos.filter(ev => {
        const coincideBusqueda = ev.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
            ev.ubicacion.toLowerCase().includes(busqueda.toLowerCase());
        const coincideTipo = filtroTipo === 'Todos' || ev.tipo === filtroTipo;
        const coincidePestaña = pestañaActiva === 'mis_eventos' ? ev.apuntado == 1 : true;

        return coincideBusqueda && coincideTipo && coincidePestaña;
    });

    return (
        <div>
            <div className="row g-3 mb-4 align-items-center">
                <div className="col-lg-6">
                    <div className="d-flex gap-2 overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
                        <button className={`btn fw-bold px-4 rounded-pill ${pestañaActiva === 'todos' ? 'btn-danger shadow' : 'btn-outline-secondary text-light'}`} onClick={() => setPestañaActiva('todos')}>
                            <i className="bi bi-globe-europe-africa me-2"></i>Descubrir
                        </button>
                        <button className={`btn fw-bold px-4 rounded-pill ${pestañaActiva === 'mis_eventos' ? 'btn-success text-dark shadow' : 'btn-outline-secondary text-light'}`} onClick={() => setPestañaActiva('mis_eventos')}>
                            <i className="bi bi-ticket-perforated-fill me-2"></i>Mis Asistencias
                        </button>

                        <button className={`btn fw-bold px-4 rounded-pill ${pestañaActiva === 'crear' ? 'btn-light text-dark shadow' : 'btn-outline-secondary text-light'}`} onClick={() => {
                            setPestañaActiva('crear'); setEventoEnEdicion(null); setNuevoEvento({ titulo: '', descripcion: '', fecha: null, ubicacion: '', tipo: 'Concentración', aforo_maximo: '', imagen_url: '' });
                        }}>
                            <i className="bi bi-plus-circle-fill me-2"></i>Crear Evento
                        </button>
                    </div>
                </div>

                {pestañaActiva !== 'crear' && (
                    <div className="col-lg-6 d-flex gap-2">
                        <div className="input-group glass-card rounded-pill px-3 border border-secondary flex-grow-1">
                            <span className="input-group-text bg-transparent border-0 text-secondary"><i className="bi bi-search"></i></span>
                            <input
                                type="text"
                                className="form-control bg-transparent border-0 text-white shadow-none"
                                placeholder="Buscar por título o ciudad..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>

                        <div className="btn-group glass-card rounded-pill border border-secondary p-1 shadow-sm">
                            <button className={`btn rounded-pill px-3 ${vista === 'lista' ? 'btn-light text-dark fw-bold' : 'text-secondary border-0'}`} onClick={() => setVista('lista')}>
                                <i className="bi bi-grid-fill"></i>
                            </button>
                            <button className={`btn rounded-pill px-3 ${vista === 'mapa' ? 'btn-light text-dark fw-bold' : 'text-secondary border-0'}`} onClick={() => setVista('mapa')}>
                                <i className="bi bi-map-fill"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {pestañaActiva !== 'crear' && (
                <div className="d-flex gap-2 mb-4 flex-wrap">
                    {['Todos', 'Concentración', 'Trackday', 'Ruta', 'Exposición'].map(tipo => (
                        <span
                            key={tipo}
                            className={`badge rounded-pill cursor-pointer py-2 px-3 border transition-all ${filtroTipo === tipo ? 'bg-danger border-danger shadow-sm' : 'bg-dark border-secondary text-secondary'}`}
                            onClick={() => setFiltroTipo(tipo)}
                        >
                            {tipo}
                        </span>
                    ))}
                    <span className="ms-auto text-secondary small align-self-center">
                        Mostrando {eventosFiltrados.length} evento(s)
                    </span>
                </div>
            )}

            {cargando && <div className="text-center py-5"><div className="spinner-border text-danger" role="status"></div></div>}

            {pestañaActiva !== 'crear' && (
                <div className="mb-4 fade-in">
                    {!recomendacionIA && !cargandoIA && (
                        <button className="btn btn-outline-warning fw-bold rounded-pill shadow-sm border border-warning" onClick={pedirRecomendacionIA}>
                            <i className="bi bi-robot me-2"></i> IA: ¿A qué evento debería ir?
                        </button>
                    )}

                    {cargandoIA && (
                        <div className="alert bg-dark border-warning text-warning rounded-4 shadow-sm">
                            <span className="spinner-grow spinner-grow-sm me-3" role="status"></span>
                            Analizando tu garaje y buscando los mejores eventos para ti...
                        </div>
                    )}

                    {recomendacionIA && !cargandoIA && (
                        <div className="alert bg-black bg-opacity-75 border border-warning rounded-4 shadow-lg position-relative p-4">
                            <button className="btn btn-sm text-secondary position-absolute top-0 end-0 m-2" onClick={() => setRecomendacionIA('')}><i className="bi bi-x-lg"></i></button>
                            <h5 className="text-warning fw-bold mb-3"><i className="bi bi-robot me-2"></i>Recomendación Personalizada</h5>
                            <p className="text-light m-0 fst-italic" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>"{recomendacionIA}"</p>
                        </div>
                    )}
                </div>
            )}

            {!cargando && pestañaActiva === 'crear' && (
                <div className="card glass-card border-0 p-5 fade-in shadow-lg">
                    <h3 className="fw-bold text-ae-theme mb-4">
                        <i className={`bi ${eventoEnEdicion ? 'bi-pencil-square' : 'bi-calendar-plus'} me-2`}></i>
                        {eventoEnEdicion ? 'Editar Evento' : 'Organizar Nuevo Evento'}
                    </h3>
                    <form onSubmit={manejarCrearOEditarEvento} className="row g-3">
                        <div className="col-md-8"><label className="text-light">Título del Evento *</label><input type="text" className="form-control ae-input" required value={nuevoEvento.titulo} onChange={e => setNuevoEvento({...nuevoEvento, titulo: e.target.value})} /></div>
                        <div className="col-md-4"><label className="text-light">Tipo *</label><select className="form-select ae-input" value={nuevoEvento.tipo} onChange={e => setNuevoEvento({...nuevoEvento, tipo: e.target.value})}><option>Concentración</option><option>Trackday</option><option>Ruta</option><option>Exposición</option></select></div>

                        <div className="col-md-6">
                            <label className="text-light">Fecha y Hora *</label>
                            <div className="position-relative">
                                <Flatpickr
                                    data-enable-time
                                    value={nuevoEvento.fecha}
                                    onChange={([date]) => setNuevoEvento({...nuevoEvento, fecha: date})}
                                    options={{ locale: Spanish, dateFormat: "d/m/Y - H:i", time_24hr: true, minDate: "today", disableMobile: true }}
                                    className="form-control ae-input cursor-pointer ps-5"
                                    placeholder="Selecciona fecha y hora..."
                                />
                                <i className="bi bi-calendar-event text-secondary position-absolute top-50 start-0 translate-middle-y ms-3"></i>
                            </div>
                        </div>

                        <div className="col-md-6"><label className="text-light">Ubicación *</label><input type="text" className="form-control ae-input" placeholder="Ej: Circuito de Jerez" required value={nuevoEvento.ubicacion} onChange={e => setNuevoEvento({...nuevoEvento, ubicacion: e.target.value})} /></div>
                        <div className="col-12"><label className="text-light">Descripción Corta</label><textarea className="form-control ae-input" rows="2" required value={nuevoEvento.descripcion} onChange={e => setNuevoEvento({...nuevoEvento, descripcion: e.target.value})}></textarea></div>
                        <div className="col-md-4"><label className="text-light">Aforo Máximo</label><input type="number" className="form-control ae-input" placeholder="Opcional" value={nuevoEvento.aforo_maximo} onChange={e => setNuevoEvento({...nuevoEvento, aforo_maximo: e.target.value})} /></div>
                        <div className="col-md-8"><label className="text-light">URL de la Imagen (Opcional)</label><input type="url" className="form-control ae-input" placeholder="https://..." value={nuevoEvento.imagen_url} onChange={e => setNuevoEvento({...nuevoEvento, imagen_url: e.target.value})} /></div>
                        <div className="col-12 text-end mt-4"><button type="submit" className={`btn ${eventoEnEdicion ? 'btn-warning text-dark' : 'ae-btn-primary'} fw-bold px-5 py-2`} disabled={creando}>{creando ? 'Guardando...' : (eventoEnEdicion ? 'Guardar Cambios' : 'Enviar Solicitud')}</button></div>
                    </form>
                </div>
            )}

            {eventoSeleccionado && (
                <EventModal
                    evento={eventos.find(e => e.id === eventoSeleccionado) || null}
                    onClose={() => setEventoSeleccionado(null)}
                    onAsistir={manejarAsistencia}
                    formatearFecha={formatearFecha}
                />
            )}

            {!cargando && pestañaActiva !== 'crear' && (
                <>
                    {eventosFiltrados.length === 0 ? (
                        <div className="alert bg-dark border-secondary text-center text-light p-5 rounded-4 mt-4 fade-in">
                            <i className="bi bi-search fs-1 text-secondary mb-3 d-block"></i>
                            <h4 className="fw-bold">No se encontraron eventos</h4>
                            <p className="text-secondary">Prueba a usar otros términos de búsqueda o cambiar de categoría.</p>
                        </div>
                    ) : (
                        vista === 'mapa' ? (
                            <div className="mb-5 fade-in">
                                <EventMap eventos={eventosFiltrados} onAbrirModal={setEventoSeleccionado} />
                            </div>
                        ) : (
                            <div className="row g-4 fade-in">
                                {eventosFiltrados.map(() => (
                                    <div className="col-md-6 col-xl-4" key={evento.id}>
                                        <div
                                            className="card bg-dark text-white border-0 glass-card h-100 overflow-hidden shadow-lg event-card cursor-pointer position-relative"
                                            onClick={() => setEventoSeleccionado(evento.id)}
                                        >
                                            {evento.estado === 'pendiente' && (
                                                <div className="position-absolute top-50 start-50 translate-middle badge bg-warning text-dark fs-5 shadow-lg p-3 rounded-4 w-75 text-center text-wrap" style={{ zIndex: 20 }}>
                                                    <i className="bi bi-hourglass-split me-2"></i>Pendiente de Aprobación
                                                </div>
                                            )}

                                            {usuario?.rol === 'admin' && (
                                                <div className="position-absolute top-0 start-0 m-2 d-flex gap-2" style={{ zIndex: 10 }}>
                                                    {evento.estado === 'pendiente' && (
                                                        <button className="btn btn-sm btn-success shadow" title="Aprobar Evento" onClick={(e) => manejarAprobarEvento(evento.id, e)}>
                                                            <i className="bi bi-check-lg"></i> Aprobar
                                                        </button>
                                                    )}
                                                    <button className="btn btn-sm btn-warning shadow" onClick={(e) => {
                                                        e.stopPropagation();
                                                        setNuevoEvento({ titulo: evento.titulo, descripcion: evento.descripcion, fecha: new Date(evento.fecha), ubicacion: evento.ubicacion, tipo: evento.tipo, aforo_maximo: evento.aforo_maximo || '', imagen_url: evento.imagen_url || '' });
                                                        setEventoEnEdicion(evento.id);
                                                        setPestañaActiva('crear');
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}><i className="bi bi-pencil-fill"></i></button>
                                                    <button className="btn btn-sm btn-danger shadow" onClick={(e) => manejarBorrarEvento(evento.id, evento.titulo, e)}>
                                                        <i className="bi bi-trash-fill"></i>
                                                    </button>
                                                </div>
                                            )}

                                            <div className="position-relative">
                                                <img
                                                    src={evento.imagen_url || 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=600'}
                                                    className={`card-img-top object-fit-cover ${evento.estado === 'pendiente' ? 'opacity-25' : ''}`}
                                                    alt={evento.titulo}
                                                    style={{ height: '220px' }}
                                                />
                                                <span className="position-absolute top-0 end-0 m-3 badge bg-dark border border-secondary fs-6 shadow opacity-75">{evento.tipo}</span>
                                            </div>

                                            <div className={`card-body p-4 d-flex flex-column ${evento.estado === 'pendiente' ? 'opacity-50' : ''}`}>
                                                <h5 className="card-title fw-bold text-white mb-2 text-truncate">{evento.titulo}</h5>
                                                <p className="card-text text-secondary mb-4 flex-grow-1" style={{ fontSize: '0.90rem' }}>{evento.descripcion}</p>

                                                <div className="mb-4 bg-black bg-opacity-25 p-3 rounded border border-white-10">
                                                    <div className="mb-2 text-light small text-truncate"><i className="bi bi-calendar-event text-danger me-2"></i><span className="text-capitalize">{formatearFecha(evento.fecha)}</span></div>
                                                    <div className="mb-2 text-light small text-truncate"><i className="bi bi-geo-alt-fill text-danger me-2"></i>{evento.ubicacion}</div>
                                                    <div className="text-light small"><i className="bi bi-people-fill text-danger me-2"></i>{evento.asistentes_actuales} / {evento.aforo_maximo || '∞'} asistentes</div>
                                                </div>

                                                <button
                                                    className={`btn w-100 fw-bold py-2 mt-auto text-uppercase shadow ${evento.apuntado == 1 ? 'btn-success text-dark' : 'ae-btn-primary'}`}
                                                    disabled={evento.estado === 'pendiente'}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        manejarAsistencia(evento.id, evento.titulo, evento.apuntado);
                                                    }}
                                                >
                                                    {evento.apuntado == 1 ? <><i className="bi bi-check-circle-fill me-2"></i>Asistiré</> : <><i className="bi bi-ticket-perforated-fill me-2"></i>Me Apunto</>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
}

export default EventList;