# Управление задачами на NestJS (Решение)

---

В этом решении мы реализуем CRUD-операции с задачами, включая обработчики запросов и методы в сервисе.

---

## Контроллер `TasksController`

Контроллер отвечает за маршрутизацию запросов к соответствующим методам сервиса. Рассмотрим пример реализации каждого метода:

### **Получение всех задач**

Обработчик запроса `GET /tasks` возвращает список всех задач, используя метод `getAllTasks` из сервиса.

```typescript
@Get()
getAllTasks() {
  return this.tasksService.getAllTasks();
}
```

### **Получение задачи по идентификатору**

Обработчик запроса `GET /tasks/:id` получает задачу по идентификатору. Если задача не найдена, выбрасывается ошибка `404`.

```typescript
@Get(":id")
getTaskById(@Param("id") id: string) {
  return this.tasksService.getTaskById(id);
}
```

### **Создание задачи**

Обработчик запроса `POST /tasks` создает новую задачу. Данные задачи передаются в теле запроса.

```typescript
@Post()
createTask(@Body() task: Task) {
  return this.tasksService.createTask(task);
}
```

### **Обновление задачи**

Обработчик запроса `PATCH /tasks/:id` обновляет задачу с указанным идентификатором. В случае отсутствия задачи возвращается ошибка `404`.

```typescript
@Patch(":id")
updateTask(@Param("id") id: string, @Body() task: Task) {
  return this.tasksService.updateTask(id, task);
}
```

### **Удаление задачи**

Обработчик запроса `DELETE /tasks/:id` удаляет задачу с указанным идентификатором. Если задача не найдена, возвращается ошибка `404`.

```typescript
@Delete(":id")
deleteTask(@Param("id") id: string) {
  return this.tasksService.deleteTask(id);
}
```

---

## Сервис `TasksService`

Сервис реализует логику работы с задачами. Все задачи хранятся в массиве `tasks`.

### **Получение всех задач**

Метод `getAllTasks` возвращает текущий массив задач.

```typescript
getAllTasks(): Task[] {
  return this.tasks;
}
```

### **Получение задачи по идентификатору**

Метод `getTaskById` ищет задачу по идентификатору. Если задача не найдена, выбрасывается исключение `NotFoundException`.

```typescript
getTaskById(id: string): Task {
  const task = this.tasks.find((task) => task.id === id);
  if (!task) {
    throw new NotFoundException(`Task with ID "${id}" not found`);
  }
  return task;
}
```

### **Создание задачи**

Метод `createTask` создает новую задачу и добавляет её в массив `tasks`.

```typescript
createTask(task: Task): Task {
  const { title, description, status } = task;

  const newTask: Task = {
    id: (this.tasks.length + 1).toString(),
    title,
    description,
    status,
  };

  this.tasks.push(newTask);
  return newTask;
}
```

### **Обновление задачи**

Метод `updateTask` обновляет свойства задачи по идентификатору. Если задача не найдена, выбрасывается исключение `NotFoundException`.

```typescript
updateTask(id: string, update: Task): Task {
  const task = this.getTaskById(id);

  const { title, description, status } = update;
  if (title) task.title = title;
  if (description) task.description = description;
  if (status) task.status = status;

  return task;
}
```

### **Удаление задачи**

Метод `deleteTask` удаляет задачу из массива `tasks` по идентификатору. Если задача не найдена, выбрасывается исключение `NotFoundException`.

```typescript
deleteTask(id: string): Task {
  const task = this.tasks.find((task) => task.id === id);
  if (!task) {
    throw new NotFoundException(`Task with ID "${id}" not found`);
  }
  this.tasks = this.tasks.filter((task) => task.id !== id);
  return task;
}
```

---

## Особенности реализации

1. **Исключения:**

   - Используется `NotFoundException` для обработки отсутствия задачи по идентификатору.

2. **Сервис в качестве хранилища:**
   - Все данные о задачах временно хранятся в массиве `tasks`.
