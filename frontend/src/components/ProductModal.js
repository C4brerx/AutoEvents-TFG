import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';

function ProductModal({ producto, onClose, usuario, onEdit, onDelete, onAddToCart, onContact }) {
    // Estado para saber qué foto de la galería estamos viendo en grande
    const [fotoActiva, setFotoActiva] = useState(producto?.imagen_url);

    // Convertimos el string separado por comas que envía PHP en un array de URLs
    const galeria = producto?.galeria ? producto.galeria.split(',') : [producto?.imagen_url];

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        setFotoActiva(producto?.imagen_url); // Resetear al abrir nuevo producto
        return () => { document.body.style.overflow = 'auto'; };
    }, [producto]);

    if (!producto) return null;

    const esOficial = (producto.tipo_venta || 'oficial') === 'oficial';

    const confirmarBorrado = () => {
        Swal.fire({
            title: '¿Eliminar producto?', text: `Vas a borrar "${producto.nombre}".`, icon: 'warning',
            showCancelButton: true, background: '#1a1a1a', color: '#fff', confirmButtonColor: '#e60000', cancelButtonColor: '#6c757d', confirmButtonText: 'Sí, borrar'
        }).then((result) => { if (result.isConfirmed) onDelete(producto.id); });
    };

    return createPortal(
        <div className="modal-backdrop-custom" onClick={onClose} style={{ zIndex: 9999 }}>
            <div className="glass-card rounded-4 p-0 overflow-hidden modal-container-custom fade-in d-flex flex-column" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px' }}>

                {/* CABECERA */}
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-white-10 bg-black bg-opacity-50">
                    <h3 className="fw-bold m-0 text-white text-truncate">{producto.nombre}</h3>
                    <button className="btn btn-sm btn-outline-light border-0" onClick={onClose}><i className="bi bi-x-lg fs-4"></i></button>
                </div>

                {/* CUERPO DEL MODAL */}
                <div className="row g-0 flex-grow-1 overflow-auto" style={{ maxHeight: 'calc(90vh - 130px)' }}>

                    {/* IMAGEN DEL PRODUCTO Y GALERÍA INFERIOR */}
                    <div className="col-lg-6 bg-black d-flex flex-column position-relative border-end border-secondary border-opacity-25">

                        <div className="flex-grow-1 position-relative" style={{ minHeight: '300px' }}>
                            <img src={fotoActiva} className="w-100 h-100 object-fit-cover position-absolute top-0 start-0" alt={producto.nombre} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/1a1a1a/e60000?text=Sin+Foto'; }} />
                        </div>

                        {/* Tira de miniaturas (Solo se muestra si hay más de 1 foto) */}
                        {galeria.length > 1 && (
                            <div className="d-flex gap-2 p-3 bg-dark border-top border-secondary border-opacity-50 justify-content-center overflow-auto">
                                {galeria.map((foto, index) => (
                                    <img
                                        key={index} src={foto} alt={`Miniatura ${index}`}
                                        className={`rounded cursor-pointer border ${fotoActiva === foto ? 'border-danger border-2' : 'border-secondary'}`}
                                        style={{ width: '60px', height: '45px', objectFit: 'cover', opacity: fotoActiva === foto ? '1' : '0.6', transition: '0.2s' }}
                                        onMouseOver={(e) => e.target.style.opacity = '1'}
                                        onMouseOut={(e) => { if (fotoActiva !== foto) e.target.style.opacity = '0.6'; }}
                                        onClick={() => setFotoActiva(foto)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* INFO DEL PRODUCTO */}
                    <div className="col-lg-6 p-4 d-flex flex-column bg-dark bg-opacity-50 text-light">
                        <div className="mb-4 flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <span className={`badge px-3 py-2 fs-6 shadow-sm ${esOficial ? 'bg-danger' : 'bg-secondary'}`}>
                                    {esOficial ? 'Tienda Oficial' : 'Segunda Mano'}
                                </span>
                                <div className="bg-black bg-opacity-50 border border-secondary rounded-pill px-3 py-1 d-flex align-items-center shadow-sm">
                                    <i className="bi bi-tag-fill text-success fs-5 me-2"></i>
                                    <span className="fw-bold fs-5">{parseFloat(producto.precio).toFixed(2)} €</span>
                                </div>
                            </div>

                            <h4 className="fw-bold text-ae-red mb-3">Información del Producto</h4>
                            <p className="text-md text-pre-wrap text-secondary mb-4" style={{ lineHeight: '1.6' }}>
                                {producto.descripcion || 'Sin descripción detallada.'}
                            </p>

                            <ul className="list-unstyled mb-0">
                                <li className="mb-3 d-flex align-items-center">
                                    <div className="bg-black bg-opacity-50 p-2 rounded text-danger me-3 border border-secondary shadow-sm"><i className="bi bi-grid-fill fs-5"></i></div>
                                    <div><small className="text-secondary d-block fw-bold text-uppercase">Categoría</small><span className="fw-bold">{producto.categoria || 'General'}</span></div>
                                </li>
                                <li className="mb-3 d-flex align-items-center">
                                    <div className="bg-black bg-opacity-50 p-2 rounded text-danger me-3 border border-secondary shadow-sm"><i className="bi bi-car-front-fill fs-5"></i></div>
                                    <div><small className="text-secondary d-block fw-bold text-uppercase">Compatibilidad</small><span className="fw-bold">{producto.marca_compatible || 'Universal'}</span></div>
                                </li>
                                <li className="d-flex align-items-center">
                                    <div className="bg-black bg-opacity-50 p-2 rounded text-danger me-3 border border-secondary shadow-sm"><i className="bi bi-person-fill fs-5"></i></div>
                                    <div><small className="text-secondary d-block fw-bold text-uppercase">Vendedor</small><span className="fw-bold">{producto.vendedor_nombre || 'AutoEvents Oficial'}</span></div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* PIE DEL MODAL */}
                <div className="p-3 bg-dark border-top border-white-10 bg-opacity-75 d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <p className="m-0 text-success fw-bold d-none d-md-block">
                        <i className="bi bi-check-circle-fill me-2"></i> {esOficial ? 'Producto Oficial Garantizado' : 'Artículo de Segunda Mano'}
                    </p>

                    <div className="d-flex gap-2 ms-auto">
                        {usuario?.rol === 'admin' && (
                            <>
                                <button className="btn btn-outline-warning fw-bold px-3 py-2 shadow" onClick={() => onEdit(producto)}><i className="bi bi-pencil-square me-2"></i>Editar</button>
                                <button className="btn btn-outline-danger fw-bold px-3 py-2 shadow" onClick={confirmarBorrado}><i className="bi bi-trash-fill me-2"></i>Borrar</button>
                            </>
                        )}
                        {esOficial ? (
                            <button className="btn fw-bold px-4 py-2 shadow ae-btn-primary" onClick={() => onAddToCart(producto)}>
                                <i className="bi bi-cart-plus-fill me-2"></i>Añadir al Carrito
                            </button>
                        ) : (
                            <button className="btn fw-bold px-4 py-2 shadow btn-outline-danger bg-danger bg-opacity-10 text-danger" onClick={() => onContact(producto)}>
                                <i className="bi bi-chat-dots-fill me-2"></i>Contactar al Vendedor
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default ProductModal;