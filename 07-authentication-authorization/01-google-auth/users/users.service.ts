import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  findOne(id: string) {
    return this.userRepository.findOneBy({ id });
  }

  async create(userData: Partial<User>) {
    if (!userData.id) {
      throw new Error('User id is required');
    }
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
}
