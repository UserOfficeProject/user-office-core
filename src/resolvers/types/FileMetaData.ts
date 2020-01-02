import { FileMetadata as FileMetaDataOrigin } from "../../models//Blob";
import { Field, Int, ObjectType } from "type-graphql";
@ObjectType()
export class FileMetadata implements Partial<FileMetaDataOrigin> {
  @Field()
  public originalFileName: string;

  @Field()
  public mimeType: string;

  @Field(() => Int)
  public sizeInBytes: number;

  @Field()
  public createdDate: Date;

  @Field()
  public fileId: string;
}
