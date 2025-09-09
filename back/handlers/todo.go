package handlers

import (
	"todo-go/types"
	"sync"
	"sync/atomic"
	"encoding/json"
	"log"
	"net/http"
	"time"
	"github.com/gorilla/mux"
	"strconv"
	"os"
)	


var (
	todos    = map[int64]*types.Todo{}
	mu       sync.Mutex
	nextID   int64
	dataFile = "todos.json"
)

func ListTodos(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	mu.Lock()
	list := make([]*types.Todo, 0, len(todos))
	for _, t := range todos {
		list = append(list, t)
	}
	mu.Unlock()
	json.NewEncoder(w).Encode(list)
}

func CreateTodo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var payload struct {
		Title string `json:"title"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if payload.Title == "" {
		http.Error(w, "title is required", http.StatusBadRequest)
		return
	}

	id := atomic.AddInt64(&nextID, 1)
	t := &types.Todo{
		ID:        id,
		Title:     payload.Title,
		Completed: false,
		CreatedAt: time.Now(),
	}

	mu.Lock()
	todos[id] = t
	mu.Unlock()

	if err := SaveTodos(); err != nil {
		log.Printf("save error: %v", err)
		// не прерываем создание, но логируем
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(t)
}

func GetTodo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	id, err := ParseID(r)
	if err != nil {
		http.Error(w, "bad id", http.StatusBadRequest)
		return
	}
	mu.Lock()
	t, ok := todos[id]
	mu.Unlock()
	if !ok {
		http.NotFound(w, r)
		return
	}
	json.NewEncoder(w).Encode(t)
}

func UpdateTodo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	id, err := ParseID(r)
	if err != nil {
		http.Error(w, "bad id", http.StatusBadRequest)
		return
	}

	var payload struct {
		Title     *string `json:"title,omitempty"`
		Completed *bool   `json:"completed,omitempty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	mu.Lock()
	t, ok := todos[id]
	if !ok {
		mu.Unlock()
		http.NotFound(w, r)
		return
	}
	if payload.Title != nil {
		t.Title = *payload.Title
	}
	if payload.Completed != nil {
		t.Completed = *payload.Completed
	}
	mu.Unlock()

	if err := SaveTodos(); err != nil {
		log.Printf("save error: %v", err)
	}

	json.NewEncoder(w).Encode(t)
}

func DeleteTodo(w http.ResponseWriter, r *http.Request) {
	id, err := ParseID(r)
	if err != nil {
		http.Error(w, "bad id", http.StatusBadRequest)
		return
	}
	mu.Lock()
	_, ok := todos[id]
	if ok {
		delete(todos, id)
	}
	mu.Unlock()

	if !ok {
		http.NotFound(w, r)
		return
	}

	if err := SaveTodos(); err != nil {
		log.Printf("save error: %v", err)
	}
	w.WriteHeader(http.StatusNoContent)
}

// ----- helpers -----

func ParseID(r *http.Request) (int64, error) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	return strconv.ParseInt(idStr, 10, 64)
}

func SaveTodos() error {
	mu.Lock()
	list := make([]*types.Todo, 0, len(todos))
	for _, t := range todos {
		list = append(list, t)
	}
	mu.Unlock()

	b, err := json.MarshalIndent(list, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(dataFile, b, 0644)
}

func LoadTodos() error {
	if _, err := os.Stat(dataFile); os.IsNotExist(err) {
		return nil
	}
	b, err := os.ReadFile(dataFile)
	if err != nil {
		return err
	}
	var list []*types.Todo
	if err := json.Unmarshal(b, &list); err != nil {
		return err
	}
	var maxID int64 = 0
	mu.Lock()
	for _, t := range list {
		todos[t.ID] = t
		if t.ID > maxID {
			maxID = t.ID
		}
	}
	mu.Unlock()
	atomic.StoreInt64(&nextID, maxID)
	return nil
}
