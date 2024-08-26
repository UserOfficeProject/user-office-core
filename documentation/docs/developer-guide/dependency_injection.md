Dependency Injection (DI) is a technique that allows a class to receive its dependencies from an external source rather than creating them internally. This promotes a loosely coupled architecture by enabling better modularity, ease of testing, and management of complex dependencies.

This guide explains the usage of DI in the project and how to overwrite database calls for custom implementations or testing purposes.

## Dependency Injection with TSyringe

The project uses the [TSyringe library](https://github.com/microsoft/tsyringe) for dependency injection. It is a lightweight dependency injection container for TypeScript and JavaScript.

### Setting Up DI

The first step is the registration of dependencies in the TSyringe container. This is typically done in a central file, named `buildContext.ts`. For example, a UserService and UserRepository might be registered as follows:

    import { container } from 'tsyringe';
    import { UserService } from './services/UserService';
    import { UserRepository } from './repositories/UserRepository';

    container.register('UserService', { useClass: UserService });
    container.register('UserRepository', { useClass: UserRepository });

### Injecting 

Dependencies can be injected into classes using the `@inject` decorator. Here is an example:

    import { inject, injectable } from 'tsyringe';

    @injectable()
    class UserController {
      constructor(
        @inject('UserService') private userService: UserService
      ) {}

      async getUser(id: string) {
        this.userService.getUserById(id);
      }
    }

## Overwriting Database Calls

To overwrite database calls, you can create a custom repository or service and register it in the DI container.

### Creating a Custom Repository

First, create a custom repository that implements the same interface as the original repository:

    // CustomUserRepository.ts
    import { UserRepository } from './UserRepository';

    class CustomUserRepository implements UserRepository {
      async getUserById(id: string) {
        // Custom implementation
    }

      // Implement other methods as needed
    }

### Registering the Custom Repository

Next, register the custom repository in the DI container, overwriting the original repository:

    // buildContext.ts
    import { container } from 'tsyringe';
    import { CustomUserRepository } from './repositories/CustomUserRepository';

    container.register('UserRepository', { useClass: CustomUserRepository });

### Using the Custom Repository

Now, when the UserRepository is injected, the custom implementation will be used:

    import { inject, injectable } from 'tsyringe';

    @injectable()
    class UserService {
      constructor(
        @inject('UserRepository') private userRepository: UserRepository
      ) {}

      async getUserById(id: string) {
        return this.userRepository.getUserById(id);
      }
    }

For more information on tsyringe, refer to the [official documentation](https://github.com/microsoft/tsyringe).
