const mongoose = require('mongoose');
const readline = require('readline');
const Usuario = require('../models/Usuario');
require('dotenv').config();

// ========================================
// Interfaz de línea de comandos
// ========================================
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const preguntar = (texto) => new Promise((resolve) => {
    rl.question(texto, (respuesta) => resolve(respuesta.trim()));
});

// ========================================
// Mostrar usuarios actuales con rol admin
// ========================================
const mostrarAdminsActuales = async () => {
    const admins = await Usuario.find({ rol: 'admin' }, 'nombre email');
    if (admins.length === 0) {
        console.log('\n⚠️  No hay admins actualmente.\n');
    } else {
        console.log(`\n📋 Admins actuales (${admins.length}):`);
        admins.forEach((a, i) => {
            console.log(`   ${i + 1}. ${a.nombre} (${a.email})`);
        });
        console.log('');
    }
};

// ========================================
// Modo 1: Promover usuario existente a admin
// ========================================
const promoverUsuario = async () => {
    const email = await preguntar('📧 Email del usuario a promover a admin: ');

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
        console.log(`\n❌ No existe un usuario con email: ${email}\n`);
        return false;
    }

    if (usuario.rol === 'admin') {
        console.log(`\n⚠️  El usuario ${usuario.nombre} ya es admin.\n`);
        return false;
    }

    console.log(`\n👤 Usuario encontrado:`);
    console.log(`   Nombre: ${usuario.nombre}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Rol actual: ${usuario.rol}`);

    const confirmar = await preguntar(`\n¿Promover a ADMIN? (s/n): `);

    if (confirmar.toLowerCase() === 's') {
        usuario.rol = 'admin';
        await usuario.save();
        console.log(`\n✅ ¡${usuario.nombre} ahora es ADMIN!\n`);
        return true;
    }

    console.log('\n❌ Operación cancelada.\n');
    return false;
};

// ========================================
// Modo 2: Crear un usuario nuevo como admin
// ========================================
const crearAdminNuevo = async () => {
    console.log('\n📝 Creando nuevo usuario admin:\n');

    const nombre = await preguntar('   Nombre: ');
    const email = await preguntar('   Email: ');
    const password = await preguntar('   Password (mín 6 caracteres): ');
    const telefono = await preguntar('   Teléfono: ');

    // Validaciones
    if (!nombre || nombre.length < 3) {
        console.log('\n❌ El nombre debe tener al menos 3 caracteres.\n');
        return false;
    }

    if (!email || !email.includes('@')) {
        console.log('\n❌ Email inválido.\n');
        return false;
    }

    if (!password || password.length < 6) {
        console.log('\n❌ El password debe tener al menos 6 caracteres.\n');
        return false;
    }

    if (!telefono || telefono.length < 7) {
        console.log('\n❌ Teléfono inválido.\n');
        return false;
    }

    // Verificar si ya existe
    const existe = await Usuario.findOne({ email });
    if (existe) {
        console.log(`\n❌ Ya existe un usuario con el email: ${email}\n`);
        return false;
    }

    // Crear usuario con rol admin
    const usuario = new Usuario({
        nombre,
        email,
        password,
        telefono,
        rol: 'admin'
    });

    await usuario.save();

    console.log(`\n✅ ¡Admin creado exitosamente!`);
    console.log(`   Nombre: ${usuario.nombre}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Rol: ${usuario.rol}\n`);

    return true;
};

// ========================================
// FLUJO PRINCIPAL
// ========================================
const main = async () => {
    try {
        console.log('\n╔══════════════════════════════════════╗');
        console.log('║   🔧 Script de creación de ADMIN    ║');
        console.log('║         ParkCol - Admin Setup        ║');
        console.log('╚══════════════════════════════════════╝\n');

        // Conectar a MongoDB
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');

        // Mostrar admins actuales
        await mostrarAdminsActuales();

        // Menú
        console.log('¿Qué quieres hacer?');
        console.log('   1) Promover un usuario existente a admin');
        console.log('   2) Crear un usuario nuevo como admin');
        console.log('   3) Salir\n');

        const opcion = await preguntar('Elige (1/2/3): ');

        if (opcion === '1') {
            await promoverUsuario();
        } else if (opcion === '2') {
            await crearAdminNuevo();
        } else if (opcion === '3') {
            console.log('\n👋 Hasta luego.\n');
        } else {
            console.log('\n❌ Opción inválida.\n');
        }

        rl.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        rl.close();
        process.exit(1);
    }
};

// Ejecutar
main();