import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import Swal from 'sweetalert2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// CORRECCIÓN TUTOR: Uso de variable de entorno
const API_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
    ? process.env.REACT_APP_API_URL
    : 'http://localhost/autoevents/backend';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    // ==========================================
    // NUEVO: ESTADOS PARA BUSCADOR Y PAGINACIÓN
    // ==========================================
    const [busquedaUsuario, setBusquedaUsuario] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const usuariosPorPagina = 5; // Muestra 5 usuarios por página para no saturar la vista

    const cargarDatos = async () => {
        try {
            const resStats = await fetch(`${API_URL}/admin_stats.php`, { credentials: 'include' });
            const dataStats = await resStats.json();

            const resUsers = await fetch(`${API_URL}/admin_usuarios.php`, { credentials: 'include' });
            const dataUsers = await resUsers.json();

            if (dataStats.estado === 'exito') setStats(dataStats);
            if (dataUsers.estado === 'exito') setUsuarios(dataUsers.usuarios);

            setLoading(false);
        } catch (err) {
            console.error("Error al cargar admin panel", err);
            setLoading(false);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    // Resetear a la página 1 cada vez que el usuario escribe algo en el buscador
    useEffect(() => {
        setPaginaActual(1);
    }, [busquedaUsuario]);

    const editarUsuario = (user) => {
        Swal.fire({
            title: `Editar a ${user.nombre}`,
            background: '#1a1a1a',
            color: '#fff',
            html: `
                <input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${user.nombre}">
                <input id="swal-email" class="swal2-input" placeholder="Email" value="${user.email}">
                <select id="swal-rol" class="swal2-select" style="display:flex; margin: 1em auto; width: 70%;">
                    <option value="usuario" ${user.rol === 'usuario' ? 'selected' : ''}>Usuario</option>
                    <option value="admin" ${user.rol === 'admin' ? 'selected' : ''}>Administrador</option>
                </select>
            `,
            confirmButtonColor: '#e60000',
            confirmButtonText: 'Guardar Cambios',
            showCancelButton: true,
            preConfirm: () => {
                return {
                    id: user.id,
                    nombre: document.getElementById('swal-nombre').value,
                    email: document.getElementById('swal-email').value,
                    rol: document.getElementById('swal-rol').value
                }
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`${API_URL}/admin_usuarios.php`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(result.value),
                        credentials: 'include'
                    });
                    const data = await res.json();
                    if (res.ok && data.estado === 'exito') {
                        Swal.fire({ icon: 'success', title: 'Actualizado', background: '#1a1a1a', color: '#fff', timer: 1500, showConfirmButton: false });
                        cargarDatos();
                    } else {
                        Swal.fire({ icon: 'error', title: 'Atención', text: data.mensaje || 'Error al actualizar', background: '#1a1a1a', color: '#fff' });
                    }
                } catch (error) { console.error("Fallo de red:", error); }
            }
        });
    };

    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.07)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '20px',
        color: '#ffffff',
    };

    if (loading) return <div className="text-center text-light mt-5"><h4>Cargando panel...</h4></div>;

    const dataMarcas = {
        labels: stats?.grafico_marcas?.map(item => item.marca) || [],
        datasets: [{ label: 'Vehículos', data: stats?.grafico_marcas?.map(item => item.cantidad) || [], backgroundColor: '#ff4d4d', borderRadius: 8 }],
    };

    const optionsBar = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } }, x: { ticks: { color: '#ffffff' }, grid: { display: false } } }
    };

    // ==========================================
    // LÓGICA DE FILTRADO Y PAGINACIÓN
    // ==========================================
    // 1. Filtrar por nombre o ID
    const usuariosFiltrados = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
        u.id.toString().includes(busquedaUsuario)
    );

    // 2. Calcular los índices para recortar el array
    const indiceUltimoUsuario = paginaActual * usuariosPorPagina;
    const indicePrimerUsuario = indiceUltimoUsuario - usuariosPorPagina;

    // 3. Obtener solo los 5 usuarios de la página actual
    const usuariosActuales = usuariosFiltrados.slice(indicePrimerUsuario, indiceUltimoUsuario);
    const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina) || 1;

    return (
        <div className="container mt-4 mb-5 fade-in">
            <h2 className="text-light fw-bold mb-4">👑 Panel de Control</h2>

            {/* MÉTRICAS */}
            <div className="row g-4 mb-5">
                {[ { t: "Usuarios", n: stats?.tarjetas?.usuarios || 0, c: "bi-people" }, { t: "Coches", n: stats?.tarjetas?.vehiculos || 0, c: "bi-car-front" }, { t: "Eventos", n: stats?.tarjetas?.eventos || 0, c: "bi-calendar-event" }, { t: "Reservas", n: stats?.tarjetas?.asistencias || 0, c: "bi-ticket-perforated" } ].map((card, i) => (
                    <div className="col-md-3" key={i}><div className="p-4 text-center shadow" style={glassStyle}><i className={`${card.c} fs-1 text-ae-theme mb-2 d-block`}></i><h5 className="text-white opacity-75 small text-uppercase fw-bold">{card.t}</h5><h1 className="fw-bold m-0 text-white">{card.n}</h1></div></div>
                ))}
            </div>

            {/* GRÁFICOS */}
            <div className="row g-4 mb-5">
                <div className="col-md-7"><div className="p-4 h-100" style={glassStyle}><h5 className="text-white fw-bold mb-4 text-center">Top 5 Marcas en Garajes</h5><Bar data={dataMarcas} options={optionsBar} /></div></div>
                <div className="col-md-5"><div className="p-4 h-100 text-center" style={glassStyle}><h5 className="text-white fw-bold mb-4">Tipos de Eventos</h5><Doughnut data={{ labels: stats?.grafico_tipos?.map(i => i.tipo) || [], datasets: [{ data: stats?.grafico_tipos?.map(i => i.cantidad) || [], backgroundColor: ['#ffc107', '#0dcaf0', '#198754', '#6610f2'], borderWidth: 0 }] }} options={{ plugins: { legend: { labels: { color: '#fff' }, position: 'bottom' } } }} /></div></div>
            </div>

            {/* GESTIÓN DE USUARIOS */}
            <div className="p-4 shadow-lg mb-5" style={glassStyle}>

                {/* Cabecera con Título y Buscador */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                    <h4 className="text-light fw-bold m-0"><i className="bi bi-person-gear me-2 text-ae-theme"></i>Gestión de Usuarios</h4>

                    <div className="input-group" style={{ maxWidth: '300px' }}>
                        <span className="input-group-text bg-dark border-secondary text-secondary"><i className="bi bi-search"></i></span>
                        <input
                            type="text"
                            className="form-control bg-dark text-white border-secondary shadow-none"
                            placeholder="Buscar por nombre o ID..."
                            value={busquedaUsuario}
                            onChange={(e) => setBusquedaUsuario(e.target.value)}
                        />
                    </div>
                </div>

                {/* --- MODO MÓVIL --- */}
                <div className="d-block d-lg-none ae-user-list-mobile">
                    {usuariosActuales.length === 0 ? (
                        <div className="text-center text-secondary py-4"><i className="bi bi-search fs-1 mb-2 d-block"></i>No se encontraron usuarios.</div>
                    ) : (
                        usuariosActuales.map(u => (
                            <div key={u.id} className="p-3 mb-3 border border-secondary border-opacity-50 bg-black bg-opacity-25 rounded-3 shadow-sm fade-in">
                                <div className="row g-2 mb-2">
                                    <div className="col-4 text-secondary text-capitalize small fw-bold">ID:</div>
                                    <div className="col-8 text-secondary fw-bold">#{u.id}</div>
                                </div>
                                <div className="row g-2 mb-2">
                                    <div className="col-4 text-secondary text-capitalize small fw-bold">Nombre:</div>
                                    <div className="col-8 text-light fw-bold text-truncate">{u.nombre}</div>
                                </div>
                                <div className="row g-2 mb-2">
                                    <div className="col-4 text-secondary text-capitalize small fw-bold">Email:</div>
                                    <div className="col-8 text-white-50 text-truncate">{u.email}</div>
                                </div>
                                <div className="row g-2 mb-3 align-items-center">
                                    <div className="col-4 text-secondary text-capitalize small fw-bold">Rol:</div>
                                    <div className="col-8">
                                        <span className={`badge px-3 py-1 ${u.rol === 'admin' ? 'bg-warning text-dark' : 'bg-dark border border-secondary text-light'}`}>
                                            {u.rol.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <button className="btn btn-warning btn-sm text-dark fw-bold px-4 rounded-pill shadow" onClick={() => editarUsuario(u)}>
                                        <i className="bi bi-pencil-square me-1"></i> Editar Piloto
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* --- MODO PC --- */}
                <div className="ae-table-container d-none d-lg-block">
                    <table className="table ae-table align-middle mb-0">
                        <thead>
                        <tr>
                            <th className="text-center" style={{width: '80px'}}>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th className="text-center">Rol</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {usuariosActuales.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center text-secondary py-4">No se encontraron usuarios que coincidan con la búsqueda.</td>
                            </tr>
                        ) : (
                            usuariosActuales.map(u => (
                                <tr key={u.id} className="fade-in">
                                    <td className="text-secondary text-center fw-bold">#{u.id}</td>
                                    <td className="fw-bold text-light">{u.nombre}</td>
                                    <td className="text-white-50">{u.email}</td>
                                    <td className="text-center">
                                            <span className={`badge px-3 py-2 ${u.rol === 'admin' ? 'bg-warning text-dark shadow-sm' : 'bg-dark border border-secondary text-light'}`}>
                                                {u.rol.toUpperCase()}
                                            </span>
                                    </td>
                                    <td className="text-center">
                                        <button className="btn-ae-edit" onClick={() => editarUsuario(u)}>
                                            <i className="bi bi-pencil-square me-1"></i> Editar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* --- CONTROLES DE PAGINACIÓN --- */}
                {totalPaginas > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top border-secondary border-opacity-50">
                        <button
                            className="btn btn-outline-secondary text-light rounded-pill px-4"
                            onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                            disabled={paginaActual === 1}
                        >
                            <i className="bi bi-chevron-left me-1"></i> Anterior
                        </button>

                        <span className="text-secondary small fw-bold">
                            Página {paginaActual} de {totalPaginas}
                        </span>

                        <button
                            className="btn btn-outline-secondary text-light rounded-pill px-4"
                            onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                            disabled={paginaActual === totalPaginas}
                        >
                            Siguiente <i className="bi bi-chevron-right ms-1"></i>
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminDashboard;