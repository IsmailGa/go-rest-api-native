package main

import (
	"log"
	"todo-go/routes"

	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using default or os variables")
	}

	routes.Routes()
}
