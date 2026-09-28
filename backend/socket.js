const socketIo = require('socket.io');

// Almacenar conexiones activas
const usuariosConectados = new Map(); // usuarioId -> socketId
const viajesActivos = new Map(); // viajeId -> { usuario, propietario, origen, destino, estado }

let io;

const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: process.env.NODE_ENV === 'production' 
                ? ['https://parkcol.vercel.app', 'http://localhost:3000']
                : 'http://localhost:3000',
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('🟢 Nuevo cliente conectado:', socket.id);

        // Registrar usuario con su ID
        socket.on('registrar-usuario', (usuarioId) => {
            usuariosConectados.set(usuarioId, socket.id);
            console.log(`👤 Usuario ${usuarioId} registrado con socket ${socket.id}`);
            
            // Unirse a sala personal para recibir eventos privados
            socket.join(`usuario-${usuarioId}`);
        });

        // Solicitar viaje (usuario)
        socket.on('solicitar-viaje', async (data) => {
            const { usuarioId, parqueaderoId, origen, destino } = data;
            const viajeId = `viaje-${Date.now()}`;
            
            viajesActivos.set(viajeId, {
                usuarioId,
                parqueaderoId,
                origen,
                destino,
                estado: 'buscando-propietario',
                socketUsuario: socket.id
            });

            // Buscar propietarios cercanos (simulado)
            // En producción, buscarías en base de datos
            socket.broadcast.emit('nueva-solicitud', {
                viajeId,
                origen,
                destino,
                parqueaderoId,
                usuarioId
            });

            socket.emit('viaje-solicitado', { viajeId });
        });

        // Propietario acepta viaje
        socket.on('aceptar-viaje', (data) => {
            const { viajeId, propietarioId } = data;
            const viaje = viajesActivos.get(viajeId);
            
            if (viaje) {
                viaje.estado = 'aceptado';
                viaje.propietarioId = propietarioId;
                viaje.socketPropietario = socket.id;
                viajesActivos.set(viajeId, viaje);

                // Notificar al usuario
                io.to(`usuario-${viaje.usuarioId}`).emit('viaje-aceptado', {
                    viajeId,
                    propietarioId
                });
            }
        });

        // Actualizar ubicación del propietario (en tiempo real)
        socket.on('actualizar-ubicacion', (data) => {
            const { viajeId, lat, lng } = data;
            const viaje = viajesActivos.get(viajeId);
            
            if (viaje) {
                // Enviar ubicación al usuario
                io.to(`usuario-${viaje.usuarioId}`).emit('ubicacion-propietario', {
                    viajeId,
                    lat,
                    lng
                });
            }
        });

        // Iniciar seguimiento (usuario)
        socket.on('iniciar-seguimiento', (data) => {
            const { viajeId } = data;
            const viaje = viajesActivos.get(viajeId);
            
            if (viaje) {
                viaje.estado = 'siguiendo';
                viajesActivos.set(viajeId, viaje);
                
                socket.join(`viaje-${viajeId}`);
            }
        });

        // Finalizar viaje
        socket.on('finalizar-viaje', (data) => {
            const { viajeId } = data;
            const viaje = viajesActivos.get(viajeId);
            
            if (viaje) {
                io.to(`viaje-${viajeId}`).emit('viaje-finalizado', { viajeId });
                viajesActivos.delete(viajeId);
            }
        });

        // Desconexión
        socket.on('disconnect', () => {
            console.log('🔴 Cliente desconectado:', socket.id);
            
            // Limpiar usuarios y viajes activos
            for (let [usuarioId, socketId] of usuariosConectados.entries()) {
                if (socketId === socket.id) {
                    usuariosConectados.delete(usuarioId);
                    
                    // Buscar viajes activos de este usuario
                    for (let [viajeId, viaje] of viajesActivos.entries()) {
                        if (viaje.usuarioId === usuarioId || viaje.socketUsuario === socket.id) {
                            viajesActivos.delete(viajeId);
                        }
                    }
                }
            }
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io no inicializado');
    }
    return io;
};

module.exports = { initSocket, getIo };