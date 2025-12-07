import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Hash de la contraseña demo123
  const hashedPassword = await bcrypt.hash('demo123', 10);

  // Crear o actualizar usuario demo
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {
      name: 'Usuario Demo',
      password: hashedPassword,
      avatarUrl: 'https://ui-avatars.com/api/?name=Usuario+Demo&background=6366f1&color=fff&size=128',
      bio: 'Este es un usuario de demostración. Puedes editar este perfil para personalizarlo.',
      phone: '+34 600 000 000',
    },
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Usuario Demo',
      avatarUrl: 'https://ui-avatars.com/api/?name=Usuario+Demo&background=6366f1&color=fff&size=128',
      bio: 'Este es un usuario de demostración. Puedes editar este perfil para personalizarlo.',
      phone: '+34 600 000 000',
    },
  });

  console.log('✅ Usuario demo creado/actualizado:', demoUser.email);
  console.log('📧 Email: demo@example.com');
  console.log('🔑 Contraseña: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

