// libs/firebase/src/lib/firebase.module.ts

import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Global()
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class NestjsMicroserviceFirebaseModule {}
