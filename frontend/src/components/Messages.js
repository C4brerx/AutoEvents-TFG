import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

const API_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
    ? process.env.REACT_APP_API_URL
    : 'http://localhost/autoevents/backend';

const Messages = ({ usuario }) => {
    const [conversaciones, setConversaciones] = useState([]);
    const [contactos, setContactos] = useState([]);
    const [mostrarContactos, setMostrarContactos] = useState(false);

    const [chatActivo, setChatActivo] = useState(null);
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [enviando, setEnviando] = useState(false);
    const mensajesFinRef = useRef(null);

    const prevMensajesLength = useRef(0);

    const mi_id = usuario ? parseInt(usuario.id) : 0;

    const cargarConversaciones = async () => {
        try {
            const res = await fetch(`${API_URL}/mensajes.php`, { credentials: 'include' });
            const data = await res.json();
            if (data.estado === 'exito') setConversaciones(data.conversaciones || []);
        } catch (error) { console.error("Error al cargar chats:", error); }
    };

    const cargarChat = async (otro_id, otro_nombre) => {
        if (!chatActivo || chatActivo.id !== otro_id) {
            setChatActivo({ id: otro_id, nombre: otro_nombre });
        }
        try {
            const res = await fetch(`${API_URL}/mensajes.php?chat_con=${otro_id}`, { credentials: 'include' });
            const data = await res.json();
            if (data.estado === 'exito') {
                setMensajes(data.mensajes || []);
            }
        } catch (error) { console.error("Error al cargar mensajes:", error); }
    };

    const enviarMensaje = async (e) => {
        e.preventDefault();
        if (!nuevoMensaje.trim() || !chatActivo || enviando) return;

        setEnviando(true);
        try {
            const res = await fetch(`${API_URL}/mensajes.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destinatario_id: chatActivo.id,
                    contenido: nuevoMensaje
                }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.estado === 'exito') {
                setNuevoMensaje('');
                await cargarChat(chatActivo.id, chatActivo.nombre);
                await cargarConversaciones();
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: data.mensaje, background: '#1a1a1a', color: '#fff' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error de conexión', background: '#1a1a1a', color: '#fff' });
        } finally {
            setEnviando(false);
        }
    };

    useEffect(() => {
        cargarConversaciones();
        const intervaloGeneral = setInterval(() => {
            cargarConversaciones();
        }, 5000);
        return () => clearInterval(intervaloGeneral);
    }, []);

    useEffect(() => {
        let intervaloChat;
        if (chatActivo) {
            intervaloChat = setInterval(() => {
                cargarChat(chatActivo.id, chatActivo.nombre);
            }, 3000);
        }
        return () => clearInterval(intervaloChat);
    }, [chatActivo]);

    useEffect(() => {
        if (mensajes.length > prevMensajesLength.current) {
            mensajesFinRef.current?.scrollIntoView({ behavior: "smooth" });
        }
        prevMensajesLength.current = mensajes.length;
    }, [mensajes]);

    const listaAMostrar = mostrarContactos ? contactos : conversaciones;

    return (
        <div className="row g-0 fade-in mb-5 glass-card shadow-lg overflow-hidden" style={{ borderRadius: '15px', height: '70vh' }}>

            <div className={`col-12 col-md-4 col-lg-3 bg-black bg-opacity-50 border-end border-secondary d-flex flex-column h-100 ${chatActivo ? 'd-none d-md-flex' : ''}`}>
                <div className="p-3 bg-dark border-bottom border-secondary d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold text-white m-0 fs-6">
                        <i className={`bi ${mostrarContactos ? 'bi-people-fill text-info' : 'bi-chat-dots-fill text-danger'} me-2`}></i>
                        {mostrarContactos ? 'Pilotos' : 'Mensajes'}
                    </h5>

                    <button
                        className={`btn btn-sm rounded-circle shadow-sm ${mostrarContactos ? 'btn-danger' : 'btn-outline-light'}`}
                        title={mostrarContactos ? 'Volver a Mis Mensajes' : 'Buscar Piloto'}
                        onClick={async () => {
                            setMostrarContactos(!mostrarContactos);
                            if (!mostrarContactos) {
                                try {
                                    const res = await fetch(`${API_URL}/mensajes.php?accion=contactos`, { credentials: 'include' });
                                    const data = await res.json();
                                    if (data.estado === 'exito') setContactos(data.conversaciones || []);
                                } catch (e) { console.error("Error al cargar contactos"); }
                            }
                        }}
                    >
                        <i className={`bi ${mostrarContactos ? 'bi-x-lg' : 'bi-plus-lg'}`}></i>
                    </button>
                </div>

                <div className="overflow-auto flex-grow-1 p-2">
                    {listaAMostrar.length === 0 ? (
                        <div className="text-center mt-4">
                            <p className="text-white-50 small mb-2">{mostrarContactos ? 'No hay otros pilotos.' : 'Bandeja vacía.'}</p>
                            {!mostrarContactos && <small className="text-secondary">Dale al botón <i className="bi bi-plus-lg"></i> para buscar a alguien.</small>}
                        </div>
                    ) : (
                        listaAMostrar.map(item => (
                            <div
                                key={item.otro_id}
                                className={`p-3 mb-2 rounded cursor-pointer transition-all ${chatActivo?.id === item.otro_id ? 'bg-danger text-white shadow' : 'bg-dark text-white-50 hover-text-white'}`}
                                onClick={() => {
                                    cargarChat(item.otro_id, item.otro_nombre);
                                    setMostrarContactos(false);
                                }}
                            >
                                <div className="fw-bold d-flex align-items-center">
                                    <i className="bi bi-person-circle me-2 fs-5"></i>
                                    <span className="text-truncate">{item.otro_nombre}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* PANEL DERECHO: El Chat Activo */}
            <div className={`col-12 col-md-8 col-lg-9 bg-dark bg-opacity-75 d-flex flex-column h-100 ${!chatActivo ? 'd-none d-md-flex' : ''}`}>
                {chatActivo ? (
                    <>
                        <div className="p-3 border-bottom border-secondary d-flex align-items-center" style={{ backgroundColor: 'rgba(230,0,0,0.1)' }}>
                            <button className="btn btn-sm btn-outline-light d-md-none me-3 rounded-circle shadow-sm" onClick={() => setChatActivo(null)}>
                                <i className="bi bi-arrow-left"></i>
                            </button>
                            <h5 className="fw-bold text-white m-0 text-truncate">
                                Conversación con <span className="text-danger">{chatActivo.nombre}</span>
                            </h5>
                        </div>

                        <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-3">
                            {mensajes.length === 0 ? (
                                <p className="text-center text-white-50 mt-5">Aún no hay mensajes. ¡Rompe el hielo!</p>
                            ) : (
                                mensajes.map(msg => {
                                    const soyYo = parseInt(msg.remitente_id) === mi_id;
                                    return (
                                        <div key={msg.id} className={`d-flex ${soyYo ? 'justify-content-end' : 'justify-content-start'}`}>
                                            <div className={`p-3 rounded-4 shadow-sm text-white ${soyYo ? 'bg-danger' : 'bg-black border border-secondary'}`} style={{ maxWidth: '85%' }}>
                                                {msg.producto_id && (
                                                    <small className="d-block mb-1 text-warning fw-bold" style={{ fontSize: '0.7rem' }}>
                                                        <i className="bi bi-tag-fill me-1"></i>Ref. Producto #{msg.producto_id}
                                                    </small>
                                                )}
                                                <p className="m-0 text-pre-wrap small text-break">{msg.contenido}</p>
                                                <small className="d-block text-end mt-1 opacity-50" style={{ fontSize: '0.65rem' }}>
                                                    {new Date(msg.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                </small>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={mensajesFinRef} />
                        </div>

                        <div className="p-3 bg-black bg-opacity-50 border-top border-secondary">
                            <form onSubmit={enviarMensaje} className="d-flex gap-2">
                                <input
                                    type="text"
                                    className="form-control ae-input bg-dark text-white border-secondary"
                                    placeholder="Mensaje..."
                                    value={nuevoMensaje}
                                    onChange={(e) => setNuevoMensaje(e.target.value)}
                                    disabled={enviando}
                                />
                                <button type="submit" className="btn btn-danger fw-bold px-3 shadow" disabled={!nuevoMensaje.trim() || enviando}>
                                    {enviando ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-send-fill"></i>}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-white-50 opacity-50">
                        <i className="bi bi-chat-square-text display-1 mb-3"></i>
                        <h4>Selecciona un chat para empezar</h4>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;