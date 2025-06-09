import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./user.model";

@Injectable()
export class UsersService {
  private users: User[] = [
    { id: 1, name: "User1", email: "user1@mail.com", phone: "+123456789" },
    { id: 2, name: "User2", email: "user2@mail.com", phone: "+987654321" },
  ];

  getUserById(id: number) {
    const user = this.users.find((user) => user.id === id);
    if (!user) throw new NotFoundException(`user with id ${id} is not found`);
    return user;
  }
}
