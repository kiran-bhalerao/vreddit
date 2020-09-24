import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsPositive,
  Length
} from 'class-validator'
import { Post, User } from 'generated/type-graphql'
import { ArgsType, Field, Int, ObjectType } from 'type-graphql'

@ObjectType()
export class AuthResp {
  @Field()
  token!: string

  @Field(() => User)
  user!: User
}

@ArgsType()
export class LoginArgs {
  @Field()
  @IsEmail()
  email!: string

  @Field()
  @Length(2, 50)
  password!: string
}

@ArgsType()
export class UpdateProfileArgs {
  @Field()
  @Length(2, 100)
  bio!: string

  @Field()
  @Length(2, 50)
  name!: string
}

@ArgsType()
export class SignupArgs extends LoginArgs {
  @Field()
  @Length(2, 100)
  bio!: string

  @Field()
  @Length(2, 50)
  name!: string
}

@ArgsType()
export class CreatePostArgs {
  @Field()
  @Length(2, 100)
  title!: string

  @Field()
  @Length(2, 500)
  content!: string

  @Field()
  published!: boolean
}

@ArgsType()
export class UpdatePostArgs {
  @Field()
  @IsNumber()
  @IsPositive()
  id!: number

  @Field({ nullable: true })
  @Length(2, 100)
  @IsOptional()
  title?: string

  @Field({ nullable: true })
  @Length(2, 500)
  @IsOptional()
  content?: string

  @Field({ nullable: true })
  @IsOptional()
  published?: boolean
}

@ArgsType()
export class PostsArgs {
  @Field(() => Int, { nullable: true })
  id?: number

  @Field(() => Int)
  take!: number
}

@ObjectType()
export class Posts {
  @Field(() => Boolean)
  hasMore!: boolean

  @Field(() => [Post])
  posts!: Post[]
}
