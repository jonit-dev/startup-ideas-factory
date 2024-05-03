## Lecture: Logic Encapsulation in Go

### Introduction

Encapsulation is a fundamental concept in software engineering and object-oriented programming, but it also holds significant value in the context of Go, which is not strictly an object-oriented language. Encapsulation in Go is about managing the visibility and

accessibility of components to promote modularity and maintainability. This lecture will explore how encapsulation is implemented in Go, how to use it effectively, and best practices for structuring your Go programs.

### What is Encapsulation?

Encapsulation is the principle of hiding the internal state and functionality of an object, exposing only what is necessary to the outside world. It's a core aspect of achieving information hiding and abstraction. In languages like Java or C++, this is typically done using classes and access modifiers like `private`, `public`, and `protected`.

### Encapsulation in Go

Go does not have classes or the same set of access modifiers. Instead, Go uses packages as the primary means of encapsulation, coupled with capitalized (public) and uncapitalized (private) naming conventions:

- **Public Identifier**: If a variable, function, or method starts with an uppercase letter, it can be accessed by code outside of its own package.
- **Private Identifier**: If it starts with a lowercase letter, it is only accessible within its package and cannot be directly accessed by code in other packages.

### How to Encapsulate Logic in Go

#### 1. **Using Packages**

Packages are the primary way to group related code and enforce encapsulation in Go. Organizing code into packages not only helps in managing access but also in categorizing functionality logically.

- **Internal Packages**: Go supports an `internal` package concept, where packages inside an `internal` directory are accessible only within the package tree rooted at the parent of the `internal` directory.

- **Example**:

  ```go
  // Assume the following directory structure:
  // /myapp
  //     /internal
  //         /db
  //             database.go

  // database.go
  package db

  import "fmt"

  func connect() {
    fmt.Println("Database connected")
  }
  ```

  In this example, the `connect` function is private to the `db` package because it starts with a lowercase letter. It can be used by other files within the same `db` package but not outside of it.

#### 2. **Structuring Methods and Structs**

Encapsulation can also be implemented through struct types and methods in Go.

- **Private Structs and Fields**: Making a struct or its fields unexported by starting their names with a lowercase letter limits their accessibility.

- **Example**:

  ```go
  package account

  type user struct {
      Name string
      password string  // unexported field
  }

  func NewUser(name, password string) *user {
      return &user{Name: name, password: password}
  }
  ```

  In this example, external packages can create `user` objects using the `NewUser` function but cannot directly access or modify the `password` field.

#### 3. **Interface Abstraction**

Interfaces in Go provide a way to specify the behavior of an object: if something can do "this", it can be used here. They are implicitly implemented and can be used to expose only the necessary methods of an object to the outside world.

- **Example**:

  ```go
  package shapes

  type Shape interface {
      Area() float64
  }

  type square struct {
      sideLength float64
  }

  func (s square) Area() float64 {
      return s.sideLength * s.sideLength
  }

  func NewSquare(sideLength float64) Shape {
      return square{sideLength: sideLength}
  }
  ```

  Here, `square` is a private struct that fulfills the `Shape` interface. Outside packages can use `Shape` objects, but they cannot access `square` directly or its internal fields.

### Best Practices

- **Limit public interfaces**: Only make public those parts of your package that need to be accessible to the outside world.
- **Use concise interfaces**: Smaller interfaces are easier to implement and understand.
- **Document behavior, not implementation**: When writing public documentation for a package, focus on what something does, not how it does it.

### Conclusion

Effective encapsulation in Go can lead to cleaner, more maintainable code that is easier to understand and use. By wisely using packages, interfaces, and visibility rules, Go developers can protect the internal state of objects and expose only what is necessary, following solid software engineering principles.
