import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const API_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
    ? process.env.REACT_APP_API_URL
    : 'http://localhost/autoevents/backend';

const Community = () => {
    const [publicaciones, setPublicaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const [postActivo, setPostActivo] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [cargandoComentarios, setCargandoComentarios] = useState(false);

    const [nuevoPost, setNuevoPost] = useState({ titulo: '', contenido: '', categoria: 'General' });
    const categorias = ['General', 'Mecánica', 'Rutas', 'Eventos', 'Compra/Venta', 'Detailing'];

    const cargarPublicaciones = async () => {
        setLoading(true);
        try {
            const respuesta = await fetch(`${API_URL}/foros.php`, { method: 'GET', credentials: 'include' });
            const datos = await respuesta.json();
            if (datos.estado === 'exito') setPublicaciones(datos.publicaciones);
        } catch (error) {
            console.error("Error al cargar el foro:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarPublicaciones(); }, []);

    const abrirPost = async (post) => {
        setPostActivo(post);
        setCargandoComentarios(true);
        try {
            const res = await fetch(`${API_URL}/comentarios.php?post_id=${post.id}`, { credentials: 'include' });
            const data = await res.json();
            if (data.estado === 'exito') setComentarios(data.comentarios);
        } catch (err) {
            console.error(err);
        } finally {
            setCargandoComentarios(false);
        }
    };

    const enviarComentario = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;
        setEnviando(true);
        try {
            const res = await fetch(`${API_URL}/comentarios.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ publicacion_id: postActivo.id, contenido: nuevoComentario }),
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok && data.estado === 'exito') {
                setNuevoComentario('');
                abrirPost(postActivo); // Recarga los comentarios del post
                cargarPublicaciones(); // Actualiza el contador en la lista general
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: data.mensaje || 'Error al enviar.', background: '#1a1a1a', color: '#fff' });
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error de conexión.', background: '#1a1a1a', color: '#fff' });
        } finally {
            setEnviando(false);
        }
    };

    const manejarEnvioPost = async (e) => {
        e.preventDefault();
        setEnviando(true);
        try {
            // CORRECCIÓN TUTOR: Uso de API_URL
            const res = await fetch(`${API_URL}/foros.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoPost),
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok && data.estado === 'exito') {
                Swal.fire({ icon: 'success', title: '¡Publicado!', background: '#1a1a1a', color: '#fff', timer: 1500, showConfirmButton: false });
                setNuevoPost({ titulo: '', contenido: '', categoria: 'General' });
                setMostrarFormulario(false);
                cargarPublicaciones();
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: data.mensaje || 'Error al publicar', background: '#1a1a1a', color: '#fff' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error de conexión', background: '#1a1a1a', color: '#fff' });
        } finally {
            setEnviando(false);
        }
    };

    const formatearFecha = (f) => new Date(f).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

    // ===========================
    // VISTA 2: DENTRO DE UN HILO
    // ===========================
    if (postActivo) {
        return (
            <div className="fade-in">
                <button className="btn btn-outline-light mb-4 shadow-sm" onClick={() => setPostActivo(null)}>
                    <i className="bi bi-arrow-left me-2"></i>Volver al Foro
                </button>

                {/* Post Principal */}
                <div className="glass-card p-4 mb-4 shadow-lg" style={{ borderRadius: '15px', borderLeft: '5px solid var(--ae-red)', backgroundColor: 'rgba(50, 10, 10, 0.7)' }}>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <h3 className="fw-bold text-white m-0">{postActivo.titulo}</h3>
                        <span className="badge" style={{ backgroundColor: 'rgba(230, 0, 0, 0.2)', border: '1px solid rgba(230,0,0,0.5)', color: '#fff' }}>{postActivo.categoria}</span>
                    </div>
                    <div className="d-flex align-items-center mb-4 pb-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
                        <i className="bi bi-person-circle fs-3 text-danger me-2"></i>
                        <div>
                            <p className="text-white fw-bold m-0">{postActivo.autor}</p>
                            <small className="text-white-50">{formatearFecha(postActivo.fecha)}</small>
                        </div>
                    </div>
                    <p className="text-light text-pre-wrap fs-5" style={{ lineHeight: '1.6' }}>{postActivo.contenido}</p>
                </div>

                <h5 className="text-white fw-bold mb-3 ms-2"><i className="bi bi-chat-left-text me-2"></i>Respuestas ({comentarios.length})</h5>

                {cargandoComentarios ? (
                    <div className="text-center my-4"><div className="spinner-border text-danger"></div></div>
                ) : (
                    <div className="d-flex flex-column gap-3 mb-4">
                        {comentarios.map(com => (
                            <div key={com.id} className="glass-card p-3 shadow-sm" style={{ borderRadius: '12px', marginLeft: '2rem', backgroundColor: 'rgba(30,30,30,0.6)' }}>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-white fw-bold"><i className="bi bi-person-fill me-1 text-secondary"></i>{com.autor}</span>
                                    <small className="text-white-50">{formatearFecha(com.fecha)}</small>
                                </div>
                                <p className="text-light m-0 text-pre-wrap">{com.contenido}</p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="glass-card p-3 mt-3 shadow-sm" style={{ borderRadius: '12px', marginLeft: '2rem', backgroundColor: 'rgba(20, 20, 20, 0.8)' }}>
                    <form onSubmit={enviarComentario} className="d-flex gap-3 align-items-center">
                        <textarea
                            className="form-control ae-input text-white"
                            rows="1"
                            placeholder="Escribe una respuesta..."
                            required
                            value={nuevoComentario}
                            onChange={(e) => setNuevoComentario(e.target.value)}
                            disabled={enviando}
                            style={{ resize: 'none', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}
                        ></textarea>
                        <button
                            type="submit"
                            className="btn btn-danger shadow-lg d-flex align-items-center justify-content-center"
                            style={{ height: '45px', minWidth: '60px', borderRadius: '10px', transition: 'all 0.3s' }}
                            disabled={enviando}
                        >
                            {enviando ? <div className="spinner-border spinner-border-sm text-white"></div> : <i className="bi bi-send-fill text-white fs-5"></i>}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ==========================================
    // VISTA 1: LISTADO GENERAL
    // ==========================================
    return (
        <div className="fade-in">
            {/* CABECERA */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 border-bottom border-secondary pb-3">
                <div>
                    <h2 className="fw-bold m-0 text-ae-theme"><i className="bi bi-chat-square-text me-2"></i>Foro de la Comunidad</h2>
                    <p className="text-light opacity-75 m-0 mt-1">Comparte dudas, organiza rutas y habla de motor.</p>
                </div>
                <button className={`btn ${mostrarFormulario ? 'btn-outline-danger' : 'ae-btn-primary'} fw-bold px-4 shadow`} onClick={() => setMostrarFormulario(!mostrarFormulario)}>
                    {mostrarFormulario ? 'Cancelar' : <><i className="bi bi-pencil-square me-2"></i>Crear Hilo</>}
                </button>
            </div>

            {/* FORMULARIO POST */}
            {mostrarFormulario && (
                <div className="card glass-card border-0 mb-5 fade-in p-4 shadow-lg form-card-new" style={{ backgroundColor: 'rgba(40, 10, 10, 0.8)' }}>
                    <form onSubmit={manejarEnvioPost} className="row g-3">
                        <div className="col-md-8">
                            <label className="form-label text-light fw-bold">Título del Hilo</label>
                            <input type="text" className="form-control ae-input" required maxLength="100" placeholder="Ej: Ruido extraño al frenar..." value={nuevoPost.titulo} onChange={e => setNuevoPost({...nuevoPost, titulo: e.target.value})} disabled={enviando}/>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label text-light fw-bold">Categoría</label>
                            <select className="form-select ae-input" value={nuevoPost.categoria} onChange={e => setNuevoPost({...nuevoPost, categoria: e.target.value})} disabled={enviando}>
                                {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="col-12 mt-3">
                            <label className="form-label text-light fw-bold">Contenido</label>
                            <textarea className="form-control ae-input" rows="4" required placeholder="Explica los detalles aquí..." value={nuevoPost.contenido} onChange={e => setNuevoPost({...nuevoPost, contenido: e.target.value})} disabled={enviando}></textarea>
                        </div>
                        <div className="col-12 text-end mt-4">
                            <button type="submit" className="btn btn-light fw-bold text-dark px-5" disabled={enviando}>
                                <i className="bi bi-send me-2"></i>Publicar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-center text-light my-5"><div className="spinner-border text-danger"></div></div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {publicaciones.map(post => (
                        <div
                            key={post.id}
                            onClick={() => abrirPost(post)}
                            className="glass-card p-3 p-md-4 d-flex flex-column flex-md-row gap-3 align-items-start transition-all hover-lift cursor-pointer"
                            style={{ borderRadius: '12px', borderLeft: '4px solid var(--ae-red)', backgroundColor: 'rgba(50, 10, 10, 0.6)' }}
                        >
                            <div className="d-none d-md-flex align-items-center justify-content-center rounded-circle border border-danger shadow-sm" style={{ width: '50px', height: '50px', minWidth: '50px', backgroundColor: 'rgba(230, 0, 0, 0.1)' }}>
                                <i className="bi bi-person-fill text-light fs-4"></i>
                            </div>

                            <div className="flex-grow-1 w-100">
                                <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap">
                                    <h5 className="fw-bold text-white m-0">{post.titulo}</h5>
                                    <span className="badge mt-2 mt-md-0 shadow-sm" style={{ backgroundColor: 'rgba(230, 0, 0, 0.2)', border: '1px solid rgba(230, 0, 0, 0.5)', color: '#fff' }}>{post.categoria}</span>
                                </div>
                                <p className="text-light text-pre-wrap small mb-3" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.6' }}>{post.contenido}</p>
                                <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-2" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
                                    <small className="text-white fw-bold"><i className="bi bi-person-circle me-2 text-danger"></i>{post.autor}</small>
                                    <small className="text-white-50 fw-bold">
                                        <i className="bi bi-clock me-1"></i>{formatearFecha(post.fecha)}
                                        <span className="ms-3 text-white"><i className="bi bi-chat-dots-fill text-danger me-1"></i>{post.num_comentarios} respuestas</span>
                                    </small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Community;