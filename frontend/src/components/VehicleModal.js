import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const API_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
    ? process.env.REACT_APP_API_URL
    : 'http://localhost/autoevents/backend';

function VehicleModal({ coche, onClose, onEdit, onDelete }) {
    const [indiceFotoModal, setIndiceFotoModal] = useState(0);
    const [pestañaActual, setPestañaActual] = useState('detalles');

    const [iaCargando, setIaCargando] = useState(false);
    const [iaRespuesta, setIaRespuesta] = useState(null);
    const [sintomaIA, setSintomaIA] = useState('');
    const [iaDiagnosticoCargando, setIaDiagnosticoCargando] = useState(false);
    const [iaDiagnosticoRespuesta, setIaDiagnosticoRespuesta] = useState(null);

    const [mantenimientos, setMantenimientos] = useState([]);
    const [cargandoMantenimientos, setCargandoMantenimientos] = useState(false);

    useEffect(() => {
        if (coche && pestañaActual === 'mantenimiento') {
            cargarMantenimientos();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coche, pestañaActual]);

    const cargarMantenimientos = async () => {
        setCargandoMantenimientos(true);
        try {
            const res = await fetch(`${API_URL}/mantenimientos.php?vehiculo_id=${coche.id}`, { credentials: 'include' });
            const data = await res.json();
            if (data.estado === 'exito') setMantenimientos(data.mantenimientos);
        } catch (error) {
            console.error("Error al cargar mantenimientos", error);
        } finally {
            setCargandoMantenimientos(false);
        }
    };

    const añadirMantenimiento = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Nuevo Registro de Taller',
            html: `
                <input id="swal-tarea" class="swal2-input bg-dark text-white border-secondary" placeholder="Ej: Cambio de Aceite y Filtro">
                <input id="swal-km" type="number" class="swal2-input bg-dark text-white border-secondary" placeholder="Kilómetros actuales">
                <input id="swal-coste" type="number" class="swal2-input bg-dark text-white border-secondary" placeholder="Coste total en € (Opcional)">
            `,
            background: '#1a1a1a', color: '#fff', confirmButtonColor: '#e60000',
            showCancelButton: true, confirmButtonText: 'Guardar', cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const tarea = document.getElementById('swal-tarea').value;
                const km_actuales = document.getElementById('swal-km').value;
                if (!tarea || !km_actuales) {
                    Swal.showValidationMessage('La tarea y los KM son obligatorios');
                    return false;
                }
                return { vehiculo_id: coche.id, tarea, km_actuales, coste: document.getElementById('swal-coste').value || 0 };
            }
        });

        if (formValues) {
            try {
                const res = await fetch(`${API_URL}/mantenimientos.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formValues),
                    credentials: 'include'
                });
                if (res.ok) {
                    Swal.fire({ icon: 'success', title: 'Añadido', background: '#1a1a1a', color: '#fff', timer: 1500, showConfirmButton: false });
                    cargarMantenimientos();
                }
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', background: '#1a1a1a', color: '#fff' });
            }
        }
    };

    const borrarMantenimiento = async (id) => {
        const result = await Swal.fire({
            title: '¿Borrar registro?', text: "Esta acción no se puede deshacer.",
            icon: 'warning', showCancelButton: true, confirmButtonColor: '#e60000', cancelButtonColor: '#6c757d',
            background: '#1a1a1a', color: '#fff', confirmButtonText: 'Sí, borrar', cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            await fetch(`${API_URL}/mantenimientos.php?id=${id}`, { method: 'DELETE', credentials: 'include' });
            cargarMantenimientos();
        }
    };

    if (!coche) return null;

    const fotosArray = coche.fotos ? coche.fotos.split(',') : [];
    const fotoAnterior = (e) => { e.stopPropagation(); setIndiceFotoModal(prev => (prev === 0 ? fotosArray.length - 1 : prev - 1)); };
    const fotoSiguiente = (e) => { e.stopPropagation(); setIndiceFotoModal(prev => (prev === fotosArray.length - 1 ? 0 : prev + 1)); };

    const consultarIA = async () => {
        setIaCargando(true); setIaRespuesta(null);
        try {
            const respuesta = await fetch(`${API_URL}/ia.php`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ marca: coche.marca, modelo: coche.modelo }), credentials: 'include'
            });
            const datos = await respuesta.json();
            if (datos.estado === 'exito') setIaRespuesta(datos.respuesta);
            else setIaRespuesta("❌ Error: " + datos.mensaje);
        } catch (error) { setIaRespuesta("❌ No se pudo conectar."); } finally { setIaCargando(false); }
    };

    const consultarDiagnosticoIA = async () => {
        if (!sintomaIA.trim()) return;
        setIaDiagnosticoCargando(true); setIaDiagnosticoRespuesta(null);
        try {
            const respuesta = await fetch(`${API_URL}/ia.php`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ marca: coche.marca, modelo: coche.modelo, sintoma: sintomaIA }), credentials: 'include'
            });
            const datos = await respuesta.json();
            if (datos.estado === 'exito') setIaDiagnosticoRespuesta(datos.respuesta);
            else setIaDiagnosticoRespuesta("❌ Error: " + datos.mensaje);
        } catch (error) { setIaDiagnosticoRespuesta("❌ No se pudo conectar."); } finally { setIaDiagnosticoCargando(false); }
    };

    return (
        <div className="modal-backdrop-custom" onClick={onClose} style={{ zIndex: 1050 }}>
            <div className="glass-card rounded-4 p-0 overflow-hidden modal-container-custom fade-in shadow-lg" onClick={e => e.stopPropagation()} style={{ border: '1px solid rgba(255,255,255,0.1)' }}>

                <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-white-10 bg-dark" style={{ borderBottom: '3px solid var(--ae-red)' }}>
                    <h4 className="fw-bold m-0 text-white">{coche.marca} <span className="text-danger">{coche.modelo}</span></h4>
                    <button className="btn btn-sm text-white opacity-50 hover-opacity-100 fs-5" onClick={onClose}><i className="bi bi-x-lg"></i></button>
                </div>

                <div className="d-flex bg-black" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <button className={`btn w-33 rounded-0 py-2 fw-bold text-uppercase small transition-all ${pestañaActual === 'detalles' ? 'bg-danger text-white' : 'text-white-50 hover-text-white'}`} onClick={() => setPestañaActual('detalles')} style={{ flex: 1 }}><i className="bi bi-info-square me-2"></i>Ficha</button>
                    <button className={`btn w-33 rounded-0 py-2 fw-bold text-uppercase small transition-all ${pestañaActual === 'ia' ? 'bg-danger text-white' : 'text-white-50 hover-text-white'}`} onClick={() => setPestañaActual('ia')} style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}><i className="bi bi-robot me-2"></i>Asistente</button>
                    <button className={`btn w-33 rounded-0 py-2 fw-bold text-uppercase small transition-all ${pestañaActual === 'mantenimiento' ? 'bg-danger text-white' : 'text-white-50 hover-text-white'}`} onClick={() => setPestañaActual('mantenimiento')} style={{ flex: 1 }}><i className="bi bi-wrench-adjustable me-2"></i>Historial</button>
                </div>

                <div className="p-0 overflow-auto" style={{ maxHeight: 'calc(90vh - 180px)', backgroundColor: 'rgba(10,10,10,0.9)' }}>

                    {pestañaActual === 'detalles' && (
                        <div className="fade-in">
                            {fotosArray.length > 0 ? (
                                <div className="position-relative bg-black d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
                                    <img src={`${API_URL}/uploads/${fotosArray[indiceFotoModal]}`} className="img-fluid w-100 object-fit-contain" alt="Coche" style={{ maxHeight: '400px' }} />
                                    {fotosArray.length > 1 && (
                                        <>
                                            <button className="btn position-absolute start-0 text-white fs-1 ms-2 opacity-50 hover-opacity-100" onClick={fotoAnterior}><i className="bi bi-chevron-left"></i></button>
                                            <button className="btn position-absolute end-0 text-white fs-1 me-2 opacity-50 hover-opacity-100" onClick={fotoSiguiente}><i className="bi bi-chevron-right"></i></button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="d-flex justify-content-center align-items-center bg-dark" style={{ height: '200px' }}><i className="bi bi-camera text-secondary opacity-25" style={{ fontSize: '4rem' }}></i></div>
                            )}
                            <div className="p-4 text-light">
                                <div className="row g-3">
                                    <div className="col-md-6"><div className="p-3 rounded border border-secondary shadow-sm" style={{ backgroundColor: 'rgba(30,30,30,0.6)' }}><p className="m-0 text-danger fw-bold small text-uppercase"><i className="bi bi-engine me-2"></i>Motor</p><p className="m-0 fw-bold fs-5 mt-1">{coche.motor || 'No especificado'}</p></div></div>
                                    <div className="col-md-6"><div className="p-3 rounded border border-secondary shadow-sm" style={{ backgroundColor: 'rgba(30,30,30,0.6)' }}><p className="m-0 text-danger fw-bold small text-uppercase"><i className="bi bi-card-checklist me-2"></i>Especificaciones</p><p className="m-0 text-md text-pre-wrap text-white-50 mt-1">{coche.especificaciones || 'Serie.'}</p></div></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {pestañaActual === 'ia' && (
                        <div className="p-4 fade-in text-light">
                            <div className="p-4 rounded border border-danger shadow-lg" style={{ backgroundColor: 'rgba(230,0,0,0.05)' }}>
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                                    <div><h5 className="fw-bold m-0 text-danger"><i className="bi bi-robot me-2"></i>Información del Modelo</h5></div>
                                    <button className="btn btn-outline-danger fw-bold shadow-sm" onClick={consultarIA} disabled={iaCargando}>
                                        {iaCargando ? <><span className="spinner-border spinner-border-sm me-2"></span>Analizando...</> : <><i className="bi bi-stars me-2"></i>Consultar</>}
                                    </button>
                                </div>
                                {iaRespuesta && (<div className="p-3 mt-3 rounded text-pre-wrap small border border-secondary bg-black bg-opacity-50">{iaRespuesta}</div>)}
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

                    {pestañaActual === 'mantenimiento' && (
                        <div className="p-4 fade-in text-light">
                            <h5 className="text-white fw-bold mb-4"><i className="bi bi-journal-check me-2 text-danger"></i>Libro de Mantenimiento</h5>

                            {cargandoMantenimientos ? (
                                <div className="text-center py-4"><div className="spinner-border text-danger"></div></div>
                            ) : mantenimientos.length === 0 ? (
                                <div className="text-center text-secondary py-4 border border-secondary rounded mb-4" style={{ borderStyle: 'dashed' }}>
                                    <i className="bi bi-tools fs-1 opacity-50 mb-2 d-block"></i>
                                    <p>No hay mantenimientos registrados.</p>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3 mb-4">
                                    {mantenimientos.map(m => (
                                        <div key={m.id} className="p-3 rounded border border-secondary d-flex justify-content-between align-items-center" style={{ backgroundColor: 'rgba(30,30,30,0.6)' }}>
                                            <div>
                                                <h6 className="text-white fw-bold m-0 mb-1">{m.tarea}</h6>
                                                <span className="text-secondary small"><i className="bi bi-speedometer2 me-1"></i>{m.km_actuales} km</span>
                                                <span className="text-secondary small ms-3"><i className="bi bi-calendar me-1"></i>{new Date(m.fecha).toLocaleDateString()}</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-3">
                                                <h5 className="text-danger fw-bold m-0">{m.coste > 0 ? `${m.coste} €` : '--'}</h5>
                                                <button className="btn btn-sm text-secondary hover-text-danger border-0 bg-transparent" onClick={() => borrarMantenimiento(m.id)}><i className="bi bi-trash fs-5"></i></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="text-center mt-2">
                                <button className="btn btn-outline-danger w-100 fw-bold py-3 text-white" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={añadirMantenimiento}>
                                    <i className="bi bi-plus-lg me-2"></i> Añadir Nuevo Registro
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-3 bg-black d-flex justify-content-end gap-2 border-top border-white-10">
                    <button className="btn btn-warning fw-bold px-4" onClick={() => onEdit(coche)}><i className="bi bi-pencil-square me-2"></i>Editar</button>
                    <button className="btn btn-outline-danger fw-bold" onClick={() => onDelete(coche.id)}><i className="bi bi-trash3"></i></button>
                </div>
            </div>
        </div>
    );
}

export default VehicleModal;