import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

const Messages = ({ usuario }) => {
    const [conversaciones, setConversaciones] = useState([]);
    const [chatActivo, setChatActivo] = useState(null);
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const mensajesFinRef = useRef(null);

    // Aseguramos que tenemos tu ID
    const mi_id = usuario ? usuario.id : 1;

    const cargarConversaciones = async () => {
        try {
            // Le pasamos tu ID por la URL
            const res = await fetch(`http://localhost/autoevents/backend/mensajes.php?mi_id=${mi_id}`, { credentials: 'include' });
            const data = await res.json();
            if (data.estado === 'exito') setConversaciones(data.conversaciones);
        } catch (error) { console.error("Error al cargar chats:", error); }
    };

    const cargarChat = async (otro_id, otro_nombre) => {
        setChatActivo({ id: otro_id, nombre: otro_nombre });
        try {
            // Le pasamos tu ID y el del chat por la URL
            const res = await fetch(`http://localhost/autoevents/backend/mensajes.php?mi_id=${mi_id}&chat_con=${otro_id}`, { credentials: 'include' });
            const data = await res.json();
            if (data.estado === 'exito') setMensajes(data.mensajes);
        } catch (error) { console.error("Error al cargar mensajes:", error); }
    };

    const enviarMensaje = async (e) => {
        e.preventDefault();
        if (!nuevoMensaje.trim() || !chatActivo) return;

        try {
            const res = await fetch('http://localhost/autoevents/backend/mensajes.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    remitente_id: mi_id, // Decimos que eres tú quien envía
                    destinatario_id: chatActivo.id,
                    contenido: nuevoMensaje
                }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.estado === 'exito') {
                setNuevoMensaje('');
                cargarChat(chatActivo.id, chatActivo.nombre);
                cargarConversaciones();
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', background: '#1a1a1a', color: '#fff' });
        }
    };

    useEffect(() => {
        mensajesFinRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensajes]);

    useEffect(() => {
        cargarConversaciones();
    }, []);

    return (
        <div className="fade-in mb-5 glass-card shadow-lg overflow-hidden" style={{ borderRadius: '15px', height: '70vh', display: 'flex' }}>

            {/* PANEL IZQUIERDO: Lista de Chats */}
            <div className="bg-black bg-opacity-50 border-end border-secondary" style={{ width: '30%', minWidth: '250px', display: 'flex', flexDirection: 'column' }}>
                <div className="p-3 bg-dark border-bottom border-secondary">
                    <h5 className="fw-bold text-white m-0"><i className="bi bi-chat-dots-fill text-danger me-2"></i>Mis Mensajes</h5>
                </div>
                <div className="overflow-auto flex-grow-1 p-2">
                    {conversaciones.length === 0 ? (
                        <p className="text-white-50 text-center mt-4 small">No tienes conversaciones activas.</p>
                    ) : (
                        conversaciones.map(conv => (
                            <div
                                key={conv.otro_id}
                                className={`p-3 mb-2 rounded cursor-pointer transition-all ${chatActivo?.id === conv.otro_id ? 'bg-danger text-white shadow' : 'bg-dark text-white-50 hover-text-white'}`}
                                onClick={() => cargarChat(conv.otro_id, conv.otro_nombre)}
                            >
                                <div className="fw-bold"><i className="bi bi-person-circle me-2"></i> {conv.otro_nombre}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* PANEL DERECHO: El Chat Activo */}
            <div className="flex-grow-1 bg-dark bg-opacity-75 d-flex flex-column">
                {chatActivo ? (
                    <>
                        <div className="p-3 border-bottom border-secondary" style={{ backgroundColor: 'rgba(230,0,0,0.1)' }}>
                            <h5 className="fw-bold text-white m-0">Conversación con <span className="text-danger">{chatActivo.nombre}</span></h5>
                        </div>

                        <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-3">
                            {mensajes.map(msg => {
                                // Aquí comprobamos si el mensaje lo enviaste tú o el otro
                                const soyYo = parseInt(msg.remitente_id) === mi_id;
                                return (
                                    <div key={msg.id} className={`d-flex ${soyYo ? 'justify-content-end' : 'justify-content-start'}`}>
                                        <div className={`p-3 rounded-4 shadow-sm text-white ${soyYo ? 'bg-danger' : 'bg-black border border-secondary'}`} style={{ maxWidth: '75%' }}>
                                            <p className="m-0 text-pre-wrap small">{msg.contenido}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={mensajesFinRef} />
                        </div>

                        <div className="p-3 bg-black bg-opacity-50 border-top border-secondary">
                            <form onSubmit={enviarMensaje} className="d-flex gap-2">
                                <input
                                    type="text"
                                    className="form-control ae-input bg-dark text-white border-secondary"
                                    placeholder="Escribe un mensaje..."
                                    value={nuevoMensaje}
                                    onChange={(e) => setNuevoMensaje(e.target.value)}
                                />
                                <button type="submit" className="btn btn-danger fw-bold px-4" disabled={!nuevoMensaje.trim()}>
                                    <i className="bi bi-send-fill"></i>
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