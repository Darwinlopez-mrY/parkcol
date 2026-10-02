import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SeguimientoProvider } from './context/SeguimientoContext';
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

// 👇 NUEVO: Componentes de admin
import RutaAdmin from './components/RutaAdmin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsuarios from './pages/admin/Usuarios';
import AdminParqueaderos from './pages/admin/Parqueaderos';
import AdminFotosParqueadero from './pages/admin/FotosParqueaderoAdmin';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <SeguimientoProvider>
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

                                {/* ============================================ */}
                                {/* RUTAS DE ADMINISTRADOR (protegidas)         */}
                                {/* ============================================ */}
                                <Route path="/admin" element={
                                    <RutaAdmin>
                                        <AdminLayout />
                                    </RutaAdmin>
                                }>
                                    <Route index element={<AdminDashboard />} />
                                    <Route path="usuarios" element={<AdminUsuarios />} />   
                                    <Route path="parqueaderos" element={<AdminParqueaderos />} />
                                    <Route path="parqueaderos/:id/fotos" element={<AdminFotosParqueadero />} />
                                    {/* Aquí irán más subrutas después: usuarios, parqueaderos */}
                                </Route>
                            </Routes>
                        </main>
                    </div>
                </SeguimientoProvider>
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