import { ObjectId, OptionalId } from "mongodb"

export type User = OptionalId<{
    name: string
    password: string
    email: string
    posts: ObjectId[]
    comments: ObjectId[]
    likedPosts: ObjectId[]
}>
   
export type Post = OptionalId<{
    content: string
    author: ObjectId
    comments: ObjectId[]
    likes: ObjectId[]
}>
   
export type Comment = OptionalId<{ 
    text: string
    author: ObjectId
    post: ObjectId
}>
