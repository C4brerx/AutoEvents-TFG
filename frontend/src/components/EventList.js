import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import EventModal from './EventModal';
import EventMap from './EventMap'; // <-- El componente del mapa
import Flatpickr from "react-flatpickr";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import "flatpickr/dist/themes/dark.css";

function EventList() {
    const [eventos, setEventos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [pestañaActiva, setPestañaActiva] = useState('todos');

    const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

    // --- ESTADOS PARA EL BUSCADOR Y FILTROS ---
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('Todos');

    const [vista, setVista] = useState('lista'); // 'lista' o 'mapa'

    // --- ESTADOS PARA LA IA ---
    const [recomendacionIA, setRecomendacionIA] = useState('');
    const [cargandoIA, setCargandoIA] = useState(false);

    const [nuevoEvento, setNuevoEvento] = useState({
        titulo: '', descripcion: '', fecha: null, ubicacion: '', tipo: 'Concentración', aforo_maximo: '', imagen_url: ''
    });
    const [creando, setCreando] = useState(false);

    const cargarEventos = async () => {
        setCargando(true);
        try {
            const respuesta = await fetch('http://localhost/autoevents/backend/eventos.php', { method: 'GET', credentials: 'include' });
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
            const respuesta = await fetch('http://localhost/autoevents/backend/eventos.php', {
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
            }
        } catch (error) { console.error(error); }
    };

    const manejarCrearEvento = async (e) => {
        e.preventDefault();

        if (!nuevoEvento.fecha) {
            Swal.fire({ icon: 'warning', title: 'Falta la fecha', text: 'Por favor selecciona una fecha y hora para el evento.', background: '#1a1a1a', color: '#fff' });
            return;
        }

        setCreando(true);

        const datosParaEnviar = {
            ...nuevoEvento,
            fecha: formatearFechaParaSQL(nuevoEvento.fecha)
        };

        try {
            const respuesta = await fetch('http://localhost/autoevents/backend/eventos.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accion: 'crear_evento', ...datosParaEnviar }),
                credentials: 'include'
            });
            const datos = await respuesta.json();

            if (datos.estado === 'exito') {
                Swal.fire({ icon: 'success', title: '¡Evento Creado!', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#e60000', timer: 2000 });
                setNuevoEvento({ titulo: '', descripcion: '', fecha: null, ubicacion: '', tipo: 'Concentración', aforo_maximo: '', imagen_url: '' });
                setPestañaActiva('todos');
                cargarEventos();
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: datos.mensaje, background: '#1a1a1a', color: '#fff' });
            }
        } catch (error) { console.error(error); } finally { setCreando(false); }
    };

    const pedirRecomendacionIA = async () => {
        setCargandoIA(true);
        setRecomendacionIA('');
        try {
            const respuesta = await fetch('http://localhost/autoevents/backend/recomendar_ia.php', { method: 'POST', credentials: 'include' });
            const datos = await respuesta.json();

            if (datos.estado === 'exito') {
                setRecomendacionIA(datos.recomendacion);
            } else if (datos.estado === 'info') {
                Swal.fire({ icon: 'info', title: 'Aviso', text: datos.mensaje, background: '#1a1a1a', color: '#fff' });
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: datos.mensaje, background: '#1a1a1a', color: '#fff' });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Fallo de conexión con la IA', background: '#1a1a1a', color: '#fff' });
        } finally {
            setCargandoIA(false);
        }
    };

    // --- LÓGICA DE FILTRADO EN TIEMPO REAL ---
    const eventosFiltrados = eventos.filter(ev => {
        const coincideBusqueda = ev.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
            ev.ubicacion.toLowerCase().includes(busqueda.toLowerCase());
        const coincideTipo = filtroTipo === 'Todos' || ev.tipo === filtroTipo;
        const coincidePestaña = pestañaActiva === 'mis_eventos' ? ev.apuntado == 1 : true;

        return coincideBusqueda && coincideTipo && coincidePestaña;
    });

    return (
        <div>
            {/* SUBMENÚ DE EVENTOS Y BARRA DE BÚSQUEDA */}
            <div className="row g-3 mb-4 align-items-center">
                <div className="col-lg-6">
                    <div className="d-flex gap-2 overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
                        <button className={`btn fw-bold px-4 rounded-pill ${pestañaActiva === 'todos' ? 'btn-danger shadow' : 'btn-outline-secondary text-light'}`} onClick={() => setPestañaActiva('todos')}>
                            <i className="bi bi-globe-europe-africa me-2"></i>Descubrir
                        </button>
                        <button className={`btn fw-bold px-4 rounded-pill ${pestañaActiva === 'mis_eventos' ? 'btn-success text-dark shadow' : 'btn-outline-secondary text-light'}`} onClick={() => setPestañaActiva('mis_eventos')}>
                            <i className="bi bi-ticket-perforated-fill me-2"></i>Mis Asistencias
                        </button>
                        <button className={`btn fw-bold px-4 rounded-pill ${pestañaActiva === 'crear' ? 'btn-light text-dark shadow' : 'btn-outline-secondary text-light'}`} onClick={() => setPestañaActiva('crear')}>
                            <i className="bi bi-plus-circle-fill me-2"></i>Crear Evento
                        </button>
                    </div>
                </div>

                {/* BUSCADOR Y TOGGLE MAPA/LISTA */}
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

                        {/* INTERRUPTOR LISTA / MAPA */}
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

            {/* CHIPS DE FILTRO POR CATEGORÍA */}
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

            {/* PANEL DE RECOMENDACIÓN IA  */}
            {pestañaActiva !== 'crear' && (
                <div className="mb-4 fade-in">
                    {!recomendacionIA && !cargandoIA && (
                        <button
                            className="btn btn-outline-warning fw-bold rounded-pill shadow-sm border border-warning"
                            onClick={pedirRecomendacionIA}
                        >
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
                            <button className="btn btn-sm text-secondary position-absolute top-0 end-0 m-2" onClick={() => setRecomendacionIA('')}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                            <h5 className="text-warning fw-bold mb-3"><i className="bi bi-robot me-2"></i>Recomendación Personalizada</h5>
                            <p className="text-light m-0 fst-italic" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                                "{recomendacionIA}"
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* FORMULARIO CREAR EVENTO */}
            {!cargando && pestañaActiva === 'crear' && (
                <div className="card glass-card border-0 p-5 fade-in shadow-lg">
                    <h3 className="fw-bold text-ae-theme mb-4"><i className="bi bi-calendar-plus me-2"></i>Organizar Nuevo Evento</h3>
                    <form onSubmit={manejarCrearEvento} className="row g-3">
                        <div className="col-md-8"><label className="text-light">Título del Evento *</label><input type="text" className="form-control ae-input" required value={nuevoEvento.titulo} onChange={e => setNuevoEvento({...nuevoEvento, titulo: e.target.value})} /></div>
                        <div className="col-md-4"><label className="text-light">Tipo *</label><select className="form-select ae-input" value={nuevoEvento.tipo} onChange={e => setNuevoEvento({...nuevoEvento, tipo: e.target.value})}><option>Concentración</option><option>Trackday</option><option>Ruta</option><option>Exposición</option></select></div>

                        <div className="col-md-6">
                            <label className="text-light">Fecha y Hora *</label>
                            <div className="position-relative">
                                <Flatpickr
                                    data-enable-time
                                    value={nuevoEvento.fecha}
                                    onChange={([date]) => setNuevoEvento({...nuevoEvento, fecha: date})}
                                    options={{
                                        locale: Spanish,
                                        dateFormat: "d/m/Y - H:i",
                                        time_24hr: true,
                                        minDate: "today",
                                        disableMobile: true
                                    }}
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
                        <div className="col-12 text-end mt-4"><button type="submit" className="btn ae-btn-primary fw-bold px-5 py-2" disabled={creando}>{creando ? 'Creando...' : 'Publicar Evento'}</button></div>
                    </form>
                </div>
            )}

            {/* MODAL DEL EVENTO SELECCIONADO */}
            {eventoSeleccionado && (
                <EventModal
                    evento={eventos.find(e => e.id === eventoSeleccionado) || null}
                    onClose={() => setEventoSeleccionado(null)}
                    onAsistir={manejarAsistencia}
                    formatearFecha={formatearFecha}
                />
            )}


            {/* VISTA GRID O VISTA MAPA DE EVENTOS         */}

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
                            // MUESTRA EL MAPA INTERACTIVO
                            <div className="mb-5 fade-in">
                                <EventMap eventos={eventosFiltrados} onAbrirModal={setEventoSeleccionado} />
                            </div>
                        ) : (
                            // MUESTRA LAS TARJETAS NORMALES
                            <div className="row g-4 fade-in">
                                {eventosFiltrados.map((evento) => (
                                    <div className="col-md-6 col-xl-4" key={evento.id}>
                                        <div
                                            className="card bg-dark text-white border-0 glass-card h-100 overflow-hidden shadow-lg event-card cursor-pointer"
                                            onClick={() => setEventoSeleccionado(evento.id)}
                                        >
                                            <div className="position-relative">
                                                <img src={evento.imagen_url} className="card-img-top object-fit-cover" alt={evento.titulo} style={{ height: '220px' }} />
                                                <span className="position-absolute top-0 end-0 m-3 badge bg-dark border border-secondary fs-6 shadow opacity-75">{evento.tipo}</span>
                                            </div>

                                            <div className="card-body p-4 d-flex flex-column">
                                                <h5 className="card-title fw-bold text-white mb-2 text-truncate">{evento.titulo}</h5>
                                                <p className="card-text text-secondary mb-4 flex-grow-1" style={{ fontSize: '0.90rem' }}>{evento.descripcion}</p>

                                                <div className="mb-4 bg-black bg-opacity-25 p-3 rounded border border-white-10">
                                                    <div className="mb-2 text-light small text-truncate"><i className="bi bi-calendar-event text-danger me-2"></i><span className="text-capitalize">{formatearFecha(evento.fecha)}</span></div>
                                                    <div className="mb-2 text-light small text-truncate"><i className="bi bi-geo-alt-fill text-danger me-2"></i>{evento.ubicacion}</div>
                                                    <div className="text-light small"><i className="bi bi-people-fill text-danger me-2"></i>{evento.asistentes_actuales} / {evento.aforo_maximo || '∞'} asistentes</div>
                                                </div>

                                                <button
                                                    className={`btn w-100 fw-bold py-2 mt-auto text-uppercase shadow ${evento.apuntado == 1 ? 'btn-success text-dark' : 'ae-btn-primary'}`}
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