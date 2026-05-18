import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const API_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
    ? process.env.REACT_APP_API_URL
    : 'http://localhost/autoevents/backend';

const Marketplace = ({ usuario }) => {
    const [productos, setProductos] = useState([]);
    const [misVehiculos, setMisVehiculos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [carrito, setCarrito] = useState([]);

    const [busqueda, setBusqueda] = useState('');
    const [categoriaActiva, setCategoriaActiva] = useState('Todas');
    const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState('');
    const [modoVenta, setModoVenta] = useState('oficial');

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                // CORRECCIÓN TUTOR: Uso de API_URL
                const resTienda = await fetch(`${API_URL}/marketplace.php`, { credentials: 'include' });
                const dataTienda = await resTienda.json();

                const resGaraje = await fetch(`${API_URL}/vehiculos.php`, { credentials: 'include' });
                const dataGaraje = await resGaraje.json();

                if (dataTienda.estado === 'exito') setProductos(dataTienda.productos);
                if (dataGaraje.estado === 'exito') setMisVehiculos(dataGaraje.vehiculos);

            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, []);

    const productosModoActual = productos.filter(p => (p.tipo_venta || 'oficial') === modoVenta);
    const categoriasUnicas = ['Todas', ...new Set(productosModoActual.map(p => p.categoria))];

    const productosFiltrados = productosModoActual.filter(p => {
        const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.descripcion.toLowerCase().includes(busqueda.toLowerCase());
        const coincideCategoria = categoriaActiva === 'Todas' || p.categoria === categoriaActiva;
        const coincideVehiculo = !vehiculoSeleccionado || p.marca_compatible === 'Todas' || p.marca_compatible === vehiculoSeleccionado;
        return coincideBusqueda && coincideCategoria && coincideVehiculo;
    });

    const añadirAlCarrito = (producto) => {
        setCarrito([...carrito, producto]);
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Añadido al carrito', showConfirmButton: false, timer: 1500, background: '#1a1a1a', color: '#fff' });
    };

    const verCarrito = () => {
        if (carrito.length === 0) {
            Swal.fire({ icon: 'info', title: 'Carrito vacío', text: '¡Añade algunos productos primero!', background: '#1a1a1a', color: '#fff' });
            return;
        }

        const total = carrito.reduce((sum, item) => sum + parseFloat(item.precio), 0);
        let listaHTML = '<ul style="text-align: left; list-style: none; padding: 0;">';
        carrito.forEach((item) => {
            listaHTML += `<li style="margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 5px; display:flex; justify-content:space-between;">
                <span>${item.nombre}</span> <strong style="color: #ff4d4d;">${item.precio} €</strong>
            </li>`;
        });
        listaHTML += '</ul>';

        Swal.fire({
            title: 'Tu Carrito',
            html: listaHTML + `<h3 style="margin-top: 20px;">Total: <span class="text-danger">${total.toFixed(2)} €</span></h3>`,
            background: '#1a1a1a', color: '#fff', confirmButtonColor: '#e60000', confirmButtonText: 'Tramitar Pedido', showCancelButton: true, cancelButtonText: 'Seguir comprando'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({ icon: 'success', title: '¡Pedido Realizado!', text:'Te hemos enviado un email con el seguimiento.', background: '#1a1a1a', color: '#fff' });
                setCarrito([]);
            }
        });
    };

    const contactarVendedor = async (producto) => {
        const { value: mensaje } = await Swal.fire({
            title: `Contactar a ${producto.vendedor_nombre}`,
            input: 'textarea',
            inputLabel: `Pregunta sobre: ${producto.nombre}`,
            inputPlaceholder: 'Hola, ¿sigue disponible este artículo?...',
            showCancelButton: true,
            confirmButtonText: 'Enviar Mensaje',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#e60000',
            background: '#1a1a1a',
            color: '#fff'
        });

        if (mensaje) {
            try {
                const res = await fetch(`${API_URL}/mensajes.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ destinatario_id: producto.vendedor_id,remitente_id: usuario ? usuario.id : 1, contenido: `[Sobre ${producto.nombre}]: ${mensaje}`, producto_id: producto.id }),
                    credentials: 'include'
                });
                const data = await res.json();
                if (data.estado === 'exito') {
                    Swal.fire({ icon: 'success', title: 'Mensaje enviado', text: 'Revisa tu buzón de mensajes.', background: '#1a1a1a', color: '#fff', timer: 2000, showConfirmButton: false });
                }
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Oops...', text: 'Error al enviar.', background: '#1a1a1a', color: '#fff' });
            }
        }
    };

    const publicarArticulo = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Vender una Pieza',
            html: `
                <input id="swal-nombre" class="form-control mb-3 bg-dark text-white border-secondary" placeholder="¿Qué vendes? (Ej: Llantas BBS 18')">
                <input id="swal-precio" type="number" class="form-control mb-3 bg-dark text-white border-secondary" placeholder="Precio en €">
                <select id="swal-categoria" class="form-select mb-3 bg-dark text-white border-secondary">
                    <option value="Llantas">Llantas</option>
                    <option value="Motor">Motor / Mecánica</option>
                    <option value="Frenos">Frenos</option>
                    <option value="Accesorios">Accesorios / Interior</option>
                    <option value="Herramientas">Herramientas</option>
                </select>
                <textarea id="swal-desc" class="form-control mb-3 bg-dark text-white border-secondary" rows="3" placeholder="Describe el estado de la pieza..."></textarea>
                
                <label class="text-white-50 small mb-1 d-block text-start"><i class="bi bi-camera me-2"></i>Sube una foto de la pieza:</label>
                <input type="file" id="swal-imagen" class="form-control bg-dark text-white border-secondary" accept="image/*">
            `,
            focusConfirm: false,
            background: '#1a1a1a',
            color: '#fff',
            confirmButtonColor: '#e60000',
            confirmButtonText: 'Publicar Anuncio',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const nombre = document.getElementById('swal-nombre').value;
                const precio = document.getElementById('swal-precio').value;
                const archivo = document.getElementById('swal-imagen').files[0];

                if (!nombre || !precio) {
                    Swal.showValidationMessage('Por favor, indica nombre y precio');
                    return false;
                }

                const formData = new FormData();
                formData.append('nombre', nombre);
                formData.append('precio', precio);
                formData.append('categoria', document.getElementById('swal-categoria').value);
                formData.append('descripcion', document.getElementById('swal-desc').value);

                formData.append('vendedor_id', usuario ? usuario.id : 1);
                formData.append('vendedor_nombre', usuario ? usuario.nombre : 'Usuario Anónimo');

                if (archivo) {
                    formData.append('imagen', archivo);
                }

                return formData;
            }
        });

        if (formValues) {
            try {
                const res = await fetch(`${API_URL}/subir_producto.php`, {
                    method: 'POST',
                    body: formValues,
                    credentials: 'include'
                });

                const textData = await res.text();
                try {
                    const data = JSON.parse(textData);
                    if (data.estado === 'exito') {
                        Swal.fire({ icon: 'success', title: '¡Publicado!', text: 'Tu anuncio ya está visible con foto incluida.', background: '#1a1a1a', color: '#fff', timer: 2000, showConfirmButton: false });
                        setTimeout(() => window.location.reload(), 1500);
                    } else {
                        Swal.fire({ icon: 'error', title: 'Error del servidor', text: data.mensaje, background: '#1a1a1a', color: '#fff' });
                    }
                } catch (e) {
                    console.error(textData);
                }
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al conectar con el servidor.', background: '#1a1a1a', color: '#fff' });
            }
        }
    };

    return (
        <div className="fade-in mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 border-bottom border-secondary pb-3">
                <div>
                    <h2 className="fw-bold m-0 text-white"><i className="bi bi-shop me-2 text-danger"></i>AutoParts Marketplace</h2>
                    <p className="text-white-50 m-0 mt-1">Repuestos exactos, accesorios y detailing.</p>
                </div>

                <button className="btn btn-danger text-white fw-bold px-4 py-2 shadow-lg position-relative d-flex align-items-center ae-cart-btn-premium" onClick={verCarrito}>
                    <i className="bi bi-cart3 me-2 fs-5 text-white"></i> Mi Carrito
                    {carrito.length > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-light text-danger border border-danger">
                            {carrito.length}
                        </span>
                    )}
                </button>
            </div>

            <div className="d-flex mb-4 glass-card p-1 rounded-pill" style={{ maxWidth: '400px', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <button
                    className={`btn w-50 rounded-pill fw-bold transition-all ${modoVenta === 'oficial' ? 'btn-danger text-white shadow' : 'text-white-50'}`}
                    onClick={() => { setModoVenta('oficial'); setCategoriaActiva('Todas'); }}
                >
                    <i className="bi bi-shield-check me-2"></i>Tienda Oficial
                </button>
                <button
                    className={`btn w-50 rounded-pill fw-bold transition-all ${modoVenta === 'segunda_mano' ? 'btn-danger text-white shadow' : 'text-white-50'}`}
                    onClick={() => { setModoVenta('segunda_mano'); setCategoriaActiva('Todas'); }}
                >
                    <i className="bi bi-people me-2"></i>Segunda Mano
                </button>
            </div>

            <div className="glass-card p-4 mb-4 shadow-lg rounded-4 ae-autodoc-container">
                <h5 className="text-white fw-bold mb-3"><i className="bi bi-car-front-fill me-2 text-danger"></i>Busca piezas exactas para tu coche</h5>
                <div className="row g-3">
                    <div className="col-md-6">
                        <select
                            className="form-select ae-input text-white fw-bold shadow-sm ae-autodoc-input"
                            value={vehiculoSeleccionado}
                            onChange={(e) => setVehiculoSeleccionado(e.target.value)}
                        >
                            <option value="">Mostrar catálogo completo...</option>
                            {misVehiculos.map(v => (
                                <option key={v.id} value={v.marca}>Mi {v.marca} {v.modelo}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <div className="input-group shadow-sm">
                            <span className="input-group-text ae-autodoc-input"><i className="bi bi-search text-white-50"></i></span>
                            <input
                                type="text"
                                className="form-control ae-input ae-autodoc-input ps-0"
                                placeholder="Buscar por nombre o pieza (Ej: Aceite, Frenos...)"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div className="d-flex flex-wrap gap-2">
                    {categoriasUnicas.map(cat => (
                        <button
                            key={cat}
                            className={`btn rounded-pill px-4 fw-bold transition-all ${categoriaActiva === cat ? 'btn-danger text-white shadow' : 'btn-outline-secondary text-white-50'}`}
                            onClick={() => setCategoriaActiva(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {modoVenta === 'segunda_mano' && (
                    <button className="btn btn-warning fw-bold px-4 rounded-pill text-dark shadow" onClick={publicarArticulo}>
                        <i className="bi bi-camera me-2"></i> Subir Artículo
                    </button>
                )}
            </div>

            <div className="mb-3 text-white-50">
                Mostrando {productosFiltrados.length} resultados {vehiculoSeleccionado && <span className="text-danger fw-bold">compatibles con {vehiculoSeleccionado}</span>}
            </div>

            {loading ? (
                <div className="text-center text-light my-5"><div className="spinner-border text-danger"></div></div>
            ) : productosFiltrados.length === 0 ? (
                <div className="text-center text-light my-5 opacity-50 glass-card p-5 rounded-4">
                    <i className="bi bi-search display-1 mb-3"></i>
                    <h4>No hemos encontrado piezas.</h4>
                    <p>Intenta borrar los filtros o buscar otra palabra.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {productosFiltrados.map(producto => (
                        <div key={producto.id} className="col-md-4 col-lg-3">
                            <div className="card glass-card h-100 border-0 shadow-lg overflow-hidden car-card ae-product-card">

                                {modoVenta === 'segunda_mano' && (
                                    <div className="position-absolute top-0 start-0 m-2 badge bg-dark border border-secondary shadow z-1">
                                        <i className="bi bi-person-circle me-1 text-danger"></i> {producto.vendedor_nombre}
                                    </div>
                                )}

                                {producto.marca_compatible !== 'Todas' && (
                                    <div className="position-absolute top-0 end-0 m-2 badge bg-danger shadow z-1">
                                        Específico {producto.marca_compatible}
                                    </div>
                                )}

                                <div className="ae-product-img-container">
                                    <img
                                        src={producto.imagen_url}
                                        alt={producto.nombre}
                                        className="w-100 h-100 object-fit-cover ae-product-img"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = `https://placehold.co/600x400/1a1a1a/e60000?text=Sin+Foto`;
                                        }}
                                    />
                                </div>

                                <div className="card-body d-flex flex-column p-4">
                                    <span className="text-secondary small fw-bold text-uppercase mb-1">{producto.categoria}</span>
                                    <h5 className="card-title text-white fw-bold mb-2 lh-sm">{producto.nombre}</h5>

                                    <p className="card-text text-white-50 small flex-grow-1 ae-text-clamp-2">
                                        {producto.descripcion}
                                    </p>

                                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top ae-border-subtle">
                                        <h4 className="text-danger fw-bold m-0">{parseFloat(producto.precio).toFixed(2)} €</h4>
                                        <button
                                            className={`btn btn-sm fw-bold px-3 d-flex align-items-center gap-2 ${modoVenta === 'oficial' ? 'btn-outline-danger' : 'btn-light text-dark'}`}
                                            onClick={() => modoVenta === 'oficial' ? añadirAlCarrito(producto) : contactarVendedor(producto)}
                                        >
                                            {modoVenta === 'oficial' ? <><i className="bi bi-cart-plus"></i> Añadir</> : 'Contactar'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Marketplace;