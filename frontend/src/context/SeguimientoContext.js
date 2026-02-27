import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SeguimientoContext = createContext();

export const useSeguimiento = () => useContext(SeguimientoContext);

export const SeguimientoProvider = ({ children }) => {
    const { usuario } = useAuth();
    const [socket, setSocket] = useState(null);
    const [viajeActivo, setViajeActivo] = useState(null);
    const [ubicacionPropietario, setUbicacionPropietario] = useState(null);
    const [estadoConexion, setEstadoConexion] = useState('desconectado');
    const [solicitando, setSolicitando] = useState(false);
    
    const socketRef = useRef();

    useEffect(() => {
        if (!usuario) return;

        // Conectar al servidor WebSocket
        const socketUrl = process.env.NODE_ENV === 'production' 
            ? 'wss://parkcol.onrender.com'
            : 'http://localhost:5000';

        const newSocket = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        socketRef.current = newSocket;
        setSocket(newSocket);
        setEstadoConexion('conectando');

        newSocket.on('connect', () => {
            console.log('✅ Conectado al servidor de seguimiento');
            setEstadoConexion('conectado');
            
            // Registrar usuario con su ID
            newSocket.emit('registrar-usuario', usuario.id);
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Error de conexión WebSocket:', error);
            setEstadoConexion('error');
        });

        newSocket.on('disconnect', () => {
            console.log('🔴 Desconectado del servidor de seguimiento');
            setEstadoConexion('desconectado');
        });

        newSocket.on('viaje-aceptado', (data) => {
            console.log('🚗 Viaje aceptado:', data);
            setViajeActivo(prev => ({ ...prev, ...data, estado: 'aceptado' }));
            setSolicitando(false);
        });

        newSocket.on('ubicacion-propietario', (data) => {
            console.log('📍 Ubicación del propietario:', data);
            setUbicacionPropietario([data.lat, data.lng]);
        });

        newSocket.on('viaje-finalizado', (data) => {
            console.log('🏁 Viaje finalizado:', data);
            setViajeActivo(null);
            setUbicacionPropietario(null);
        });

        return () => {
            newSocket.close();
        };
    }, [usuario]);

    // Solicitar viaje a un parqueadero
    const solicitarViaje = async (parqueaderoId, origen, destino) => {
        if (!socket || !usuario) return;

        setSolicitando(true);
        
        socket.emit('solicitar-viaje', {
            usuarioId: usuario.id,
            parqueaderoId,
            origen,
            destino
        });

        setViajeActivo({
            parqueaderoId,
            origen,
            destino,
            estado: 'solicitando'
        });
    };

    // Iniciar seguimiento
    const iniciarSeguimiento = (viajeId) => {
        if (!socket) return;
        
        socket.emit('iniciar-seguimiento', { viajeId });
        setViajeActivo(prev => ({ ...prev, estado: 'siguiendo' }));
    };

    // Finalizar viaje
    const finalizarViaje = (viajeId) => {
        if (!socket) return;
        
        socket.emit('finalizar-viaje', { viajeId });
    };

    return (
        <SeguimientoContext.Provider value={{
            socket,
            viajeActivo,
            ubicacionPropietario,
            estadoConexion,
            solicitando,
            solicitarViaje,
            iniciarSeguimiento,
            finalizarViaje
        }}>
            {children}
        </SeguimientoContext.Provider>
    );
};