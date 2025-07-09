import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";
import { Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: 'GOOGLE_CLIENT_ID',
      clientSecret: 'GOOGLE_CLIENT_SECRET',
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }
  async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<any> {
    return this.authService.validateGoogleUser(profile);
  }
}
