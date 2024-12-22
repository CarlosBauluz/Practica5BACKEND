export const schema = `#graphql
type User {
  id: ID!
  name: String!
  password: String!
  email: String!
  posts: [Post!]!
  comments: [Comment!]!
  likedPosts: [Post!]!
}
 
type Post {
  id: ID!
  content: String!
  author: User!
  comments: [Comment!]!
  likes: [User!]!
}
 
type Comment {
  id: ID!
  text: String!
  author: User!
  post: Post!
}

   

type Query {
  users: [User!]!
  user(id: ID!): User
  
  posts: [Post!]!
  post(id: ID!): Post
  
  comments: [Comment!]!
  comment(id: ID!): Comment
}
 

type Mutation {
  createUser(name: String!, email: String!, password: String!): User!
  updateUser(id: ID!, name: String!, password: String!): User!
  deleteUser(id: ID!): Boolean!
 
  createPost(content: String!, author: ID!): Post!
  updatePost(id: ID!, content: String!): Post!
  deletePost(id: ID!): Boolean!
  
  addLikeToPost(postId: ID!, userId: ID!): Post!
  removeLikeFromPost(postId: ID!, userId: ID!): Post!
  
  createComment(text: String!, author: ID!, post:ID!): Comment!
  updateComment(id: ID!, text: String!): Comment!
  deleteComment(id: ID!): Boolean!

}

`