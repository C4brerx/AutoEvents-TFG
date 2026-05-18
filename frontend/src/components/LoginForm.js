import React, { useState } from 'react';

const API_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
    ? process.env.REACT_APP_API_URL
    : 'http://localhost/autoevents/backend';

function LoginForm({ onLoginSuccess }) {
    const [vista, setVista] = useState('login');
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [tipoAlerta, setTipoAlerta] = useState('');

    const manejarSubmit = async (e) => {
        e.preventDefault();
        const endpoint = vista === 'login' ? 'login.php' : 'registro.php';
        const datosEnvio = vista === 'login' ? { email, password } : { nombre, email, password };

        try {
            const respuesta = await fetch(`${API_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosEnvio),
                credentials: 'include'
            });
            const resultado = await respuesta.json();

            if (respuesta.ok) {
                setTipoAlerta('success');
                setMensaje(resultado.mensaje);
                if (vista === 'login') {
                    onLoginSuccess(resultado.usuario);
                } else {
                    setNombre('');
                    setPassword('');
                    setVista('login');
                }
            } else {
                setTipoAlerta('danger');
                setMensaje(resultado.mensaje);
            }
        } catch (error) {
            setTipoAlerta('danger');
            setMensaje('Error de conexión.');
        }
    };

    return (
        <div className="animated-background px-3">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-5 mt-5">
                        <div className="text-center mb-5">
                            <img
                                src="/logo.png"
                                alt="AutoEvents Logo"
                                style={{
                                    width: '95%',
                                    maxWidth: '450px',
                                    filter: 'drop-shadow(0px 0px 5px rgba(255,255,255,0.25))'
                                }}
                            />
                        </div>
                        <div className="card rounded-4 glass-card">
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <h5 className="fw-bold text-light">
                                        {vista === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}
                                    </h5>
                                </div>
                                {mensaje && <div className={`alert alert-${tipoAlerta} text-center fw-bold`}>{mensaje}</div>}
                                <form onSubmit={manejarSubmit}>
                                    {vista === 'registro' && (
                                        <div className="mb-3">
                                            <input type="text" className="form-control ae-input" placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <input type="email" className="form-control ae-input" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </div>
                                    <div className="mb-4">
                                        <input type="password" className="form-control ae-input" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                    </div>
                                    <button type="submit" className="btn w-100 py-2 fw-bold rounded-3 mb-3 ae-btn-primary">
                                        {vista === 'login' ? 'ENTRAR' : 'REGISTRARSE'}
                                    </button>
                                </form>
                                <p className="text-center mb-0 text-light cursor-pointer ae-link" onClick={() => setVista(vista === 'login' ? 'registro' : 'login')}>
                                    {vista === 'login' ? 'Regístrate aquí' : 'Inicia sesión'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginForm;