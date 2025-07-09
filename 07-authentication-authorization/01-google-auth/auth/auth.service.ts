import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { User } from "../users/entities/user.entity";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  private generateJwt(user: User) {
    const payload = {
      sub: user.id,
      displayName: user.displayName,
      avatar: user.avatar,
    };
    return this.jwtService.sign(payload);
  }

  async login(user: User) {
    const access_token = this.generateJwt(user);
    return { access_token };
  }

  async validateGoogleUser(profile: any): Promise<User> {
    let user = await this.usersService.findOne(profile.id);

    if (!user) {
      user = await this.usersService.create({
        id: profile.id,
        displayName: profile.displayName || 'No name',
        avatar: profile.photos?.[0]?.value || '',
      });
    }

    return user;
  }


}
