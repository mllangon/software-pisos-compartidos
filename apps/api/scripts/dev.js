const { execSync } = require('child_process');

console.log('🔧 Generando Prisma Client...');
try {
  execSync('prisma generate --schema=prisma/schema.prisma', { stdio: 'inherit' });
  console.log('✅ Prisma Client generado correctamente');
} catch (error) {
  console.log('⚠️  Prisma generate falló, continuando...');
}

console.log('🚀 Iniciando servidor NestJS...');
execSync('nest start --watch', { stdio: 'inherit' });

