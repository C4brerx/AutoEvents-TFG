import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';
import ProductModal from './ProductModal';

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

    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [mostrandoCarrito, setMostrandoCarrito] = useState(false);

    const cargarDatos = async () => {
        try {
            const resTienda = await fetch(`${API_URL}/marketplace.php`, { credentials: 'include' });
            const dataTienda = await resTienda.json();
            const resGaraje = await fetch(`${API_URL}/vehiculos.php`, { credentials: 'include' });
            const dataGaraje = await resGaraje.json();

            if (dataTienda.estado === 'exito') setProductos(dataTienda.productos);
            if (dataGaraje.estado === 'exito') setMisVehiculos(dataGaraje.vehiculos);
        } catch (error) { console.error("Error al cargar datos:", error); }
        finally { setLoading(false); }
    };

    useEffect(() => { cargarDatos(); }, []);

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
        setProductoSeleccionado(null);
    };
    const eliminarDelCarrito = (index) => {
        const nuevoCarrito = [...carrito]; nuevoCarrito.splice(index, 1); setCarrito(nuevoCarrito);
    };
    const tramitarPedido = () => {
        Swal.fire({
            icon: 'info',
            title: 'Pedido en Proceso de Verificación',
            text: 'Tu solicitud de compra ha sido registrada. Nuestro equipo validará el stock en almacén y te enviará las instrucciones de pago seguro por correo electrónico en las próximas 24 horas.',
            background: '#1a1a1a',
            color: '#fff',
            confirmButtonColor: '#e60000',
            confirmButtonText: 'Entendido'
        });
        setCarrito([]);
        setMostrandoCarrito(false);
    };

    const contactarVendedor = async (producto) => {
        setProductoSeleccionado(null);
        const { value: mensaje } = await Swal.fire({
            title: `Contactar a ${producto.vendedor_nombre}`,
            input: 'textarea', inputLabel: `Pregunta sobre: ${producto.nombre}`,
            showCancelButton: true, confirmButtonText: 'Enviar Mensaje', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#e60000'
        });
        if (mensaje) {
            try {
                const res = await fetch(`${API_URL}/mensajes.php`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ destinatario_id: producto.vendedor_id, remitente_id: usuario?.id || 1, contenido: `[Sobre ${producto.nombre}]: ${mensaje}`, producto_id: producto.id }), credentials: 'include'
                });
                const data = await res.json();
                if (data.estado === 'exito') Swal.fire({ icon: 'success', title: 'Mensaje enviado', background: '#1a1a1a', color: '#fff', timer: 2000, showConfirmButton: false });
            } catch (error) { console.error(error); }
        }
    };

    const manejarBorrarProducto = async (id) => {
        try {
            const res = await fetch(`${API_URL}/marketplace.php?id=${id}`, { method: 'DELETE', credentials: 'include' });
            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'Eliminado', background: '#1a1a1a', color: '#fff', timer: 1500, showConfirmButton: false });
                setProductoSeleccionado(null); cargarDatos();
            }
        } catch (error) { console.error(error); }
    };

    // EDICIÓN CON SOPORTE MULTI-FOTO
    const manejarEditarProducto = async (producto) => {
        setProductoSeleccionado(null); // Cierra modal grande
        const { value: formValues } = await Swal.fire({
            title: 'Editar Producto',
            html: `
                <input id="swal-edit-nombre" class="form-control mb-3 bg-dark text-white border-secondary" value="${producto.nombre}">
                <input id="swal-edit-precio" type="number" step="0.01" class="form-control mb-3 bg-dark text-white border-secondary" value="${producto.precio}">
                <textarea id="swal-edit-desc" class="form-control mb-3 bg-dark text-white border-secondary" rows="3">${producto.descripcion}</textarea>
                <label class="text-white-50 small mb-1 d-block text-start"><i class="bi bi-images me-2"></i>Nueva Galería (Puedes elegir varias fotos):</label>
                <input type="file" id="swal-edit-imagenes" class="form-control mb-3 bg-dark text-white border-secondary" accept="image/*" multiple>
                <small class="text-warning d-block text-start mt-1">Si subes nuevas fotos, se borrarán las anteriores.</small>
            `,
            background: '#1a1a1a', color: '#fff', confirmButtonColor: '#e60000', showCancelButton: true,
            preConfirm: () => {
                const archivos = document.getElementById('swal-edit-imagenes').files;
                const formData = new FormData();
                formData.append('accion', 'editar_producto');
                formData.append('id', producto.id);
                formData.append('nombre', document.getElementById('swal-edit-nombre').value);
                formData.append('precio', document.getElementById('swal-edit-precio').value);
                formData.append('descripcion', document.getElementById('swal-edit-desc').value);

                // Añadimos todas las fotos seleccionadas al array 'imagenes[]'
                for (let i = 0; i < archivos.length; i++) {
                    formData.append('imagenes[]', archivos[i]);
                }
                return formData;
            }
        });

        if (formValues) {
            try {
                const res = await fetch(`${API_URL}/marketplace.php`, { method: 'POST', body: formValues, credentials: 'include' });
                if (res.ok) {
                    Swal.fire({ icon: 'success', title: 'Actualizado', background: '#1a1a1a', color: '#fff', timer: 1500, showConfirmButton: false });
                    cargarDatos();
                }
            } catch (e) { console.error(e); }
        }
    };

    // PUBLICACIÓN CON SOPORTE MULTI-FOTO
    const publicarArticulo = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Vender una Pieza',
            html: `
                <input id="swal-nombre" class="form-control mb-3 bg-dark text-white border-secondary" placeholder="¿Qué vendes? (Ej: Llantas BBS 18')">
                <input id="swal-precio" type="number" class="form-control mb-3 bg-dark text-white border-secondary" placeholder="Precio en €">
                <select id="swal-categoria" class="form-select mb-3 bg-dark text-white border-secondary">
                    <option value="Llantas">Llantas</option><option value="Motor">Motor / Mecánica</option><option value="Frenos">Frenos</option><option value="Accesorios">Accesorios / Interior</option><option value="Herramientas">Herramientas</option>
                </select>
                <textarea id="swal-desc" class="form-control mb-3 bg-dark text-white border-secondary" rows="3" placeholder="Describe el estado..."></textarea>
                <label class="text-white-50 small mb-1 d-block text-start"><i class="bi bi-images me-2"></i>Fotos de la pieza (Puedes seleccionar varias):</label>
                <input type="file" id="swal-imagenes" class="form-control bg-dark text-white border-secondary" accept="image/*" multiple>
            `,
            focusConfirm: false, background: '#1a1a1a', color: '#fff', confirmButtonColor: '#e60000', confirmButtonText: 'Publicar Anuncio', showCancelButton: true,
            preConfirm: () => {
                const nombre = document.getElementById('swal-nombre').value;
                const precio = document.getElementById('swal-precio').value;
                const archivos = document.getElementById('swal-imagenes').files;
                if (!nombre || !precio) { Swal.showValidationMessage('Indica nombre y precio'); return false; }

                const formData = new FormData();
                formData.append('nombre', nombre); formData.append('precio', precio); formData.append('categoria', document.getElementById('swal-categoria').value); formData.append('descripcion', document.getElementById('swal-desc').value);

                for (let i = 0; i < archivos.length; i++) {
                    formData.append('imagenes[]', archivos[i]);
                }
                return formData;
            }
        });

        if (formValues) {
            try {
                const res = await fetch(`${API_URL}/subir_producto.php`, { method: 'POST', body: formValues, credentials: 'include' });
                if (res.ok) {
                    Swal.fire({ icon: 'success', title: '¡Publicado!', background: '#1a1a1a', color: '#fff', timer: 2000, showConfirmButton: false });
                    cargarDatos();
                }
            } catch (error) { console.error(error); }
        }
    };

    return (
        <div className="fade-in mb-5">
            {productoSeleccionado && (
                <ProductModal
                    producto={productoSeleccionado} usuario={usuario}
                    onClose={() => setProductoSeleccionado(null)} onEdit={manejarEditarProducto} onDelete={manejarBorrarProducto} onAddToCart={añadirAlCarrito} onContact={contactarVendedor}
                />
            )}

            {mostrandoCarrito && createPortal(
                <div className="modal-backdrop-custom" onClick={() => setMostrandoCarrito(false)} style={{ zIndex: 9999 }}>
                    <div className="glass-card rounded-4 p-0 overflow-hidden modal-container-custom fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-white-10 bg-black bg-opacity-50">
                            <h3 className="fw-bold m-0 text-white"><i className="bi bi-cart3 text-danger me-2"></i>Tu Carrito</h3>
                            <button className="btn btn-sm btn-outline-light border-0" onClick={() => setMostrandoCarrito(false)}><i className="bi bi-x-lg fs-4"></i></button>
                        </div>
                        <div className="p-4 bg-dark bg-opacity-50 text-light overflow-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                            {carrito.length === 0 ? (
                                <div className="text-center text-secondary py-5">
                                    <i className="bi bi-cart-x display-1 mb-3 opacity-50 text-danger"></i>
                                    <h5 className="fw-bold text-white">Tu carrito está vacío</h5>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {carrito.map((item, index) => (
                                        <div key={index} className="d-flex justify-content-between align-items-center p-3 bg-black bg-opacity-25 rounded-3 border border-white-10 shadow-sm fade-in">
                                            <div>
                                                <h6 className="text-white fw-bold mb-1">{item.nombre}</h6>
                                                <span className="text-danger fw-bold">{parseFloat(item.precio).toFixed(2)} €</span>
                                            </div>
                                            <button className="btn btn-sm btn-outline-light border-0 bg-black bg-opacity-50 rounded-circle" style={{ width: '40px', height: '40px' }} onClick={() => eliminarDelCarrito(index)}><i className="bi bi-trash-fill text-danger fs-5"></i></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {carrito.length > 0 && (
                            <div className="p-3 bg-dark border-top border-white-10 bg-opacity-75 d-flex justify-content-between align-items-center flex-wrap gap-3">
                                <div>
                                    <small className="text-secondary d-block fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>Total estimado</small>
                                    <h3 className="text-danger fw-bold m-0">{carrito.reduce((sum, item) => sum + parseFloat(item.precio), 0).toFixed(2)} €</h3>
                                </div>
                                <button className="btn fw-bold px-4 py-2 shadow ae-btn-primary fs-5" onClick={tramitarPedido}>Tramitar Pedido <i className="bi bi-check-circle-fill ms-2"></i></button>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 border-bottom border-secondary pb-3">
                <div>
                    <h2 className="fw-bold m-0 text-white"><i className="bi bi-shop me-2 text-danger"></i>AutoParts Marketplace</h2>
                    <p className="text-white-50 m-0 mt-1">Repuestos exactos, accesorios y detailing.</p>
                </div>
                <button className="btn btn-danger text-white fw-bold px-4 py-2 shadow-lg position-relative d-flex align-items-center ae-cart-btn-premium" onClick={() => setMostrandoCarrito(true)}>
                    <i className="bi bi-cart3 me-2 fs-5 text-white"></i> Mi Carrito
                    {carrito.length > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-light text-danger border border-danger">{carrito.length}</span>}
                </button>
            </div>

            <div className="d-flex mb-4 glass-card p-1 rounded-pill" style={{ maxWidth: '400px', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <button className={`btn w-50 rounded-pill fw-bold transition-all ${modoVenta === 'oficial' ? 'btn-danger text-white shadow' : 'text-white-50'}`} onClick={() => { setModoVenta('oficial'); setCategoriaActiva('Todas'); }}><i className="bi bi-shield-check me-2"></i>Tienda Oficial</button>
                <button className={`btn w-50 rounded-pill fw-bold transition-all ${modoVenta === 'segunda_mano' ? 'btn-danger text-white shadow' : 'text-white-50'}`} onClick={() => { setModoVenta('segunda_mano'); setCategoriaActiva('Todas'); }}><i className="bi bi-people me-2"></i>Segunda Mano</button>
            </div>

            <div className="glass-card p-4 mb-4 shadow-lg rounded-4 ae-autodoc-container">
                <h5 className="text-white fw-bold mb-3"><i className="bi bi-car-front-fill me-2 text-danger"></i>Busca piezas exactas para tu coche</h5>
                <div className="row g-3">
                    <div className="col-md-6">
                        <select className="form-select ae-input text-white fw-bold shadow-sm ae-autodoc-input" value={vehiculoSeleccionado} onChange={(e) => setVehiculoSeleccionado(e.target.value)}>
                            <option value="">Mostrar catálogo completo...</option>
                            {misVehiculos.map(v => <option key={v.id} value={v.marca}>Mi {v.marca} {v.modelo}</option>)}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <div className="input-group shadow-sm">
                            <span className="input-group-text ae-autodoc-input"><i className="bi bi-search text-white-50"></i></span>
                            <input type="text" className="form-control ae-input ae-autodoc-input ps-0" placeholder="Buscar por nombre o pieza..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div className="d-flex flex-wrap gap-2">
                    {categoriasUnicas.map(cat => (
                        <button key={cat} className={`btn rounded-pill px-4 fw-bold transition-all ${categoriaActiva === cat ? 'btn-danger text-white shadow' : 'btn-outline-secondary text-white-50'}`} onClick={() => setCategoriaActiva(cat)}>{cat}</button>
                    ))}
                </div>
                {modoVenta === 'segunda_mano' && (
                    <button className="btn btn-warning fw-bold px-4 rounded-pill text-dark shadow" onClick={publicarArticulo}><i className="bi bi-camera me-2"></i> Subir Artículo</button>
                )}
            </div>

            {loading ? (
                <div className="text-center text-light my-5"><div className="spinner-border text-danger"></div></div>
            ) : productosFiltrados.length === 0 ? (
                <div className="text-center text-light my-5 opacity-50 glass-card p-5 rounded-4">
                    <i className="bi bi-search display-1 mb-3"></i><h4>No hemos encontrado piezas.</h4>
                </div>
            ) : (
                <div className="row g-4">
                    {productosFiltrados.map(producto => (
                        <div key={producto.id} className="col-md-4 col-lg-3">
                            <div className="card glass-card h-100 border-0 shadow-lg overflow-hidden car-card ae-product-card cursor-pointer" onClick={() => setProductoSeleccionado(producto)}>
                                {modoVenta === 'segunda_mano' && <div className="position-absolute top-0 start-0 m-2 badge bg-dark border border-secondary shadow z-1"><i className="bi bi-person-circle me-1 text-danger"></i> {producto.vendedor_nombre}</div>}
                                {producto.marca_compatible !== 'Todas' && <div className="position-absolute top-0 end-0 m-2 badge bg-danger shadow z-1">Específico {producto.marca_compatible}</div>}

                                <div className="ae-product-img-container">
                                    <img src={producto.imagen_url} alt={producto.nombre} className="w-100 h-100 object-fit-cover ae-product-img" onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/600x400/1a1a1a/e60000?text=Sin+Foto`; }} />
                                </div>

                                <div className="card-body d-flex flex-column p-4">
                                    <span className="text-secondary small fw-bold text-uppercase mb-1">{producto.categoria}</span>
                                    <h5 className="card-title text-white fw-bold mb-2 lh-sm">{producto.nombre}</h5>
                                    <p className="card-text text-white-50 small flex-grow-1 ae-text-clamp-2">{producto.descripcion}</p>

                                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top ae-border-subtle">
                                        <h4 className="text-danger fw-bold m-0">{parseFloat(producto.precio).toFixed(2)} €</h4>
                                        <button className={`btn btn-sm fw-bold px-3 d-flex align-items-center gap-2 ${modoVenta === 'oficial' ? 'btn-outline-danger' : 'btn-light text-dark'}`} onClick={(e) => { e.stopPropagation(); modoVenta === 'oficial' ? añadirAlCarrito(producto) : contactarVendedor(producto); }}>
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