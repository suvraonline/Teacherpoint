
export class RegisterDto {
  name: string;
  email: string;
  password: string;
  provider?: 'google' | 'facebook' | 'twitter' | 'linkedin' | 'local';
providerId?: string;
role?: string;
}
