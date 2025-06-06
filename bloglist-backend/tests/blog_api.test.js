const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  const initialBlog = new Blog({
    title: 'Initial Blog',
    author: 'Andrés',
    url: 'http://example.com',
    likes: 5
  })
  await initialBlog.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(1)
})

test('el identificador único del blog se llama id', async () => {
  const response = await api.get('/api/blogs')
  const blog = response.body[0]
  expect(blog.id).toBeDefined()
})

const initialBlogs = [
  {
    title: 'Blog inicial 1',
    author: 'Autor 1',
    url: 'http://ejemplo1.com',
    likes: 1,
  },
  {
    title: 'Blog inicial 2',
    author: 'Autor 2',
    url: 'http://ejemplo2.com',
    likes: 2,
  },
]

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Nuevo blog',
    author: 'Autor nuevo',
    url: 'http://nuevo.com',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await Blog.find({})
  expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)

  const titles = blogsAtEnd.map(b => b.title)
  expect(titles).toContain('Nuevo blog')
})

afterAll(async () => {
  await mongoose.connection.close()
})
