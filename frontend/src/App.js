import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Inicio from './pages/Inicio';
import Buscar from './pages/Buscar';
import ParqueaderoDetalle from './pages/ParqueaderoDetalle';
import Registro from './pages/Registro';
import Login from './pages/Login';

// Componentes de propietario
import RutaProtegida from './components/RutaProtegida';
import DashboardPropietario from './pages/propietario/Dashboard';
import FormularioParqueadero from './pages/propietario/FormularioParqueadero';
import FotosParqueadero from './pages/propietario/FotosParqueadero';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div style={styles.app}>
                    <Header />
                    <main style={styles.main}>
                        <Routes>
                            {/* Rutas públicas */}
                            <Route path="/" element={<Inicio />} />
                            <Route path="/buscar" element={<Buscar />} />
                            <Route path="/parqueadero/:id" element={<ParqueaderoDetalle />} />
                            <Route path="/registro" element={<Registro />} />
                            <Route path="/login" element={<Login />} />
                            
                            {/* Rutas protegidas para propietarios */}
                            <Route path="/propietario" element={
                                <RutaProtegida rol="propietario">
                                    <DashboardPropietario />
                                </RutaProtegida>
                            } />
                            
                            <Route path="/propietario/crear" element={
                                <RutaProtegida rol="propietario">
                                    <FormularioParqueadero />
                                </RutaProtegida>
                            } />
                            
                            <Route path="/propietario/editar/:id" element={
                                <RutaProtegida rol="propietario">
                                    <FormularioParqueadero />
                                </RutaProtegida>
                            } />
                            
                            <Route path="/propietario/fotos/:id" element={
                                <RutaProtegida rol="propietario">
                                    <FotosParqueadero />
                                </RutaProtegida>
                            } />
                        </Routes>
                    </main>
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

const styles = {
    app: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
    },
    main: {
        paddingBottom: '40px'
    }
};

export default App;