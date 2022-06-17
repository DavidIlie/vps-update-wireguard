declare global {
   namespace NodeJS {
      interface ProcessEnv {
         SSH_IP: string;
         SSH_PRIVATE_KEY: string;
         SSH_WG_FILE: string;
         WG_PORT: string;
         WG_SERVICE_NAME: string;
      }
   }
}

export {};
