import React, { useState, useEffect } from 'react';
import './styles/App.css';
import Swal from 'sweetalert2';

import LoginForm from './components/LoginForm';
import Navbar from './components/Navbar';
import VehicleCard from './components/VehicleCard';
import VehicleModal from './components/VehicleModal';
import UserProfile from './components/UserProfile';
import EventList from './components/EventList';
import AdminDashboard from './components/AdminDashboard';
import Community from './components/Community';
import Marketplace from './components/Marketplace';
import Messages from './components/Messages';
import Footer from './components/Footer';

const API_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
    ? process.env.REACT_APP_API_URL
    : 'http://localhost/autoevents/backend';

function App() {
    const [usuario, setUsuario] = useState(() => {
        const usuarioGuardado = localStorage.getItem('ae_usuario');
        return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    });

    const [seccionActiva, setSeccionActiva] = useState('inicio');
    const [vehiculos, setVehiculos] = useState([]);
    const [mostrandoFormularioCoche, setMostrandoFormularioCoche] = useState(false);

    const [guardandoCoche, setGuardandoCoche] = useState(false);
    const [decodificando, setDecodificando] = useState(false); // Estado para la IA del VIN

    // Campo 'vin' al estado inicial
    const [nuevoCoche, setNuevoCoche] = useState({ marca: '', modelo: '', anio: '', motor: '', especificaciones: '', vin: '' });
    const [cocheEnEdicion, setCocheEnEdicion] = useState(null);
    const [archivosFotos, setArchivosFotos] = useState([]);

    const [cocheDetalleVista, setCocheDetalleVista] = useState(null);

    const marcasCoches = [
        "Abarth", "Alfa Romeo", "Alpine", "Aston Martin", "Audi", "Bentley", "BMW", "Bugatti", "Chevrolet",
        "Citroën", "Cupra", "Dacia", "DS", "Ferrari", "Fiat", "Ford", "Honda", "Hyundai", "Jaguar", "Jeep",
        "Kia", "Koenigsegg", "Lamborghini", "Lancia", "Land Rover", "Lexus", "Lotus", "Maserati", "Mazda",
        "McLaren", "Mercedes-Benz", "MG", "Mini", "Mitsubishi", "Nissan", "Pagani", "Peugeot", "Polestar",
        "Porsche", "Renault", "Rolls-Royce", "Seat", "Skoda", "Smart", "Subaru", "Suzuki", "Tesla", "Toyota",
        "Volkswagen", "Volvo"
    ];

    useEffect(() => {
        const validarSesion = async () => {
            if (usuario) {
                try {
                    const respuesta = await fetch(`${API_URL}/me.php`, { credentials: 'include' });
                    if (respuesta.ok) {
                        const datos = await respuesta.json();
                        if (datos.estado === 'exito') {
                            setUsuario(datos.usuario);
                            localStorage.setItem('ae_usuario', JSON.stringify(datos.usuario));
                        } else {
                            manejarLogout(false);
                        }
                    } else {
                        manejarLogout(false);
                    }
                } catch (error) {
                    console.error("Error al validar sesión", error);
                }
            }
        };
        validarSesion();
    }, []);

    const cargarVehiculos = async () => {
        if (!usuario) return;
        try {
            const respuesta = await fetch(`${API_URL}/vehiculos.php`, {
                method: 'GET',
                credentials: 'include'
            });
            const datos = await respuesta.json();
            if (datos.estado === 'exito') setVehiculos(datos.vehiculos);
        } catch (error) { console.error("Error al cargar vehículos", error); }
    };

    useEffect(() => {
        if (seccionActiva === 'garaje') cargarVehiculos();
    }, [seccionActiva, usuario]);

    const decodificarVIN = async () => {
        if (!nuevoCoche.vin || nuevoCoche.vin.length !== 17) {
            Swal.fire({ icon: 'warning', title: 'VIN Inválido', text: 'El número de bastidor debe tener exactamente 17 caracteres.', background: '#1a1a1a', color: '#fff' });
            return;
        }

        setDecodificando(true);
        try {
            const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${nuevoCoche.vin}?format=json`);
            const data = await res.json();
            const info = data.Results[0];

            if (info && info.Make) {
                const marcaAPI = info.Make.trim().toLowerCase();

                let marcaEncontrada = marcasCoches.find(m => m.toLowerCase() === marcaAPI);

                if (!marcaEncontrada) {
                    marcaEncontrada = marcasCoches.find(m => marcaAPI.includes(m.toLowerCase()) || m.toLowerCase().includes(marcaAPI));
                }

                let motorExtra = '';
                if (info.DisplacementL) motorExtra += `${info.DisplacementL}L `;
                if (info.EngineCylinders) motorExtra += `${info.EngineConfiguration || 'V'}${info.EngineCylinders} `;
                if (info.EngineHP) motorExtra += `${info.EngineHP}CV `;
                if (info.FuelTypePrimary) motorExtra += `(${info.FuelTypePrimary})`;

                let specsExtra = '';
                if (info.BodyClass) specsExtra += `${info.BodyClass}. `;
                if (info.DriveType) specsExtra += `Tracción: ${info.DriveType}. `;
                if (info.PlantCountry) specsExtra += `Fabricado en: ${info.PlantCountry}.`;

                setNuevoCoche(prev => ({
                    ...prev,
                    marca: marcaEncontrada ? marcaEncontrada : prev.marca, // Usa la marca exacta de TU lista
                    modelo: info.Model || prev.modelo,
                    anio: info.ModelYear || prev.anio,
                    motor: motorExtra.trim() || prev.motor,
                    especificaciones: specsExtra.trim() || prev.especificaciones
                }));

                Swal.fire({ icon: 'success', title: '¡Datos extraídos!', text: marcaEncontrada ? 'Marca y datos técnicos completados con éxito.' : 'Datos técnicos completados (Marca no detectada).', background: '#1a1a1a', color: '#fff', timer: 3000, showConfirmButton: false });
            } else {
                Swal.fire({ icon: 'error', title: 'No encontrado', text: 'La base de datos internacional no reconoce los detalles de este bastidor.', background: '#1a1a1a', color: '#fff' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error de API', text: 'No se pudo contactar con la base de datos de bastidores.', background: '#1a1a1a', color: '#fff' });
        } finally {
            setDecodificando(false);
        }
    };

    const manejarRegistroCoche = async (e) => {
        e.preventDefault();
        setGuardandoCoche(true);

        const formData = new FormData();
        formData.append('marca', nuevoCoche.marca);
        formData.append('modelo', nuevoCoche.modelo);
        formData.append('anio', nuevoCoche.anio);
        formData.append('motor', nuevoCoche.motor);
        formData.append('especificaciones', nuevoCoche.especificaciones);
        formData.append('vin', nuevoCoche.vin); // Enviamos el VIN al servidor

        if (cocheEnEdicion) formData.append('id', cocheEnEdicion);

        for (let i = 0; i < archivosFotos.length; i++) {
            if (i >= 4) break;
            formData.append('fotos[]', archivosFotos[i]);
        }

        try {
            const respuesta = await fetch(`${API_URL}/vehiculos.php`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const resultado = await respuesta.json();

            if (respuesta.ok && resultado.estado === 'exito') {
                setMostrandoFormularioCoche(false);
                setNuevoCoche({ marca: '', modelo: '', anio: '', motor: '', especificaciones: '', vin: '' });
                setCocheEnEdicion(null);
                setArchivosFotos([]);
                await cargarVehiculos();

                Swal.fire({
                    icon: 'success',
                    title: cocheEnEdicion ? '¡Actualizado!' : '¡Añadido!',
                    text: resultado.mensaje,
                    background: '#1a1a1a',
                    color: '#fff',
                    confirmButtonColor: '#e60000',
                    timer: 2000,
                    showConfirmButton: false
                });

            } else {
                Swal.fire({ icon: 'error', title: 'Oops...', text: resultado.mensaje || "Error al guardar", background: '#1a1a1a', color: '#fff', confirmButtonColor: '#e60000' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: "Error de conexión.", background: '#1a1a1a', color: '#fff', confirmButtonColor: '#e60000' });
        } finally {
            setGuardandoCoche(false);
        }
    };

    const eliminarCoche = (idCoche) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminará permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            background: '#1a1a1a',
            color: '#fff',
            confirmButtonColor: '#e60000',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const respuesta = await fetch(`${API_URL}/vehiculos.php?id=${idCoche}`, { method: 'DELETE', credentials: 'include' });
                    if (respuesta.ok) {
                        setCocheDetalleVista(null);
                        cargarVehiculos();
                        Swal.fire({ icon: 'success', title: 'Eliminado', background: '#1a1a1a', color: '#fff', timer: 1500, showConfirmButton: false });
                    }
                } catch (error) { console.error("Error", error); }
            }
        });
    };

    const iniciarEdicion = (coche) => {
        setNuevoCoche({
            marca: coche.marca,
            modelo: coche.modelo,
            anio: coche.anio,
            motor: coche.motor || '',
            especificaciones: coche.especificaciones || '',
            vin: coche.vin || '' // Recuperamos el VIN al editar
        });
        setCocheEnEdicion(coche.id); setArchivosFotos([]); setCocheDetalleVista(null); setMostrandoFormularioCoche(true); window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const manejarLoginExitoso = (datosUsuario) => {
        setUsuario(datosUsuario);
        localStorage.setItem('ae_usuario', JSON.stringify(datosUsuario));
        setSeccionActiva('inicio');
    };

    const manejarLogout = async (llamarApi = true) => {
        if (llamarApi) {
            try {
                await fetch(`${API_URL}/logout.php`, { method: 'POST', credentials: 'include' });
            } catch (error) {
                console.error("Error al hacer logout en servidor", error);
            }
        }
        setUsuario(null);
        localStorage.removeItem('ae_usuario');
    };

    if (!usuario) return <LoginForm onLoginSuccess={manejarLoginExitoso} />;

    return (
        <div className="dashboard-animated-bg relative-wrapper d-flex flex-column min-vh-100">
            {cocheDetalleVista && (
                <VehicleModal coche={cocheDetalleVista} onClose={() => setCocheDetalleVista(null)} onEdit={iniciarEdicion} onDelete={eliminarCoche} />
            )}

            <Navbar usuario={usuario} seccionActiva={seccionActiva} setSeccionActiva={setSeccionActiva} onLogout={manejarLogout} />

            <div className="container py-5 flex-grow-1">
                {seccionActiva === 'inicio' && (
                    <div className="fade-in">
                        <div className="d-flex justify-content-between align-items-end mb-4 border-bottom border-secondary pb-3">
                            <div>
                                <h2 className="fw-bold m-0 text-ae-theme"><i className="bi bi-calendar2-week me-2"></i>Calendario de Eventos</h2>
                                <p className="text-secondary m-0 mt-1">Descubre las mejores concentraciones y trackdays cerca de ti.</p>
                            </div>
                        </div>
                        <EventList usuario={usuario} />
                    </div>
                )}

                {seccionActiva === 'garaje' && (
                    <div className="fade-in">
                        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                            <h2 className="fw-bold m-0 text-ae-theme">Mi Garaje Virtual</h2>
                            <button className={`btn ${mostrandoFormularioCoche && !cocheEnEdicion ? 'btn-outline-danger' : 'ae-btn-primary'} fw-bold px-4 shadow`} onClick={() => { if (mostrandoFormularioCoche) { setMostrandoFormularioCoche(false); setCocheEnEdicion(null); setNuevoCoche({ marca: '', modelo: '', anio: '', motor: '', especificaciones: '', vin: '' }); setArchivosFotos([]); } else setMostrandoFormularioCoche(true); }}>
                                {mostrandoFormularioCoche && !cocheEnEdicion ? 'Cancelar Registro' : <><i className="bi bi-plus-lg me-2"></i>Añadir Vehículo</>}
                            </button>
                        </div>

                        {mostrandoFormularioCoche && (
                            <div className={`card glass-card border-0 mb-5 fade-in p-4 shadow-lg ${cocheEnEdicion ? 'form-card-edit' : 'form-card-new'}`}>
                                <form onSubmit={manejarRegistroCoche} className="row g-3">

                                    <div className="col-12 mb-2 p-3 rounded-4 border border-warning shadow-sm" style={{ backgroundColor: 'rgba(255, 193, 7, 0.05)' }}>
                                        <label className="form-label fw-bold text-warning"><i className="bi bi-magic me-2"></i>Escáner de Bastidor (Opcional)</label>
                                        <div className="input-group shadow-sm">
                                            <input
                                                type="text"
                                                className="form-control bg-dark text-white border-warning text-uppercase fw-bold"
                                                placeholder="Introduce los 17 caracteres del VIN..."
                                                maxLength="17"
                                                value={nuevoCoche.vin}
                                                onChange={(e) => setNuevoCoche({...nuevoCoche, vin: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')})}
                                                disabled={guardandoCoche}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-warning fw-bold px-4"
                                                onClick={decodificarVIN}
                                                disabled={decodificando || guardandoCoche || nuevoCoche.vin.length !== 17}
                                            >
                                                {decodificando ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-search me-2"></i>Decodificar</>}
                                            </button>
                                        </div>
                                        <small className="text-secondary mt-2 d-block">Introduce tu bastidor para que descarguemos automáticamente los datos oficiales desde la NHTSA.</small>
                                    </div>

                                    <div className="col-md-3"><label className="form-label text-light">Marca</label><select className="form-select ae-input" required value={nuevoCoche.marca} onChange={e => setNuevoCoche({...nuevoCoche, marca: e.target.value})} disabled={guardandoCoche}><option value="">Selecciona...</option>{marcasCoches.map(marca => <option key={marca} value={marca}>{marca}</option>)}</select></div>
                                    <div className="col-md-3"><label className="form-label text-light">Modelo</label><input type="text" className="form-control ae-input" required value={nuevoCoche.modelo} onChange={e => setNuevoCoche({...nuevoCoche, modelo: e.target.value})} disabled={guardandoCoche} /></div>
                                    <div className="col-md-2"><label className="form-label text-light">Año</label><input type="number" min="1886" max="2027" className="form-control ae-input" required value={nuevoCoche.anio} onChange={e => setNuevoCoche({...nuevoCoche, anio: e.target.value})} disabled={guardandoCoche} /></div>
                                    <div className="col-md-4"><label className="form-label text-light">Subir Fotos (Máx 4)</label><input type="file" className="form-control ae-input" multiple accept="image/png, image/jpeg, image/webp" onChange={e => setArchivosFotos(e.target.files)} disabled={guardandoCoche} /></div>

                                    <div className="col-md-4 mt-3"><label className="form-label text-light">Motor</label><input type="text" className="form-control ae-input" placeholder="Ej: 1.4 TSI Híbrido" value={nuevoCoche.motor} onChange={e => setNuevoCoche({...nuevoCoche, motor: e.target.value})} disabled={guardandoCoche} /></div>
                                    <div className="col-md-8 mt-3"><label className="form-label text-light">Especificaciones / Mods</label><input type="text" className="form-control ae-input" placeholder="Difusor Zaero, llantas, repro..." value={nuevoCoche.especificaciones} onChange={e => setNuevoCoche({...nuevoCoche, especificaciones: e.target.value})} disabled={guardandoCoche} /></div>

                                    <div className="col-12 text-end mt-4">
                                        <button type="submit" className={`btn ${cocheEnEdicion ? 'btn-warning text-dark' : 'ae-btn-primary'} fw-bold px-5 py-2`} disabled={guardandoCoche}>
                                            {guardandoCoche ? <><span className="spinner-border spinner-border-sm me-2"></span> Guardando...</> : <><i className="bi bi-save me-2"></i>Guardar Vehículo</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="row g-4">
                            {vehiculos.map((coche) => <VehicleCard key={coche.id} coche={coche} alHacerClick={setCocheDetalleVista} />)}
                        </div>
                    </div>
                )}

                {seccionActiva === 'comunidad' && <Community />}
                {seccionActiva === 'tienda' && <Marketplace usuario={usuario} />}
                {seccionActiva === 'mensajes' && <Messages usuario={usuario} />}
                {seccionActiva === 'perfil' && <UserProfile usuario={usuario} setUsuario={setUsuario} />}
                {seccionActiva === 'admin' && <AdminDashboard />}
            </div>

            <Footer setSeccionActiva={setSeccionActiva} />
        </div>
    );
}

export default App;