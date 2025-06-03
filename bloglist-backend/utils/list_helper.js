const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null;

  return blogs.reduce((max, blog) =>
    blog.likes > max.likes ? blog : max
  );
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null;

  const counts = {};
  blogs.forEach((blog) => {
    counts[blog.author] = (counts[blog.author] || 0) + 1;
  });

  const author = Object.keys(counts).reduce((a, b) =>
    counts[a] > counts[b] ? a : b
  );

  return { author, blogs: counts[author] };
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null;

  const likeSums = {};
  blogs.forEach((blog) => {
    likeSums[blog.author] = (likeSums[blog.author] || 0) + blog.likes;
  });

  const author = Object.keys(likeSums).reduce((a, b) =>
    likeSums[a] > likeSums[b] ? a : b
  );

  return { author, likes: likeSums[author] };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
