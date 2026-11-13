import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TransacoesModule } from './transacoes/transacoes.module';

@Module({
  imports: [
    // Carrega as variáveis do arquivo .env (ex.: MONGODB_URI)
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexão com o MongoDB Atlas
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGODB_URI') ??
          'mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/controle_financeiro?retryWrites=true&w=majority',
      }),
    }),

    TransacoesModule,
  ],
})
export class AppModule {}
