import { Ctx, Query, Resolver, Arg, Field, InputType } from 'type-graphql';

import { ResolverContext } from '../../context';
import { FileMetadata } from '../types/FileMetaData';

@InputType()
export class FilesMetadataFilter {
  @Field(() => [String])
  public fileIds?: string[];
}

@Resolver()
export class FilesMetadataQuery {
  @Query(() => [FileMetadata])
  filesMetadata(
    @Ctx() context: ResolverContext,
    @Arg('filter', () => FilesMetadataFilter) filter: FilesMetadataFilter
  ) {
    return context.queries.file.getFilesMetadata(filter);
  }
}
