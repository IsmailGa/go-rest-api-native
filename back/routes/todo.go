package routes

import (
	"log"
	"net/http"
	"os"

	"todo-go/handlers"
	"todo-go/middleware"

	"github.com/gorilla/mux"
)

func Routes() {
	// попытка загрузить сохранённые задачи (если есть)
	if err := handlers.LoadTodos(); err != nil {
		log.Printf("warning: cannot load todos: %v", err)
	}

	r := mux.NewRouter()

	handler := middleware.СorsMiddleware(r)

	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/todos", handlers.ListTodos).Methods("GET")
	api.HandleFunc("/todos", handlers.CreateTodo).Methods("POST")
	api.HandleFunc("/todos/{id:[0-9]+}", handlers.GetTodo).Methods("GET")
	api.HandleFunc("/todos/{id:[0-9]+}", handlers.UpdateTodo).Methods("PUT")
	api.HandleFunc("/todos/{id:[0-9]+}", handlers.DeleteTodo).Methods("DELETE")

	port := os.Getenv("PORT")
	if port == "" {
		port = "6060" // Default port if not set
	}
	addr := ":" + port
	log.Printf("Server running at %s (open http://localhost:%s)", addr, port)
	log.Fatal(http.ListenAndServe(addr, handler))
}
