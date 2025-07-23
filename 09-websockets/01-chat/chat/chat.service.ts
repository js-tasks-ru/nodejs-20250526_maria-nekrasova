import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Message } from "./entities/message.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,
  ) {}

  find() {}

  async create(body: Partial<Message>) {}
}
