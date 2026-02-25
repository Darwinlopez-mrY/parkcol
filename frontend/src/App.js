import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Inicio from './pages/Inicio';
import Buscar from './pages/Buscar';
import ParqueaderoDetalle from './pages/ParqueaderoDetalle';
import Registro from './pages/Registro';
import Login from './pages/Login';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div style={styles.app}>
                    <Header />
                    <main style={styles.main}>
                        <Routes>
                            <Route path="/" element={<Inicio />} />
                            <Route path="/buscar" element={<Buscar />} />
                            <Route path="/parqueadero/:id" element={<ParqueaderoDetalle />} />
                            <Route path="/registro" element={<Registro />} />
                            <Route path="/login" element={<Login />} />
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