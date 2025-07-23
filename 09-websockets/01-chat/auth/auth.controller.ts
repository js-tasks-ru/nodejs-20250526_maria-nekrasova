import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { Public } from "./public.decorator";
import * as path from "node:path";
import * as fs from "node:fs";

const callbackTemplate = fs.readFileSync(
  path.join(__dirname, "client/callback.html.tpl"),
  { encoding: "utf-8" },
);

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @UseGuards(AuthGuard("local"))
  @Post("login")
  login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @UseGuards(AuthGuard("github"))
  @Get("github")
  github(@Request() req) {
    return "ok";
  }
  @Public()
  @UseGuards(AuthGuard("github"))
  @Get("github/callback")
  async githubCallback(@Request() req) {
    const payload = await this.authService.login(req.user);
    return callbackTemplate.replace("{{token}}", payload.access_token);
  }

  @Get("profile")
  profile(@Request() request) {
    return request.user;
  }
}
