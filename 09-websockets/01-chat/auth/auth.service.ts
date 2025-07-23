import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { User } from "../users/entities/user.entity";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validate(username: string, password: string) {
    const user = await this.usersService.findOne(username);
    if (!user) return null;

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) return null;

    return user;
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async socialLogin(username: string) {
    let user = await this.usersService.findOne(username);
    if (!user) {
      user = await this.usersService.create(username);
    }

    return user;
  }
}
