const blogsRouter = require("express").Router()
const Blog = require("../models/blog")
const User = require("../models/user")
const middleware = require('../utils/middleware') // <-- asegúrate de importar esto
const jwt = require('jsonwebtoken')

// GET blogs
blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 })
  response.json(blogs)
})

// POST blog (💥 aquí aplica middlewares)
blogsRouter.post("/", middleware.tokenExtractor, middleware.userExtractor, async (request, response, next) => {
  try {
    const body = request.body
    const user = request.user

    const blog = new Blog({
      ...body,
      user: user._id
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete('/:id', middleware.tokenExtractor, middleware.userExtractor, async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
    console.log('blog to delete:', blog)
    console.log('req.user.id:', req.user.id)

    if (!blog) {
      return res.status(404).end()
    }

    if (!blog.user || blog.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'unauthorized' })
    }

    await blog.deleteOne()
    res.status(204).end()
  } catch (error) {
    console.error('Error deleting blog:', error)
    next(error)
  }
})

// PUT blog
blogsRouter.put("/:id", async (request, response, next) => {
  try {
    const { title, author, url, likes } = request.body

    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      { title, author, url, likes },
      { new: true, runValidators: true, context: "query" },
    )

    response.json(updatedBlog)
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter