package handlers

import (
    "go-practice/models"
    "go-practice/store"
    "encoding/json"
    "net/http"
)

func CreateTaskHandler(store *store.InMemoryStore) (http.HandlerFunc, error) {
    return func(w http.ResponseWriter, r *http.Request) {
        var t models.Task
        if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
            http.Error(w, "bad request", http.StatusBadRequest); return
        }
        created := store.Create(&t)
        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(created)
    }, nil
}

func GetAllTasksHandler(store *store.InMemoryStore) (http.HandlerFunc, error) {
    return func(w http.ResponseWriter, r *http.Request) {
        tasks := store.GetAll()
        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(tasks)
    }, nil
}
