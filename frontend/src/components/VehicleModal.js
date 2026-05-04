import React, { useState } from 'react';

function VehicleModal({ coche, onClose, onEdit, onDelete }) {
    const [indiceFotoModal, setIndiceFotoModal] = useState(0);

    // NUEVO: Pestañas del Modal
    const [pestañaActual, setPestañaActual] = useState('detalles');

    // ESTADOS IA
    const [iaCargando, setIaCargando] = useState(false);
    const [iaRespuesta, setIaRespuesta] = useState(null);
    const [sintomaIA, setSintomaIA] = useState('');
    const [iaDiagnosticoCargando, setIaDiagnosticoCargando] = useState(false);
    const [iaDiagnosticoRespuesta, setIaDiagnosticoRespuesta] = useState(null);

    // DATOS FALSOS DE MANTENIMIENTO INTELIGENTE
    const mantenimientos = [
        { id: 1, tarea: "Cambio de Aceite y Filtro", progreso: 85, color: "warning", km_faltan: "1.500 km" },
        { id: 2, tarea: "Pastillas de Freno", progreso: 40, color: "success", km_faltan: "12.000 km" },
        { id: 3, tarea: "Neumáticos Delanteros", progreso: 95, color: "danger", km_faltan: "Reemplazar Ya" },
        { id: 4, tarea: "ITV Anual", progreso: 15, color: "success", km_faltan: "9 meses" }
    ];

    if (!coche) return null;

    const fotosArray = coche.fotos ? coche.fotos.split(',') : [];

    const fotoAnterior = (e) => {
        e.stopPropagation();
        setIndiceFotoModal(prev => (prev === 0 ? fotosArray.length - 1 : prev - 1));
    };

    const fotoSiguiente = (e) => {
        e.stopPropagation();
        setIndiceFotoModal(prev => (prev === fotosArray.length - 1 ? 0 : prev + 1));
    };

    // FUNCIONES IA
    const consultarIA = async () => {
        setIaCargando(true); setIaRespuesta(null);
        try {
            const respuesta = await fetch('http://localhost/autoevents/backend/ia.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ marca: coche.marca, modelo: coche.modelo }),
                credentials: 'include'
            });
            const datos = await respuesta.json();
            if (datos.estado === 'exito') setIaRespuesta(datos.respuesta);
            else setIaRespuesta("❌ Error de la IA: " + datos.mensaje);
        } catch (error) { setIaRespuesta("❌ No se pudo conectar."); } finally { setIaCargando(false); }
    };

    const consultarDiagnosticoIA = async () => {
        if (!sintomaIA.trim()) return;
        setIaDiagnosticoCargando(true); setIaDiagnosticoRespuesta(null);
        try {
            const respuesta = await fetch('http://localhost/autoevents/backend/ia.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ marca: coche.marca, modelo: coche.modelo, sintoma: sintomaIA }),
                credentials: 'include'
            });
            const datos = await respuesta.json();
            if (datos.estado === 'exito') setIaDiagnosticoRespuesta(datos.respuesta);
            else setIaDiagnosticoRespuesta("❌ Error de la IA: " + datos.mensaje);
        } catch (error) { setIaDiagnosticoRespuesta("❌ No se pudo conectar."); } finally { setIaDiagnosticoCargando(false); }
    };

    return (
        <div className="modal-backdrop-custom" onClick={onClose} style={{ zIndex: 1050 }}>
            <div className="glass-card rounded-4 p-0 overflow-hidden modal-container-custom fade-in shadow-lg" onClick={e => e.stopPropagation()} style={{ border: '1px solid rgba(255,255,255,0.1)' }}>

                {/* CABECERA */}
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-white-10 bg-dark" style={{ borderBottom: '3px solid var(--ae-red)' }}>
                    <h4 className="fw-bold m-0 text-white">
                        {coche.marca} <span className="text-danger">{coche.modelo}</span>
                        <span className="text-secondary ms-2 opacity-75">({coche.anio})</span>
                    </h4>
                    <button className="btn btn-sm text-white opacity-50 hover-opacity-100 fs-5" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* NUEVO: BARRA DE PESTAÑAS */}
                <div className="d-flex bg-black" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <button className={`btn w-33 rounded-0 py-2 fw-bold text-uppercase small transition-all ${pestañaActual === 'detalles' ? 'bg-danger text-white' : 'text-white-50 hover-text-white'}`} onClick={() => setPestañaActual('detalles')} style={{ flex: 1 }}>
                        <i className="bi bi-info-square me-2"></i>Ficha
                    </button>
                    <button className={`btn w-33 rounded-0 py-2 fw-bold text-uppercase small transition-all ${pestañaActual === 'ia' ? 'bg-danger text-white' : 'text-white-50 hover-text-white'}`} onClick={() => setPestañaActual('ia')} style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                        <i className="bi bi-robot me-2"></i>Asistente
                    </button>
                    <button className={`btn w-33 rounded-0 py-2 fw-bold text-uppercase small transition-all ${pestañaActual === 'mantenimiento' ? 'bg-danger text-white' : 'text-white-50 hover-text-white'}`} onClick={() => setPestañaActual('mantenimiento')} style={{ flex: 1 }}>
                        <i className="bi bi-wrench-adjustable me-2"></i>Mantenimiento
                    </button>
                </div>

                {/* CUERPO DEL MODAL (CON SCROLL) */}
                <div className="p-0 overflow-auto" style={{ maxHeight: 'calc(90vh - 180px)', backgroundColor: 'rgba(10,10,10,0.9)' }}>

                    {/* PESTAÑA 1: DETALLES Y FOTOS */}
                    {pestañaActual === 'detalles' && (
                        <div className="fade-in">
                            {/* CARRUSEL DE FOTOS */}
                            {fotosArray.length > 0 ? (
                                <div className="position-relative bg-black d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
                                    <img
                                        src={`http://localhost/autoevents/backend/uploads/${fotosArray[indiceFotoModal]}`}
                                        className="img-fluid w-100 object-fit-contain"
                                        alt="Coche"
                                        style={{ maxHeight: '400px' }}
                                    />
                                    {fotosArray.length > 1 && (
                                        <>
                                            <button className="btn position-absolute start-0 text-white fs-1 ms-2 opacity-50 hover-opacity-100" onClick={fotoAnterior}><i className="bi bi-chevron-left"></i></button>
                                            <button className="btn position-absolute end-0 text-white fs-1 me-2 opacity-50 hover-opacity-100" onClick={fotoSiguiente}><i className="bi bi-chevron-right"></i></button>
                                            <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex gap-2">
                                                {fotosArray.map((_, idx) => (
                                                    <div key={idx} className={`carousel-dot ${indiceFotoModal === idx ? 'bg-danger' : 'bg-white opacity-50'}`} style={{ width: '10px', height: '10px', borderRadius: '50%' }}></div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="d-flex justify-content-center align-items-center bg-dark" style={{ height: '200px' }}>
                                    <i className="bi bi-camera text-secondary opacity-25" style={{ fontSize: '4rem' }}></i>
                                </div>
                            )}

                            <div className="p-4 text-light">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="p-3 rounded border border-secondary shadow-sm" style={{ backgroundColor: 'rgba(30,30,30,0.6)' }}>
                                            <p className="m-0 text-danger fw-bold small text-uppercase"><i className="bi bi-engine me-2"></i>Motor</p>
                                            <p className="m-0 fw-bold fs-5 mt-1">{coche.motor || 'No especificado'}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 rounded border border-secondary shadow-sm" style={{ backgroundColor: 'rgba(30,30,30,0.6)' }}>
                                            <p className="m-0 text-danger fw-bold small text-uppercase"><i className="bi bi-card-checklist me-2"></i>Especificaciones / Mods</p>
                                            <p className="m-0 text-md text-pre-wrap text-white-50 mt-1">{coche.especificaciones || 'Coche de estricta serie.'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PESTAÑA 2: ASISTENTE IA */}
                    {pestañaActual === 'ia' && (
                        <div className="p-4 fade-in text-light">
                            <div className="p-4 rounded border border-danger shadow-lg" style={{ backgroundColor: 'rgba(230,0,0,0.05)' }}>
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                                    <div>
                                        <h5 className="fw-bold m-0 text-danger"><i className="bi bi-robot me-2"></i>Información del Modelo</h5>
                                        <p className="text-secondary m-0 mt-1 small">Datos técnicos y fallos comunes generados por IA.</p>
                                    </div>
                                    <button className="btn btn-outline-danger fw-bold shadow-sm" onClick={consultarIA} disabled={iaCargando}>
                                        {iaCargando ? <><span className="spinner-border spinner-border-sm me-2"></span>Analizando...</> : <><i className="bi bi-stars me-2"></i>Consultar</>}
                                    </button>
                                </div>

                                {iaRespuesta && (
                                    <div className="p-3 mt-3 rounded text-pre-wrap small border border-secondary bg-black bg-opacity-50">
                                        {iaRespuesta}
                                    </div>
                                )}

                                <hr className="my-4 border-secondary opacity-25" />

                                <div>
                                    <h6 className="fw-bold text-light mb-3"><i className="bi bi-tools me-2 text-danger"></i>Diagnóstico de Averías Inteligente</h6>
                                    <div className="d-flex gap-2">
                                        <input type="text" className="form-control ae-input bg-dark text-white border-secondary" placeholder="Ej: Ruido metálico al frenar..." value={sintomaIA} onChange={(e) => setSintomaIA(e.target.value)} />
                                        <button className="btn fw-bold btn-danger px-4" onClick={consultarDiagnosticoIA} disabled={iaDiagnosticoCargando || !sintomaIA.trim()}>
                                            {iaDiagnosticoCargando ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-send-fill"></i>}
                                        </button>
                                    </div>

                                    {iaDiagnosticoRespuesta && (
                                        <div className="p-3 mt-3 rounded border border-warning text-pre-wrap small shadow-sm" style={{ backgroundColor: 'rgba(255, 193, 7, 0.05)' }}>
                                            <h6 className="fw-bold text-warning"><i className="bi bi-exclamation-triangle-fill me-2"></i>Diagnóstico Estimado:</h6>
                                            {iaDiagnosticoRespuesta}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PESTAÑA 3: MANTENIMIENTO INTELIGENTE */}
                    {pestañaActual === 'mantenimiento' && (
                        <div className="p-4 fade-in text-light">
                            <h5 className="text-white fw-bold mb-4"><i className="bi bi-activity me-2 text-danger"></i>Estado General del Vehículo</h5>

                            <div className="d-flex flex-column gap-4 mb-4">
                                {mantenimientos.map(m => (
                                    <div key={m.id} className="p-3 rounded border border-secondary" style={{ backgroundColor: 'rgba(30,30,30,0.6)' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="text-white fw-bold"><i className={`bi bi-circle-fill me-2 text-${m.color} small`}></i>{m.tarea}</span>
                                            <span className={`badge bg-${m.color} bg-opacity-25 text-${m.color} border border-${m.color} px-3 py-2`}>
                                                Faltan {m.km_faltan}
                                            </span>
                                        </div>
                                        <div className="progress rounded-pill shadow-inner" style={{ height: '10px', backgroundColor: 'rgba(0,0,0,0.8)' }}>
                                            <div className={`progress-bar bg-${m.color} progress-bar-striped progress-bar-animated`} role="progressbar" style={{ width: `${m.progreso}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="text-center mt-2">
                                <button className="btn btn-outline-danger w-100 fw-bold py-3 text-white" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                                    <i className="bi bi-plus-lg me-2"></i> Añadir Nuevo Registro
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* PIE DE MODAL (ACCIONES DE EDICIÓN) */}
                <div className="p-3 bg-black d-flex justify-content-end gap-2 border-top border-white-10">
                    <button className="btn btn-warning fw-bold px-4" onClick={() => onEdit(coche)}>
                        <i className="bi bi-pencil-square me-2"></i>Editar
                    </button>
                    <button className="btn btn-outline-danger fw-bold" onClick={() => onDelete(coche.id)}>
                        <i className="bi bi-trash3"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VehicleModal;