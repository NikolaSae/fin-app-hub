namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      DATABASE_URL: string;
      JWT_SECRET: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_REGION: string;
      S3_BUCKET_NAME: string;
      EMAIL_FROM: string;
      NEXT_PUBLIC_WS_URL: string;
    }
  }