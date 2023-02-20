import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../../context';
import { Template } from '../../types/Template';

@ArgsType()
export class CreateTopicArgs {
  @Field(() => Int)
  templateId: number;

  @Field(() => Int, { nullable: true })
  sortOrder: number;

  @Field(() => Int, { nullable: true })
  title?: string;
}

@Resolver()
export class CreateTopicMutation {
  @Mutation(() => Template)
  createTopic(@Args() args: CreateTopicArgs, @Ctx() context: ResolverContext) {
    return context.mutations.template.createTopic(context.user, args);
  }
}
