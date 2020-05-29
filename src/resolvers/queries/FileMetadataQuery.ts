import { Ctx, Query, Resolver, Arg } from 'type-graphql';

import { ResolverContext } from '../../context';
import { FileMetadata } from '../types/FileMetaData';
@Resolver()
export class FileMetadataQuery {
  @Query(() => [FileMetadata], { nullable: true })
  fileMetadata(
    @Arg('fileIds', () => [String]) fileIds: string[],
    @Ctx() context: ResolverContext
  ) {
    return context.queries.file.getFileMetadata(fileIds);
  }
}
