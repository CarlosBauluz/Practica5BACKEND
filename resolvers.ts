import { Collection, ObjectId } from "mongodb";
import { User, Post, Comment } from "./types.ts";
import { GraphQLError } from "graphql";

type Context = {
    userCollection: Collection<User>
    postCollection: Collection<Post>
    commentCollection: Collection<Comment>
}

type MutationArgsUser = {
    id : string,
    name: String
    password: String
    email: String
    posts: Post[]
    comments: Comment[]
    likedPosts: Post[]
}

type MutationArgsPost = {
    id: String
    content: String
    author: User
    comments: Comment[]
    likes: User[]
}

type MutationArgsComment = {
    id: String
    text: String
    author: User
    post: Post
}

export const resolvers = {
    User: {
        id : (parent: User) => parent._id?.toString(),
        posts: async (parent: User,_:unknown, context: Context)=>{
            const result =await context.postCollection.find({_id: {$in: parent.posts}}).toArray()
            return result
        },
        comments: async (parent: User,_:unknown, context: Context)=>{
            const result =await context.commentCollection.find({_id: {$in: parent.comments}}).toArray()
            return result
            
        },
        likedPosts: async (parent: User,_:unknown, context: Context)=>{
            const result =await context.postCollection.find({_id: {$in: parent.likedPosts}}).toArray()
            return result
        },
    },

    Post: {
        id : (parent: Post) => parent._id?.toString(),
        comments: async (parent: Post,_:unknown, context: Context)=>{
            const result =await context.commentCollection.findOne({_id: {$in: parent.comments}})
            return result
        },
        author :  async (parent: Post,_:unknown, context: Context)=>{
            const result =await context.userCollection.findOne({_id: parent.author})
            return result
        },
        likes: async (parent: Post,_:unknown, context: Context)=>{
            const result =await context.userCollection.findOne({_id: {$in: parent.likes}})
            return result
        },
    },

    Comment: {
        id : (parent: Comment) => parent._id?.toString(),
        author :  async (parent: Comment,_:unknown, context: Context)=>{
            const result =await context.userCollection.findOne({_id: parent.author})
            console.log(result)
            return result
        },
        post :  async (parent: Comment,_:unknown, context: Context)=>{
            const result =await context.postCollection.findOne({_id: parent.post})
            return result
        },
    },

    Query: {
        users: async(
            _:unknown,
            __: unknown,
            context: Context
        ):Promise <User[]> =>{
            const result = await context.userCollection.find().toArray();
            return result
        },

        user: async(
            _:unknown,
            args: MutationArgsUser,
            context: Context
        ): Promise<User> =>{
            const result = await context.userCollection.findOne({_id: args.id.toString})
            if(!result) throw new GraphQLError("User not found")
            return result
        },

        posts: async(
            _:unknown,
            __: unknown,
            context: Context
        ):Promise <Post[]> =>{
            const result = await context.postCollection.find().toArray();
            return result
        },

        post: async(
            _:unknown,
            args: MutationArgsPost,
            context: Context
        ): Promise<Post> =>{
            const result = await context.postCollection.findOne({_id: args.id.toString})
            if(!result) throw new GraphQLError("Post not found")
            return result
        },

        comments: async(
            _:unknown,
            __: unknown,
            context: Context
        ):Promise <Comment[]> =>{
            const result = await context.commentCollection.find().toArray();
            return result
        },

        comment: async(
            _:unknown,
            args: MutationArgsPost,
            context: Context
        ): Promise<Comment> =>{
            const result = await context.commentCollection.findOne({_id: args.id.toString})
            if(!result) throw new GraphQLError("Comment not found")
            return result
        },
      //  users: [User!]!
      //  user(id: ID!): User
        
      //  posts: [Post!]!
      //  post(id: ID!): Post
        
      //  comments: [Comment!]!
      //  comment(id: ID!): Comment
    },

    Mutation: {
        createUser: async(
            _:unknown,
            args: {name: string, password: string, email: string},
            context: Context
        ): Promise<User> => {
            const {insertedId} = await context.userCollection.insertOne({
                name: args.name, 
                password: args.password,
                email: args.email,
                posts : [],
                comments : [],
                likedPosts: []
            })
            const ususariof = await context.userCollection.findOne({_id: insertedId})
            if(!ususariof) throw new GraphQLError("Post not found")
            
            return ususariof
        },

        updateUser: async(
            _:unknown,
            args: {id: string, name: string, password: string},
            context: Context
        ): Promise<User> =>{
            const result = await context.userCollection.findOneAndUpdate(
                {_id: new ObjectId(args.id)},
                {$set: {...args}},
                {returnDocument: "after"}
            )
            if(!result) throw new GraphQLError("Post not found")
            return result
        },

        deleteUser: async(
            _:unknown,
            args : {id: string},
            context : Context
        ): Promise <boolean> =>{
            const {deletedCount}=await context.userCollection.deleteOne({_id:new ObjectId(args.id)})
            if(deletedCount===0)return false
            return true
        },

        createPost: async(
            _:unknown,
            args: {content: string, author: string},
            context: Context
        ): Promise<Post> => {
            const {insertedId} = await context.postCollection.insertOne({
                content: args.content, 
                author: new ObjectId(args.author),
                comments: [],
                likes: []
            })
            const ususariof = await context.postCollection.findOne({_id: insertedId})
            if(!ususariof) throw new GraphQLError("Post not found")
            
            return ususariof
        },

        updatePost: async(
            _:unknown,
            args: {id: string, content: string},
            context: Context
        ): Promise<Post> =>{
            const result = await context.postCollection.findOneAndUpdate(
                {_id: new ObjectId(args.id)},
                {$set: {...args}},
                {returnDocument: "after"}
            )
            if(!result) throw new GraphQLError("Post not found")
            return result
        },

        deletePost: async(
            _:unknown,
            args : {id: string},
            context : Context
        ): Promise <boolean> =>{
            const {deletedCount}=await context.postCollection.deleteOne({_id:new ObjectId(args.id)})
            if(deletedCount===0)return false
            return true
        },

        addLikeToPost: async(
            _:unknown,
            args: {postId: string, userId: string},
            context: Context
        ): Promise <Post> =>{
            
            const result = await context.postCollection.findOneAndUpdate(
                {_id: new ObjectId(args.postId)},
                {$push: { likes: new ObjectId(args.userId)}},
                {returnDocument: "after"}
            )
            if(!result) throw new GraphQLError("Post not found")
            return result
        },

        removeLikeFromPost: async(
            _:unknown,
            args: {postId: string, userId: string},
            context: Context
        ): Promise <Post> =>{
            
            const result = await context.postCollection.findOneAndUpdate(
                {_id: new ObjectId(args.postId)},
                {$pull: { likes: new ObjectId(args.userId)}},
                {returnDocument: "after"}
            )
            if(!result) throw new GraphQLError("Post not found")
            return result
        },

        createComment: async(
            _:unknown,
            args: {text:string , author: string, post:string},
            context: Context
        ): Promise <Comment>=>{
            const {insertedId} = await context.commentCollection.insertOne({
                text: args.text, 
                author: new ObjectId(args.author),
                post: new ObjectId(args.post), 
            })
            return {
                _id: insertedId,
                text: args.text, 
                author: new ObjectId(args.author),
                post: new ObjectId(args.post), 
            }
        },

        updateComment: async(
            _:unknown,
            args: {id: string, text: string},
            context: Context
        ): Promise<Comment> =>{
            const result = await context.commentCollection.findOneAndUpdate(
                {_id: new ObjectId(args.id)},
                {$set: {...args}},
                {returnDocument: "after"}
            )
            if(!result) throw new GraphQLError("Post not found")
            return result
        },

        deleteComment: async(
            _:unknown,
            args: {id: string},
            context: Context
        ): Promise<boolean>=>{
            const {deletedCount}=await context.commentCollection.deleteOne({_id:new ObjectId(args.id)})
            if(deletedCount===0)return false
            return true
        }



      /*  createUser(input: CreateUserInput!): User!
        updateUser(id: ID!, input: UpdateUserInput!): User!
        deleteUser(id: ID!): Boolean!
       
        createPost(input: CreatePostInput!): Post!
        updatePost(id: ID!, input: UpdatePostInput!): Post!
        deletePost(id: ID!): Boolean!
        
        addLikeToPost(postId: ID!, userId: ID!): Post!
        removeLikeFromPost(postId: ID!, userId: ID!): Post!
        
        createComment(input: CreateCommentInput!): Comment!
        updateComment(id: ID!, input: UpdateCommentInput!): Comment!
        deleteComment(id: ID!): Boolean!*/
      }
}