# Фильтрация и пагинация задач на NestJS (Решение)

---

В этом решении мы реализуем метод фильтрации и пагинации для получения списка задач.

---

## Контроллер `TasksController`

Контроллер отвечает за маршрутизацию запросов к соответствующим методам сервиса. В этом задании используется только метод `getTasks`, который позволяет фильтровать задачи по статусу и выполнять их пагинацию.

### **Получение задач с фильтрацией и пагинацией**

Обработчик запроса `GET /tasks` возвращает отфильтрованный и/или разбитый на страницы список задач.

```typescript
@Get()
getTasks(
  @Query("status") status?: TaskStatus,
  @Query("page") page?: number,
  @Query("limit") limit?: number,
) {
  return this.tasksService.getFilteredTasks(status, page, limit);
}
```

---

## Сервис `TasksService`

Сервис реализует логику работы с задачами. Все задачи хранятся в массиве `tasks`, который предзаполнен для упрощения тестирования.

### **Фильтрация и пагинация**

Метод `getFilteredTasks` выполняет фильтрацию задач по статусу (если он указан) и разбивает их на страницы.

```typescript
getFilteredTasks(status?: TaskStatus, page?: number, limit?: number): Task[] {
  let filteredTasks = this.tasks;

  // Фильтрация по статусу
  if (status) {
    filteredTasks = filteredTasks.filter((task) => task.status === status);
  }

  // Значения по умолчанию для пагинации
  page = page ?? 1;
  limit = limit ?? 10;

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  // Возврат отфильтрованных и разбитых на страницы задач
  return filteredTasks.slice(startIndex, endIndex);
}
```
