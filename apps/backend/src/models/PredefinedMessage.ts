/**
 * NOTE: Predefined messages are used as a way to reuse some messages that are repeatable throughout the app.
 * For example feedback inputs, comments and other messages that are quite generic can be just selected from a list of predefined messages.
 * In the frontend we are going to have one component called FormikUIPredefinedMessagesTextField.
 * This is Textarea which is loading all predefined messages from the database filtered by some specific key.
 * It is easy to just search and select the message you want to use for that specific form input.
 */
export class PredefinedMessage {
  constructor(
    public id: number,
    public title: string,
    public message: string,
    public dateModified: Date,
    public lastModifiedBy: number
  ) {}
}
