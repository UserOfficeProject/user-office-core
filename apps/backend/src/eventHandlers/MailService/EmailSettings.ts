export default interface EmailSettings extends CreateTransmission {
  content: {
    template_id: string;
  };
  recipients: (
    | {
        address: string;
      }
    | {
        address: {
          email: string;
          header_to: string;
        };
      }
  )[];
  // eslint-disable-next-line semi
}

interface BaseRecipient {
  /** SparkPost Enterprise API only. Email to use for envelope FROM. */
  return_path?: string | undefined;
  /** Array of text labels associated with a recipient. */
  tags?: string[] | undefined;
  /** Key/value pairs associated with a recipient. */
  metadata?: unknown;
  /** Key/value pairs associated with a recipient that are provided to the substitution engine. */
  substitution_data?: unknown;
}

interface MultichannelAddress {
  /** The communication channel used to reach recipient. Valid values are “email”, “gcm”, “apns”. */
  channel: string;
  /** Valid email address. Required if channel is “email”. */
  email: string;
  /** User-friendly name for the email address. Used when channel is “email” */
  name: string;
  /** Email address to display in the “To” header instead of address.email (for BCC). Used when channel is “email” */
  header_to: string;
  /** SparkPost Enterprise API only. Required if channel is “gcm” or “apns” */
  token: string;
  /** SparkPost Enterprise API only. Required if channel is “gcm” or “apns” */
  app_id: string;
}

interface Address {
  /** Valid email address */
  email: string;
  /** User-friendly name for the email address */
  name?: string | undefined;
  /** Email address to display in the “To” header instead of address.email (for CC and BCC) */
  header_to?: string | undefined;
}

interface RecipientWithAddress {
  /** Address information for a recipient  At a minimum, address or multichannel_addresses is required. */
  address: Address | string;
}
interface RecipientWithMultichannelAddresses {
  /**
   * Address information for a recipient. At a minimum, address or multichannel_addresses is required.
   * If both address and multichannel_addresses are specified only multichannel_addresses will be used.
   *
   */
  address?: Address | string | undefined;
  /**
   * Array of Multichannel Address objects for a recipient. At a minimum, address or multichannel_addresses is required.
   * If both address and multichannel_addresses are specified only multichannel_addresses will be used.
   *
   */
  multichannel_addresses: MultichannelAddress[];
}
type Recipient = (RecipientWithAddress | RecipientWithMultichannelAddresses) &
  BaseRecipient;

interface TransmissionOptions {
  /** Delay generation of messages until this datetime. */
  start_time?: string | undefined;
  /** Whether open tracking is enabled for this transmission */
  open_tracking?: boolean | undefined;
  /** Whether click tracking is enabled for this transmission */
  click_tracking?: boolean | undefined;
  /** Whether message is transactional or non-transactional for unsubscribe and suppression purposes */
  transactional?: boolean | undefined;
  /** Whether or not to use the sandbox sending domain */
  sandbox?: boolean | undefined;
  /** SparkPost Enterprise API only: Whether or not to ignore customer suppression rules, for this transmission only. Only applicable if your configuration supports this parameter. */
  skip_suppression?: boolean | undefined;
  /** The ID of a dedicated IP pool associated with your account ( Note: SparkPost only ). */
  ip_pool?: string | undefined;
  /** Whether or not to perform CSS inlining in HTML content */
  inline_css?: boolean | undefined;
}

interface PushData {
  /** payload for APNs messages */
  apns?: unknown;
  /** payload for GCM messages */
  gcm?: unknown;
}

interface Attachment {
  /**
   * The MIME type of the attachment; e.g., “text/plain”, “image/jpeg”, “audio/mp3”, “video/mp4”, “application/msword”, “application/pdf”, etc.,
   * including the “charset” parameter (text/html; charset=“UTF-8”) if needed.
   * The value will apply “as-is” to the “Content-Type” header of the generated MIME part for the attachment.
   *
   */
  type: string;
  /**   The filename of the attachment (for example, “document.pdf”). This is inserted into the filename parameter of the Content-Disposition header. */
  name: string;
  /**
   * The content of the attachment as a Base64 encoded string.
   * The string should not contain \r\n line breaks.
   * The SparkPost systems will add line breaks as necessary to ensure the Base64 encoded lines contain no more than 76 characters each.
   *
   */
  data: string;
}

interface InlineContent {
  /** HTML content for the email’s text/html MIME part  At a minimum, html, text, or push is required. */
  html?: string | undefined;
  /** Text content for the email’s text/plain MIME part  At a minimum, html, text, or push is required. */
  text?: string | undefined;
  /**  Content of push notifications  At a minimum, html, text, or push is required.  SparkPost Enterprise API only. */
  push?: PushData | undefined;
  /** Email subject line  required for email transmissions  Expected in the UTF-8 charset without RFC2047 encoding. Substitution syntax is supported. */
  subject?: string | undefined;
  /** "deals@company.com" or JSON object composed of the “name” and “email” fields “from” : { “name” : “My Company”, “email” : "deals@company.com" } used to compose the email’s “From” header */
  from?: string | { email: string; name: string } | undefined;
  /** Email address used to compose the email’s “Reply-To” header */
  reply_to?: string | undefined;
  /** JSON dictionary containing headers other than “Subject”, “From”, “To”, and “Reply-To” */
  headers?: unknown;
  /** JSON array of attachments. */
  attachments?: Attachment[] | undefined;
  /** JSON array of inline images. */
  inline_images?: Attachment[] | undefined;
}

export interface CreateTransmission {
  /** JSON object in which transmission options are defined */
  options?: TransmissionOptions | undefined;
  /**
   * Recipients to receive a carbon copy of the transmission
   *
   */
  cc?: Recipient[] | undefined;
  /**
   * Recipients to discreetly receive a carbon copy of the transmission
   *
   */
  bcc?: Recipient[] | undefined;
  /** Inline recipient objects or object containing stored recipient list ID */
  recipients?: Recipient[] | { list_id: string } | undefined;
  /** Name of the campaign */
  campaign_id?: string | undefined;
  /** Description of the transmission */
  description?: string | undefined;
  /** Transmission level metadata containing key/value pairs */
  metadata?: unknown;
  /** Key/value pairs that are provided to the substitution engine */
  substitution_data?: unknown;
  /** SparkPost Enterprise API only: email to use for envelope FROM */
  return_path?: string | undefined;
  /** Content that will be used to construct a message */
  content:
    | InlineContent
    | { template_id: string; use_draft_template?: boolean | undefined }
    | { email_rfc822: string };
}
