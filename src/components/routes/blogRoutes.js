package routes

import (
	controllers "App/controllers"

	"github.com/gin-gonic/gin"
)

func SetupBlogRoutes(r *gin.Engine) {
	r.POST("/postNewBlog", controllers.PostBlog)
	r.GET("/getAllBlogsposts", controllers.GetAllPosts)
	r.GET("/getBlogpostByID/:userID", controllers.GetPostsByUserID)
	r.PUT("/updateBlogpostByID", controllers.UpdateUserPostByID)
	r.DELETE("/deleteBlogpostByID", controllers.DeleteUserPost)
}