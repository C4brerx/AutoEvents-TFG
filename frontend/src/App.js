import React, { useState, useEffect } from 'react';
import './styles/App.css';
import Swal from 'sweetalert2';

// Importamos los componentes modulares
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


function App() {
    const [usuario, setUsuario] = useState(() => {
        const usuarioGuardado = localStorage.getItem('ae_usuario');
        return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    });

    const [seccionActiva, setSeccionActiva] = useState('inicio');
    const [vehiculos, setVehiculos] = useState([]);
    const [mostrandoFormularioCoche, setMostrandoFormularioCoche] = useState(false);

    const [guardandoCoche, setGuardandoCoche] = useState(false);
    const [nuevoCoche, setNuevoCoche] = useState({ marca: '', modelo: '', anio: '', motor: '', especificaciones: '' });
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

    const cargarVehiculos = async () => {
        if (!usuario) return;
        try {
            const respuesta = await fetch('http://localhost/autoevents/backend/vehiculos.php', {
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

    const manejarRegistroCoche = async (e) => {
        e.preventDefault();
        setGuardandoCoche(true);

        const formData = new FormData();
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
                credentials: 'include'
            });
            const resultado = await respuesta.json();

            if (respuesta.ok && resultado.estado === 'exito') {
                setMostrandoFormularioCoche(false);
                setNuevoCoche({ marca: '', modelo: '', anio: '', motor: '', especificaciones: '' });
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
                    const respuesta = await fetch(`http://localhost/autoevents/backend/vehiculos.php?id=${idCoche}`, { method: 'DELETE', credentials: 'include' });
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
        setNuevoCoche({ marca: coche.marca, modelo: coche.modelo, anio: coche.anio, motor: coche.motor || '', especificaciones: coche.especificaciones || '' });
        setCocheEnEdicion(coche.id); setArchivosFotos([]); setCocheDetalleVista(null); setMostrandoFormularioCoche(true); window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const manejarLoginExitoso = (datosUsuario) => {
        setUsuario(datosUsuario);
        localStorage.setItem('ae_usuario', JSON.stringify(datosUsuario));
        setSeccionActiva('inicio');
    };

    const manejarLogout = () => {
        setUsuario(null);
        localStorage.removeItem('ae_usuario');
    };

    if (!usuario) return <LoginForm onLoginSuccess={manejarLoginExitoso} />;

    return (
        <div className="dashboard-animated-bg relative-wrapper">
            {cocheDetalleVista && (
                <VehicleModal coche={cocheDetalleVista} onClose={() => setCocheDetalleVista(null)} onEdit={iniciarEdicion} onDelete={eliminarCoche} />
            )}

            <Navbar usuario={usuario} seccionActiva={seccionActiva} setSeccionActiva={setSeccionActiva} onLogout={manejarLogout} />

            <div className="container py-5">

                {/* SECCIÓN INICIO */}
                {seccionActiva === 'inicio' && (
                    <div className="fade-in">
                        <div className="d-flex justify-content-between align-items-end mb-4 border-bottom border-secondary pb-3">
                            <div>
                                <h2 className="fw-bold m-0 text-ae-theme"><i className="bi bi-calendar2-week me-2"></i>Calendario de Eventos</h2>
                                <p className="text-secondary m-0 mt-1">Descubre las mejores concentraciones y trackdays cerca de ti.</p>
                            </div>
                        </div>
                        <EventList />
                    </div>
                )}

                {/* SECCIÓN GARAJE */}
                {seccionActiva === 'garaje' && (
                    <div className="fade-in">
                        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                            <h2 className="fw-bold m-0 text-ae-theme">Mi Garaje Virtual</h2>
                            <button className={`btn ${mostrandoFormularioCoche && !cocheEnEdicion ? 'btn-outline-danger' : 'ae-btn-primary'} fw-bold px-4 shadow`} onClick={() => { if (mostrandoFormularioCoche) { setMostrandoFormularioCoche(false); setCocheEnEdicion(null); setNuevoCoche({ marca: '', modelo: '', anio: '', motor: '', especificaciones: '' }); setArchivosFotos([]); } else setMostrandoFormularioCoche(true); }}>
                                {mostrandoFormularioCoche && !cocheEnEdicion ? 'Cancelar Registro' : <><i className="bi bi-plus-lg me-2"></i>Añadir Vehículo</>}
                            </button>
                        </div>

                        {mostrandoFormularioCoche && (
                            <div className={`card glass-card border-0 mb-5 fade-in p-4 shadow-lg ${cocheEnEdicion ? 'form-card-edit' : 'form-card-new'}`}>
                                <form onSubmit={manejarRegistroCoche} className="row g-3">
                                    <div className="col-md-3"><label className="form-label text-light">Marca</label><select className="form-select ae-input" required value={nuevoCoche.marca} onChange={e => setNuevoCoche({...nuevoCoche, marca: e.target.value})} disabled={guardandoCoche}><option value="">Selecciona...</option>{marcasCoches.map(marca => <option key={marca} value={marca}>{marca}</option>)}</select></div>
                                    <div className="col-md-3"><label className="form-label text-light">Modelo</label><input type="text" className="form-control ae-input" required value={nuevoCoche.modelo} onChange={e => setNuevoCoche({...nuevoCoche, modelo: e.target.value})} disabled={guardandoCoche} /></div>
                                    <div className="col-md-2"><label className="form-label text-light">Año</label><input type="number" min="1900" max="2026" className="form-control ae-input" required value={nuevoCoche.anio} onChange={e => setNuevoCoche({...nuevoCoche, anio: e.target.value})} disabled={guardandoCoche} /></div>
                                    <div className="col-md-4"><label className="form-label text-light">Subir Fotos (Máx 4)</label><input type="file" className="form-control ae-input" multiple accept="image/png, image/jpeg, image/webp" onChange={e => setArchivosFotos(e.target.files)} disabled={guardandoCoche} /></div>
                                    <div className="col-md-4 mt-3"><label className="form-label text-light">Motor</label><input type="text" className="form-control ae-input" value={nuevoCoche.motor} onChange={e => setNuevoCoche({...nuevoCoche, motor: e.target.value})} disabled={guardandoCoche} /></div>
                                    <div className="col-md-8 mt-3"><label className="form-label text-light">Especificaciones / Mods</label><input type="text" className="form-control ae-input" value={nuevoCoche.especificaciones} onChange={e => setNuevoCoche({...nuevoCoche, especificaciones: e.target.value})} disabled={guardandoCoche} /></div>

                                    <div className="col-12 text-end mt-4">
                                        <button type="submit" className={`btn ${cocheEnEdicion ? 'btn-warning' : 'btn-light'} fw-bold text-dark px-5`} disabled={guardandoCoche}>
                                            {guardandoCoche ? <><span className="spinner-border spinner-border-sm me-2"></span> Guardando...</> : <><i className="bi bi-save me-2"></i>Guardar</>}
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

                {/* SECCIÓN COMUNIDAD */}
                {seccionActiva === 'comunidad' && (
                    <Community />
                )}

                {/* SECCIÓN TIENDA */}
                {seccionActiva === 'tienda' && (
                    <Marketplace usuario={usuario} />
                )}
                {/* SECCIÓN MENSAJES */}
                {seccionActiva === 'mensajes' && (
                    <Messages usuario={usuario} />
                )}

                {/* SECCIÓN PERFIL */}
                {seccionActiva === 'perfil' && (
                    <UserProfile usuario={usuario} setUsuario={setUsuario} />
                )}

                {/* SECCIÓN ADMIN */}
                {seccionActiva === 'admin' && (
                    <AdminDashboard />
                )}

            </div>
        </div>
    );
}

export default App;