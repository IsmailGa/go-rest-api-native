package main

import (
	"fmt"
	"go-practice/handlers"
	"go-practice/store"
	"net/http"
)

func main() {
	// создаём одно общее хранилище, чтобы задачи сохранялись между запросами
	taskStore := store.NewInMemoryStore()

	http.HandleFunc("/tasks", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			handler, err := handlers.CreateTaskHandler(taskStore)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			handler(w, r)
		case http.MethodGet:
			handler, err := handlers.GetAllTasksHandler(taskStore)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			handler(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	fmt.Println("Server started on :8080")
	http.ListenAndServe(":8080", nil)
}