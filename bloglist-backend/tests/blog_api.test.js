const supertest = require("supertest")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const app = require("../app")
const api = supertest(app)

const Blog = require("../models/blog")
const User = require("../models/user")
const helper = require("./test_helper")

const initialBlogs = [
  {
    title: "Blog inicial 1",
    author: "Autor 1",
    url: "http://ejemplo1.com",
    likes: 1,
  },
  {
    title: "Blog inicial 2",
    author: "Autor 2",
    url: "http://ejemplo2.com",
    likes: 2,
  },
]

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)

  await User.deleteMany({})
  const passwordHash = await bcrypt.hash("sekret", 10)
  const user = new User({ username: "root", passwordHash })
  await user.save()
})

test("blogs are returned as json", async () => {
  await api.get("/api/blogs").expect(200).expect("Content-Type", /application\/json/)
})

test("all blogs are returned", async () => {
  const response = await api.get("/api/blogs")
  expect(response.body).toHaveLength(initialBlogs.length)
})

test("el identificador único del blog se llama id", async () => {
  const response = await api.get("/api/blogs")
  const blog = response.body[0]
  expect(blog.id).toBeDefined()
})

test("a valid blog can be added", async () => {
  const newBlog = {
    title: "Nuevo blog",
    author: "Autor nuevo",
    url: "http://nuevo.com",
    likes: 5,
  }

  await api.post("/api/blogs").send(newBlog).expect(201).expect("Content-Type", /application\/json/)

  const blogsAtEnd = await Blog.find({})
  expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)

  const titles = blogsAtEnd.map((b) => b.title)
  expect(titles).toContain("Nuevo blog")
})

test("blog sin title es rechazado con status 400", async () => {
  const newBlog = {
    author: "Autor sin título",
    url: "http://sin-titulo.com",
    likes: 3,
  }

  await api.post("/api/blogs").send(newBlog).expect(400)
})

test("blog sin url es rechazado con status 400", async () => {
  const newBlog = {
    title: "Título sin URL",
    author: "Autor sin url",
    likes: 4,
  }

  await api.post("/api/blogs").send(newBlog).expect(400)
})

test("a blog can be updated", async () => {
  const blogsAtStart = await Blog.find({})
  const blogToUpdate = blogsAtStart[0]

  const updatedData = {
    ...blogToUpdate.toJSON(),
    likes: blogToUpdate.likes + 10,
  }

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedData)
    .expect(200)
    .expect("Content-Type", /application\/json/)

  expect(response.body.likes).toBe(blogToUpdate.likes + 10)
})

test("a blog can be deleted", async () => {
  const blogsAtStart = await Blog.find({})
  const blogToDelete = blogsAtStart[0]

  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

  const blogsAtEnd = await Blog.find({})
  expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1)

  const titles = blogsAtEnd.map((b) => b.title)
  expect(titles).not.toContain(blogToDelete.title)
})

describe("when there is initially one user in db", () => {
  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    }

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    expect(usernames).toContain(newUser.username)
  })
})

test('creation fails with proper statuscode and message if password too short', async () => {
  const newUser = {
    username: 'shortpass',
    name: 'Short Password',
    password: 'pw',
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)

  expect(result.body.error).toContain('password must be at least 3 characters long')
})

describe('creating users with invalid data', () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })

  test('fails if username is missing', async () => {
    const newUser = {
      name: 'No Username',
      password: 'validpass'
    }

    const result = await api.post('/api/users').send(newUser).expect(400)
    expect(result.body.error).toContain('Username and password are required')
  })

  test('fails if password is missing', async () => {
    const newUser = {
      username: 'nousername',
      name: 'No Password'
    }

    const result = await api.post('/api/users').send(newUser).expect(400)
    expect(result.body.error).toContain('Username and password are required')
  })

  test('fails if username is too short', async () => {
    const newUser = {
      username: 'ab',
      password: 'validpass'
    }

    const result = await api.post('/api/users').send(newUser).expect(400)
    expect(result.body.error).toContain('at least 3 characters')
  })

  test('fails if password is too short', async () => {
    const newUser = {
      username: 'validuser',
      password: 'ab'
    }

    const result = await api.post('/api/users').send(newUser).expect(400)
    expect(result.body.error).toContain('at least 3 characters')
  })

  test('fails if username is not unique', async () => {
    const user = new User({ username: 'existinguser', passwordHash: '12345' })
    await user.save()

    const newUser = {
      username: 'existinguser',
      password: 'validpass'
    }

    const result = await api.post('/api/users').send(newUser).expect(400)
    expect(result.body.error).toContain('Username must be unique')
  })
})


test('un nuevo usuario puede ser creado', async () => {
  const newUser = {
    username: 'andresito',
    name: 'Andrés Pro',
    password: '1234'
  }

  const response = await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  expect(response.body.username).toBe('andresito')
})

afterAll(async () => {
  await mongoose.connection.close()
})