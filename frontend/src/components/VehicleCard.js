import React from 'react';

function VehicleCard({ coche, alHacerClick }) {
    const primeraFoto = coche.fotos ? coche.fotos.split(',')[0] : null;

    return (
        <div className="col-md-6 col-lg-4">
            <div className="card bg-dark text-white border-0 glass-card car-card h-100 p-0 overflow-hidden shadow-sm cursor-pointer" onClick={() => alHacerClick(coche)}>
                {primeraFoto ? (
                    <img src={`http://localhost/autoevents/backend/uploads/${primeraFoto}`} className="card-img-top car-grid-img" alt="Coche" />
                ) : (
                    <div className="no-photo-card"><i className="bi bi-camera text-secondary icon-camera-card"></i></div>
                )}
                <div className="card-body p-3 text-center">
                    <h4 className="fw-bold m-0">{coche.marca} <span className="text-ae-red">{coche.modelo}</span></h4>
                    <span className="badge bg-secondary mt-2">{coche.anio}</span>
                </div>
            </div>
        </div>
    );
}

export default VehicleCard;