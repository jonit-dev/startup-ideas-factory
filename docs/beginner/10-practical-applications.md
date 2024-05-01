### Practical Applications in Go

Applying the knowledge acquired from learning Go can lead to the development of practical applications. This final section of the Go course focuses on creating real-world applications using Go's capabilities. We'll explore how to build a simple web server, perform file I/O operations, and interact with a database. These applications will provide a hands-on experience with Go, reinforcing your understanding and skills.

#### Building a Simple Web Server with `net/http`

One of the most common uses of Go is in creating web servers due to its efficient concurrency features and robust standard library. The `net/http` package makes it straightforward to set up HTTP servers.

**Example of a Simple Web Server:**

```go
package main

import (
    "fmt"
    "net/http"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, you've requested: %s\n", r.URL.Path)
}

func main() {
    http.HandleFunc("/", helloHandler)
    fmt.Println("Server starting on port 8080...")
    http.ListenAndServe(":8080", nil)
}
```

This server handles all requests to the root URL (`/`) by responding with a greeting message.

#### Simple File I/O Operations

Go's `os` and `ioutil` packages provide functions to read from and write to files, which are essential for many applications that require data persistence or configuration.

**Example of Reading and Writing Files:**

```go
package main

import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    // Writing to a file
    file, err := os.Create("example.txt")
    if err != nil {
        panic(err)
    }
    defer file.Close()

    writer := bufio.NewWriter(file)
    writer.WriteString("Hello, Go!")
    writer.Flush()

    // Reading from a file
    file, err = os.Open("example.txt")
    if err != nil {
        panic(err)
    }
    defer file.Close()

    scanner := bufio.NewScanner(file)
    for scanner.Scan() {
        fmt.Println("Read line:", scanner.Text())
    }
}
```

#### Interacting with a Database Using `database/sql`

The `database/sql` package in Go provides a generic interface around SQL databases, supported by database-specific drivers. Here's a simple example of how to use Go to interact with a database.

**Example of Database Interaction:**

```go
package main

import (
    "database/sql"
    "fmt"
    "log"

    _ "github.com/go-sql-driver/mysql"
)

func main() {
    db, err := sql.Open("mysql", "user:password@/dbname")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    // Query the database
    rows, err := db.Query("SELECT id, name FROM users WHERE id = ?", 1)
    if err != nil {
        log.Fatal(err)
    }
    defer rows.Close()

    for rows.Next() {
        var id int
        var name string
        if err := rows.Scan(&id, &name); err != nil {
            log.Fatal(err)
        }
        fmt.Printf("User ID: %d, Name: %s\n", id, name)
    }

    if err := rows.Err(); err != nil {
        log.Fatal(err)
    }
}
```

### Best Practices

- For web applications, structure your code with proper handlers and middleware.
- When performing file I/O, always handle potential errors and ensure files are properly closed using `defer`.
- Use connection pooling and prepare statements for database interactions to enhance performance and security.

These practical examples should help cement your understanding of Go and give you a foundation for creating robust, efficient applications. As you develop more complex applications, you'll continue to explore Go's extensive standard library and powerful third-party packages that extend its functionality.
