import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/** Toàn cục: mọi module đều cần tới cơ sở dữ liệu, không việc gì phải nhập lại. */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
