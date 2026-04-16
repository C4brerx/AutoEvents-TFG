import React, { useState } from 'react';

function VehicleModal({ coche, onClose, onEdit, onDelete }) {
    const [indiceFotoModal, setIndiceFotoModal] = useState(0);

    // ESTADOS IA (Mantenemos tu lógica original)
    const [iaCargando, setIaCargando] = useState(false);
    const [iaRespuesta, setIaRespuesta] = useState(null);
    const [sintomaIA, setSintomaIA] = useState('');
    const [iaDiagnosticoCargando, setIaDiagnosticoCargando] = useState(false);
    const [iaDiagnosticoRespuesta, setIaDiagnosticoRespuesta] = useState(null);

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
        <div className="modal-backdrop-custom" onClick={onClose}>
            {/* Contenedor con stopPropagation para que no se cierre al hacer clic dentro */}
            <div className="glass-card rounded-4 p-0 overflow-hidden modal-container-custom fade-in" onClick={e => e.stopPropagation()}>

                {/* CABECERA FIX */}
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-white-10 bg-black bg-opacity-50">
                    <h3 className="fw-bold m-0 text-white">
                        {coche.marca} <span className="text-ae-red">{coche.modelo}</span>
                        <span className="text-secondary ms-2 fs-5">({coche.anio})</span>
                    </h3>
                    <button className="btn btn-sm btn-outline-light border-0" onClick={onClose}>
                        <i className="bi bi-x-lg fs-4"></i>
                    </button>
                </div>

                {/* CUERPO DEL MODAL CON SCROLL PROPIO */}
                <div className="p-0 overflow-auto" style={{ maxHeight: 'calc(90vh - 130px)' }}>

                    {/* CARRUSEL PRO */}
                    {fotosArray.length > 0 ? (
                        <div className="position-relative bg-black d-flex align-items-center justify-content-center" style={{ minHeight: '350px' }}>
                            <img
                                src={`http://localhost/autoevents/backend/uploads/${fotosArray[indiceFotoModal]}`}
                                className="img-fluid w-100 object-fit-contain"
                                alt="Coche"
                                style={{ maxHeight: '450px' }}
                            />
                            {fotosArray.length > 1 && (
                                <>
                                    <button className="btn position-absolute start-0 text-white fs-1 ms-2 opacity-50 hover-opacity-100" onClick={fotoAnterior}>
                                        <i className="bi bi-chevron-left"></i>
                                    </button>
                                    <button className="btn position-absolute end-0 text-white fs-1 me-2 opacity-50 hover-opacity-100" onClick={fotoSiguiente}>
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                    <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex gap-2">
                                        {fotosArray.map((_, idx) => (
                                            <div key={idx} className={`carousel-dot ${indiceFotoModal === idx ? 'active' : ''}`}></div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="no-photo-modal"><i className="bi bi-camera text-secondary icon-camera-modal"></i></div>
                    )}

                    <div className="p-4 text-light">
                        {/* DATOS TÉCNICOS */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <div className="p-3 bg-dark bg-opacity-50 rounded border border-secondary shadow-sm">
                                    <p className="m-0 text-ae-red fw-bold small text-uppercase">Motor</p>
                                    <p className="m-0 fw-bold fs-5">{coche.motor || 'No especificado'}</p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-3 bg-dark bg-opacity-50 rounded border border-secondary shadow-sm">
                                    <p className="m-0 text-ae-red fw-bold small text-uppercase">Especificaciones / Mods</p>
                                    <p className="m-0 text-md text-pre-wrap">{coche.especificaciones || 'Coche de serie'}</p>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN IA (Tu lógica blindada) */}
                        <div className="p-4 rounded border ia-section-box shadow-lg">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                <div>
                                    <h5 className="fw-bold m-0 text-ae-red"><i className="bi bi-robot me-2"></i>Mecánico Virtual IA</h5>
                                    <p className="text-secondary m-0 mt-1 text-sm">Datos, fallos comunes y curiosidades de este modelo.</p>
                                </div>
                                <button className="btn btn-light fw-bold shadow-sm" onClick={consultarIA} disabled={iaCargando}>
                                    {iaCargando ? <><span className="spinner-border spinner-border-sm me-2"></span>Analizando...</> : <><i className="bi bi-stars me-2 text-danger"></i>Consultar Gemini</>}
                                </button>
                            </div>

                            {iaRespuesta && (
                                <div className="p-3 mt-3 rounded ia-response-box text-pre-wrap text-095 border border-secondary border-opacity-25 bg-black bg-opacity-25 shadow-inner">
                                    {iaRespuesta}
                                </div>
                            )}

                            <hr className="my-4 border-secondary opacity-30" />

                            <div>
                                <h6 className="fw-bold text-light mb-3"><i className="bi bi-tools me-2 text-secondary"></i>Diagnóstico de averías:</h6>
                                <div className="d-flex gap-2">
                                    <input type="text" className="form-control ae-input" placeholder="Describe el síntoma (ej: tironea en frío)..." value={sintomaIA} onChange={(e) => setSintomaIA(e.target.value)} />
                                    <button className="btn fw-bold btn-ae-red px-4" onClick={consultarDiagnosticoIA} disabled={iaDiagnosticoCargando || !sintomaIA.trim()}>
                                        {iaDiagnosticoCargando ? <span className="spinner-border spinner-border-sm"></span> : 'Diagnosticar'}
                                    </button>
                                </div>

                                {iaDiagnosticoRespuesta && (
                                    <div className="p-3 mt-3 rounded border ia-diagnosis-box text-pre-wrap text-095 shadow-sm">
                                        <h6 className="fw-bold text-ae-red"><i className="bi bi-exclamation-triangle-fill me-2"></i>Diagnóstico Estimado:</h6>
                                        {iaDiagnosticoRespuesta}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* PIE DE MODAL FIJO */}
                <div className="p-3 bg-dark d-flex justify-content-end gap-2 border-top border-white-10 bg-opacity-75">
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