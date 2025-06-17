const { test, describe } = require('node:test');
const assert = require('node:assert');
const listHelper = require('../utils/list_helper');

describe('favorite blog', () => {
  const blogs = [
    {
      _id: '1',
      title: 'First blog',
      author: 'Author One',
      url: 'http://example.com/1',
      likes: 3,
      __v: 0
    },
    {
      _id: '2',
      title: 'Second blog',
      author: 'Author Two',
      url: 'http://example.com/2',
      likes: 7,
      __v: 0
    },
    {
      _id: '3',
      title: 'Third blog',
      author: 'Author Three',
      url: 'http://example.com/3',
      likes: 5,
      __v: 0
    }
  ];

  test('returns the blog with the most likes', () => {
    const result = listHelper.favoriteBlog(blogs);
    assert.deepStrictEqual(result, blogs[1]);
  });
});

describe('most blogs', () => {
  const blogs = [
    { author: 'Robert C. Martin', likes: 3 },
    { author: 'Robert C. Martin', likes: 5 },
    { author: 'Robert C. Martin', likes: 1 },
    { author: 'Edsger W. Dijkstra', likes: 12 },
    { author: 'Edsger W. Dijkstra', likes: 5 },
    { author: 'Someone Else', likes: 2 },
  ];

  test('returns author with most blog posts', () => {
    const result = listHelper.mostBlogs(blogs);
    assert.deepStrictEqual(result, {
      author: 'Robert C. Martin',
      blogs: 3,
    });
  });
});

describe('most likes', () => {
  const blogs = [
    { author: 'Robert C. Martin', likes: 3 },
    { author: 'Robert C. Martin', likes: 5 },
    { author: 'Robert C. Martin', likes: 1 },
    { author: 'Edsger W. Dijkstra', likes: 12 },
    { author: 'Edsger W. Dijkstra', likes: 5 },
    { author: 'Someone Else', likes: 20 },
  ];

  test('returns author with most total likes', () => {
    const result = listHelper.mostLikes(blogs);
    assert.deepStrictEqual(result, {
      author: 'Someone Else',
      likes: 20,
    });
  });
});

test('si likes no se define, se establece en 0', async () => {
  const newBlog = {
    title: 'Blog sin likes',
    author: 'Autor sin likes',
    url: 'http://nolikes.com',
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  expect(response.body.likes).toBe(0)
})

test('blog sin title es rechazado con status 400', async () => {
  const newBlog = {
    author: 'Autor sin título',
    url: 'http://sin-titulo.com',
    likes: 3
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('blog sin url es rechazado con status 400', async () => {
  const newBlog = {
    title: 'Título sin URL',
    author: 'Autor sin url',
    likes: 4
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})
