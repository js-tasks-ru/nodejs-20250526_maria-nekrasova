import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import { JwtGuard } from "./jwt.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get("google")
  @UseGuards(AuthGuard("google"))
  googleAuth() {}

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleCallback(@Request() req) {
    const result = await this.authService.login(req.user);

    return `
      <html>
        <head><title>Login Callback</title></head>
        <body>
          <p>wait until login is complete</p>
          <script>
            localStorage.setItem('token', '${result.access_token}');
            window.location.href = '/';
          </script>
        </body>
      </html>
    `;
  }

  @Get("profile")
  @UseGuards(JwtGuard)
  profile(@Request() req) {
    return req.user;
  }
}
