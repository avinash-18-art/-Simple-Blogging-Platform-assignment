package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

var err error
var db *sql.DB

func InitDB() (*sql.DB, error) {
	err = godotenv.Load()
	if err != nil {
		log.Fatalf("Error in loading .env file :%s", err.Error())
	}

	dbUsername := os.Getenv("DB_USERNAME")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	db, err = sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(localhost:3306)/%s", dbUsername, dbPassword, dbName))
	if err != nil {
		log.Fatalf("Error in connecting to database :%s", err.Error())
		return nil, err
	}

	fmt.Println("Database Connection Successfully")
	CreateTable()

	return db, nil

}

func CreateTable() {
	_, err := db.Exec(`CREATE TABLE IF NOT EXISTS blogPosts(id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, content TEXT);`)
	if err != nil {
		log.Fatalf("Error in Creating Table blogPosts: %s", err.Error())
	}

	fmt.Println("Table blogPosts Creating Successfully")
}