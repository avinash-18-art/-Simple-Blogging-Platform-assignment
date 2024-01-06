package controllers

import (
	database "App/database"
	models "App/models"
	"database/sql"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

var db *sql.DB

func PostBlog(c *gin.Context) {
	// Initialize the database connection
	db, err := database.InitDB()
	if err != nil {
		log.Printf("Error initializing the database: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	defer db.Close()

	// Bind the JSON data to the newPost struct
	var newPost models.Article
	if err := c.ShouldBindJSON(&newPost); err != nil {
		log.Printf("Error in binding post data: %s", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Define the SQL query for inserting a new blog post
	query := `INSERT INTO blogPosts (title, content) VALUES (?, ?)`

	// Prepare and execute the SQL statement
	stmt, err := db.Prepare(query)
	if err != nil {
		log.Printf("Error preparing SQL statement: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	defer stmt.Close()

	_, err = stmt.Exec(newPost.Title, newPost.Content)
	if err != nil {
		log.Printf("Error inserting new blog post: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Blog added successfully"})
}

func GetAllPosts(c *gin.Context) {
	// Initialize the database connection
	db, err := database.InitDB()
	if err != nil {
		log.Printf("Error initializing the database: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	defer db.Close()

	// Define the SQL query for retrieve all blog posts
	rows, err := db.Query("SELECT * FROM blogposts")
	if err != nil {
		log.Printf("Error in retrieving blog posts data: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	defer rows.Close()

	var posts []models.Article
	for rows.Next() {
		var post models.Article
		err = rows.Scan(&post.ID, &post.Title, &post.Content)
		if err != nil {
			log.Printf("Error in scanning data: %s", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			return
		}
		posts = append(posts, post)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Error in retrieving rows: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.JSON(http.StatusOK, posts)
}

func GetPostsByUserID(c *gin.Context) {
	userIDStr := c.Param("userID")

	// Parse the userIDStr to an integer
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		log.Printf("Error converting userID to int: %s", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Initialize the database connection
	db, err := database.InitDB()
	if err != nil {
		log.Printf("Error initializing the database: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	defer db.Close()

	// Define the SQL query for retrieve blog posts by user ID
	rows, err := db.Query("SELECT * FROM blogposts WHERE id=?", userID)
	if err != nil {
		log.Printf("Error in retrieving blog posts data: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	defer rows.Close()

	var posts []models.Article
	for rows.Next() {
		var post models.Article
		err = rows.Scan(&post.ID, &post.Title, &post.Content)
		if err != nil {
			log.Printf("Error in scanning data: %s", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			return
		}
		posts = append(posts, post)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Error in retrieving rows: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.JSON(http.StatusOK, posts)
}

func UpdateUserPostByID(c *gin.Context) {
	// Initialize the database connection
	db, err := database.InitDB()
	if err != nil {
		log.Printf("Error initializing the database: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	defer db.Close()

	var updateUserPost models.Article
	err = c.BindJSON(&updateUserPost)
	if err != nil {
		log.Printf("Error in binding post data: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Check if the blog post with the specified ID exists in the database.
	var existingPostID int
	err = db.QueryRow("SELECT id FROM blogposts WHERE id=?", updateUserPost.ID).Scan(&existingPostID)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Blog post not found"})
			return
		}
		log.Printf("Error in checking post existence: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// Define the SQL query for Update the blog post with the specified ID
	query := `UPDATE blogposts SET title=?, content=? WHERE id=?`
	_, err = db.Exec(query, updateUserPost.Title, updateUserPost.Content, updateUserPost.ID)
	if err != nil {
		log.Printf("Error in updating data: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User post updated successfully"})
}

func DeleteUserPost(c *gin.Context) {
	// Initialize the database connection
	db, err := database.InitDB()
	if err != nil {
		log.Printf("Error initializing the database: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	defer db.Close()

	var deleteUserPost models.Article
	err = c.BindJSON(&deleteUserPost)
	if err != nil {
		log.Printf("Error in binding post data: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// Define the SQL query for deleting specified post by id in the database
	result, err := db.Exec("DELETE FROM blogposts WHERE id=?", deleteUserPost.ID)
	if err != nil {
		log.Printf("Error in deleting user post: %s", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blog post not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User post successfully deleted"})
}