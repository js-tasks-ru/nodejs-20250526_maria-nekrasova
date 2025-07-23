import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "../users/entities/user.entity";

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(user: User) {
    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        displayName: user.displayName,
        avatar: user.avatar,
      },
      { secret: "killer-is-jim" },
    );

    return { token };
  }
}
