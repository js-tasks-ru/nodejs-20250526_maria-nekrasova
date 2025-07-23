import "dotenv/config";

import { DataSource } from "typeorm";
import { User } from "./users/entities/user.entity";

export default new DataSource({
  type: "sqlite",
  database: "db.sqlite",
  entities: [User],
  migrations: ["migrations/*.ts"],
});
