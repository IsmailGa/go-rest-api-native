package store

import (
	// "errors"
	"sync"
	"time"

	"go-practice/models"
)

type InMemoryStore struct {
	mu     sync.Mutex
	nextID int
	items  map[int]*models.Task
}

func NewInMemoryStore() *InMemoryStore {
	mockData := []*models.Task{
		{ID: 1, Title: "Task 1", Description: "Description 1", CreatedAt: time.Now()},
		{ID: 2, Title: "Task 2", Description: "Description 2", CreatedAt: time.Now()},
	}

	store := &InMemoryStore{nextID: 1, items: make(map[int]*models.Task)}
	for _, task := range mockData {
		store.Create(task)
	}
	return store
}

func (s *InMemoryStore) Create(t *models.Task) *models.Task {
	s.mu.Lock()
	defer s.mu.Unlock()
	t.ID = s.nextID
	s.nextID++
	t.CreatedAt = time.Now()
	s.items[t.ID] = t
	return t
}

func (s *InMemoryStore) GetAll() []*models.Task {
	s.mu.Lock()
	defer s.mu.Unlock()
	var tasks []*models.Task
	for _, task := range s.items {
		tasks = append(tasks, task)
	}
	return tasks
}

// ... GetAll, GetByID, Update, Delete аналогично
