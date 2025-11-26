import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LandingModule } from './landing/landing.module';
import { GroupsModule } from './groups/groups.module';
import { EventsModule } from './events/events.module';
import { ExpensesModule } from './expenses/expenses.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    UsersModule,
    AuthModule,
    LandingModule,
    GroupsModule,
    EventsModule,
    ExpensesModule,
  ],
})
export class AppModule {}

