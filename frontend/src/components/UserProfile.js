import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

function UserProfile({ usuario, setUsuario }) {
    // --- ESTADOS DEL FORMULARIO DE PERFIL ---
    const [nombre, setNombre] = useState('');
    const [biografia, setBiografia] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState(null);
    const [fotoPrevia, setFotoPrevia] = useState(null);
    const [guardando, setGuardando] = useState(false);

    // --- ESTADOS DE GAMIFICACIÓN ---
    const [stats, setStats] = useState(null);
    const [cargandoDatos, setCargandoDatos] = useState(true);

    useEffect(() => {
        // Carga simultánea: Perfil para editar + Logros para la licencia
        const cargarDatos = async () => {
            try {
                // 1. Obtener Perfil
                const resPerfil = await fetch('http://localhost/autoevents/backend/perfil.php', { method: 'GET', credentials: 'include' });
                const dataPerfil = await resPerfil.json();
                if (dataPerfil.estado === 'exito' && dataPerfil.perfil) {
                    setNombre(dataPerfil.perfil.nombre || '');
                    setBiografia(dataPerfil.perfil.biografia || '');
                    if (dataPerfil.perfil.foto_perfil) {
                        setFotoPrevia(`http://localhost/autoevents/backend/uploads/perfiles/${dataPerfil.perfil.foto_perfil}`);
                    }
                }

                // 2. Obtener Logros (XP y Nivel)
                const resLogros = await fetch('http://localhost/autoevents/backend/logros.php', { method: 'GET', credentials: 'include' });
                const dataLogros = await resLogros.json();
                if (dataLogros.estado === 'exito') {
                    setStats(dataLogros.stats);
                }
            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                setCargandoDatos(false);
            }
        };
        cargarDatos();
    }, []);

    const manejarActualizacion = async (e) => {
        e.preventDefault();
        setGuardando(true);

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('biografia', biografia);
        if (fotoPerfil) formData.append('foto_perfil', fotoPerfil);

        try {
            const res = await fetch('http://localhost/autoevents/backend/perfil.php', { method: 'POST', body: formData, credentials: 'include' });
            const data = await res.json();

            if (res.ok && data.estado === 'exito') {
                Swal.fire({ icon: 'success', title: '¡Perfil Actualizado!', text: data.mensaje, background: '#1a1a1a', color: '#fff', confirmButtonColor: '#e60000', timer: 2000, showConfirmButton: false });

                // Actualizamos la sesión global
                setUsuario({...usuario, nombre: data.perfil.nombre, foto_perfil: data.perfil.foto_perfil});
                localStorage.setItem('ae_usuario', JSON.stringify({...usuario, nombre: data.perfil.nombre, foto_perfil: data.perfil.foto_perfil}));

                if (data.perfil.foto_perfil) {
                    setFotoPrevia(`http://localhost/autoevents/backend/uploads/perfiles/${data.perfil.foto_perfil}`);
                }
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: data.mensaje, background: '#1a1a1a', color: '#fff', confirmButtonColor: '#e60000' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#e60000' });
        } finally {
            setGuardando(false);
        }
    };

    const cambiarFoto = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFotoPerfil(file);
            setFotoPrevia(URL.createObjectURL(file)); // Muestra la previsualización al instante
        }
    };

    if (cargandoDatos) return <div className="text-center py-5"><span className="spinner-border text-danger"></span></div>;

    const avatarMostrar = fotoPrevia || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=150';

    return (
        <div className="fade-in">

            {/* SECCIÓN 1: GAMIFICACIÓN (LICENCIA DE PILOTO Y TROFEOS)   */}

            <div className="mb-5">
                <h2 className="fw-bold mb-4 text-ae-theme"><i className="bi bi-person-badge me-2"></i>Licencia de Piloto</h2>

                <div className="row g-4">
                    {/* Tarjeta de Nivel y XP */}
                    <div className="col-lg-5">
                        <div className="glass-card rounded-4 p-4 text-center border border-secondary shadow-lg h-100 position-relative overflow-hidden">
                            <div className="position-absolute top-0 start-0 w-100 bg-danger opacity-25" style={{ height: '100px', filter: 'blur(20px)' }}></div>

                            <img src={avatarMostrar} alt="Perfil" className="rounded-circle border border-4 border-dark shadow-lg object-fit-cover position-relative mb-3 transition-all" style={{ width: '120px', height: '120px', zIndex: 2 }} />
                            <h3 className="fw-bold text-white mb-0">{usuario.nombre}</h3>
                            <p className="text-secondary mb-4">{usuario.email}</p>

                            <div className="bg-black bg-opacity-50 rounded-4 p-4 border border-white-10 text-start">
                                <div className="d-flex justify-content-between align-items-end mb-2">
                                    <span className="fw-bold text-light fs-5">Nivel {stats?.nivel || 1}</span>
                                    <span className="text-secondary small">{stats?.xp_total || 0} XP Total</span>
                                </div>

                                <div className="progress bg-dark" style={{ height: '12px', borderRadius: '10px' }}>
                                    <div className="progress-bar bg-danger progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: `${stats?.progreso || 0}%`, boxShadow: '0 0 10px #dc3545' }}></div>
                                </div>
                                <p className="text-end text-muted mt-1 m-0" style={{ fontSize: '0.7rem' }}>
                                    Faltan {1000 - ((stats?.xp_total || 0) % 1000)} XP para el Nivel {(stats?.nivel || 1) + 1}
                                </p>
                            </div>

                            <div className="d-flex justify-content-around mt-4">
                                <div className="text-center">
                                    <h4 className="fw-bold text-white mb-0">{stats?.coches || 0}</h4>
                                    <small className="text-secondary text-uppercase">Vehículos</small>
                                </div>
                                <div className="text-center">
                                    <h4 className="fw-bold text-white mb-0">{stats?.eventos || 0}</h4>
                                    <small className="text-secondary text-uppercase">Asistencias</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vitrina de Trofeos */}
                    <div className="col-lg-7">
                        <div className="glass-card rounded-4 p-4 border border-secondary shadow-lg h-100">
                            <h4 className="fw-bold text-light border-bottom border-white-10 pb-3 mb-4"><i className="bi bi-award-fill text-warning me-2"></i>Vitrina de Trofeos</h4>

                            {!stats || stats.logros.length === 0 ? (
                                <div className="text-center text-secondary py-5">
                                    <i className="bi bi-shield-slash fs-1 d-block mb-3 opacity-50"></i>
                                    <p>Aún no tienes insignias.</p>
                                    <small>Añade coches a tu garaje o apúntate a eventos para ganar XP.</small>
                                </div>
                            ) : (
                                <div className="row g-3">
                                    {stats.logros.map((logro, index) => (
                                        <div className="col-md-6 fade-in" key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                                            <div className="d-flex align-items-center p-3 rounded-3 bg-black bg-opacity-50 border border-white-10 shadow-sm">
                                                <div className={`p-3 rounded-circle bg-opacity-10 me-3 ${logro.bg} border border-secondary`} style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <i className={`bi ${logro.icono} fs-3 ${logro.color}`}></i>
                                                </div>
                                                <div>
                                                    <h6 className="fw-bold text-light m-0">{logro.titulo}</h6>
                                                    <p className="text-secondary m-0" style={{ fontSize: '0.8rem' }}>{logro.desc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ======================================================== */}
            {/* SECCIÓN 2: AJUSTES DE CUENTA (TU FORMULARIO ORIGINAL)    */}
            {/* ======================================================== */}
            <h3 className="fw-bold mb-4 text-white"><i className="bi bi-gear-fill me-2"></i>Ajustes de Cuenta</h3>

            <div className="card glass-card border-0 p-5 shadow-lg">
                <form onSubmit={manejarActualizacion} className="row g-4 align-items-center">

                    {/* AVATAR UPLOAD */}
                    <div className="col-md-4 text-center">
                        <div className="mb-3 position-relative d-inline-block">
                            <img src={avatarMostrar} alt="Avatar Edit" className="rounded-circle border border-secondary border-3" style={{ width: '150px', height: '150px', objectFit: 'cover' }} />
                            <label htmlFor="upload-foto" className="btn btn-danger rounded-circle position-absolute bottom-0 end-0 shadow d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', cursor: 'pointer', transform: 'translate(10%, 10%)' }}>
                                <i className="bi bi-camera-fill"></i>
                            </label>
                            <input id="upload-foto" type="file" className="d-none" accept="image/png, image/jpeg, image/webp" onChange={cambiarFoto} disabled={guardando} />
                        </div>
                        <p className="text-secondary small mb-0">Cambiar Foto de Perfil</p>
                    </div>

                    {/* CAMPOS DEL FORMULARIO */}
                    <div className="col-md-8">
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label text-light fw-bold">Nombre a mostrar</label>
                                <input type="text" className="form-control ae-input" value={nombre} onChange={(e) => setNombre(e.target.value)} required disabled={guardando} />
                            </div>
                            <div className="col-12">
                                <label className="form-label text-light fw-bold">Biografía / Sobre ti</label>
                                <textarea className="form-control ae-input" rows="4" placeholder="Ej: Fanático de las tandas y de la restauración de motores..." value={biografia} onChange={(e) => setBiografia(e.target.value)} disabled={guardando}></textarea>
                            </div>
                            <div className="col-12 text-end mt-4">
                                <button type="submit" className="btn ae-btn-primary fw-bold px-5 py-2" disabled={guardando}>
                                    {guardando ? <><span className="spinner-border spinner-border-sm me-2"></span> Guardando...</> : <><i className="bi bi-save me-2"></i>Actualizar Perfil</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

        </div>
    );
}

export default UserProfile;