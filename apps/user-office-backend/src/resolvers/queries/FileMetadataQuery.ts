import { Ctx, Query, Resolver, Arg } from 'type-graphql';

import { ResolverContext } from '../../context';
import { FileMetadata } from '../types/FileMetaData';

@Resolver()
export class FileMetadataQuery {
  @Query(() => FileMetadata, { nullable: true })
  fileMetadata(
    @Ctx() context: ResolverContext,
    @Arg('fileId', () => String) fileId: string
  ) {
    return context.queries.file.getFileMetadata(fileId);
  }
}
