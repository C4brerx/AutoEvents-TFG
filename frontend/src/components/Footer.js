import React from 'react';

function Footer({ setSeccionActiva }) {
    const añoActual = new Date().getFullYear();

    return (
        <footer className="bg-black bg-opacity-75 border-top border-secondary pt-5 pb-3 mt-auto w-100">
            <div className="container">
                <div className="row g-4 mb-4">

                    <div className="col-lg-4 col-md-6">
                        <h4 className="fw-bold text-white mb-3">
                            <i className="bi bi-car-front-fill text-danger me-2"></i>AutoEvents
                        </h4>
                        <p className="text-secondary small pe-lg-4">
                            Plataforma integral para entusiastas del motor. Gestiona tu garaje, organiza concentraciones, compra recambios y conecta con la comunidad.
                        </p>
                        <span className="badge bg-danger bg-opacity-10 border border-danger text-danger">
                            <i className="bi bi-mortarboard-fill me-2"></i>Proyecto TFG
                        </span>
                    </div>

                    <div className="col-lg-4 col-md-6">
                        <h5 className="text-white fw-bold mb-3">Accesos Rápidos</h5>
                        <ul className="list-unstyled d-flex flex-column gap-2">
                            <li>
                                <button onClick={() => setSeccionActiva('inicio')} className="btn btn-link text-secondary text-decoration-none hover-text-white transition-all p-0 text-start">
                                    <i className="bi bi-chevron-right text-danger small me-2"></i>Inicio
                                </button>
                            </li>
                            <li>
                                <button onClick={() => setSeccionActiva('garaje')} className="btn btn-link text-secondary text-decoration-none hover-text-white transition-all p-0 text-start">
                                    <i className="bi bi-chevron-right text-danger small me-2"></i>Mi Garaje
                                </button>
                            </li>
                            <li>
                                <button onClick={() => setSeccionActiva('comunidad')} className="btn btn-link text-secondary text-decoration-none hover-text-white transition-all p-0 text-start">
                                    <i className="bi bi-chevron-right text-danger small me-2"></i>Comunidad
                                </button>
                            </li>
                            <li>
                                <button onClick={() => setSeccionActiva('tienda')} className="btn btn-link text-secondary text-decoration-none hover-text-white transition-all p-0 text-start">
                                    <i className="bi bi-chevron-right text-danger small me-2"></i>Marketplace
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="col-lg-4 col-md-12">
                        <h5 className="text-white fw-bold mb-3">Desarrollo</h5>
                        <ul className="list-unstyled text-secondary small d-flex flex-column gap-2 mb-3">
                            <li><i className="bi bi-code-slash text-danger me-2"></i>Frontend: React.js & Bootstrap</li>
                            <li><i className="bi bi-server text-danger me-2"></i>Backend: PHP & MySQL (PDO)</li>
                            <li><i className="bi bi-robot text-danger me-2"></i>IA: Google Gemini API</li>
                        </ul>
                        <div className="mt-4">
                            <a href="mailto:acabreracaceres@gmail.com" className="btn btn-outline-secondary btn-sm shadow-sm px-4 py-2 rounded-pill text-decoration-none transition-all hover-text-white" title="Enviar correo de contacto">
                                <i className="bi bi-envelope-fill me-2 text-danger"></i>acabreracaceres@gmail.com
                            </a>
                        </div>
                    </div>
                </div>

                <hr className="border-secondary opacity-50 my-4" />

                {/* Copyright */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-secondary small">
                    <p className="mb-2 mb-md-0">
                        &copy; {añoActual} <strong>AutoEvents</strong>. Todos los derechos reservados.
                    </p>
                    <p className="mb-0">
                        Desarrollado por <span className="text-light fw-bold">Adrián Cabrera Cáceres</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;